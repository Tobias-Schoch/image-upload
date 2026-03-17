const express = require('express')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')
const archiver = require('archiver')

const router = express.Router()
const uploadsDir = path.join(__dirname, '..', 'uploads')

// POST /api/upload/init — Create a new upload session
router.post('/init', (req, res) => {
  const uploadId = uuidv4()
  const uploadPath = path.join(uploadsDir, uploadId)
  fs.mkdirSync(uploadPath, { recursive: true })
  res.json({ uploadId })
})

// GET /api/upload/sessions — List all upload sessions
router.get('/sessions', (req, res) => {
  if (!fs.existsSync(uploadsDir)) {
    return res.json([])
  }

  const entries = fs.readdirSync(uploadsDir, { withFileTypes: true })
  const sessions = []

  for (const entry of entries) {
    if (!entry.isDirectory() || !/^[0-9a-f-]{36}$/.test(entry.name)) continue

    const metadataPath = path.join(uploadsDir, entry.name, 'metadata.json')
    if (!fs.existsSync(metadataPath)) continue

    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
      sessions.push(metadata)
    } catch {
      // skip corrupted metadata
    }
  }

  sessions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  res.json(sessions)
})

// POST /api/upload/:uploadId/file — Upload a single file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { uploadId } = req.params
    const relativePath = req.body.relativePath || file.originalname

    // Validate uploadId to prevent path traversal
    if (!/^[0-9a-f-]{36}$/.test(uploadId)) {
      return cb(new Error('Invalid upload ID'))
    }

    const fileDir = path.join(uploadsDir, uploadId, path.dirname(relativePath))

    // Ensure the resolved path is within uploads directory
    const resolved = path.resolve(fileDir)
    if (!resolved.startsWith(path.resolve(uploadsDir))) {
      return cb(new Error('Invalid path'))
    }

    fs.mkdirSync(fileDir, { recursive: true })
    cb(null, fileDir)
  },
  filename: (req, file, cb) => {
    const relativePath = req.body.relativePath || file.originalname
    cb(null, path.basename(relativePath))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB per file
})

router.post('/:uploadId/file', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  res.json({
    success: true,
    path: req.body.relativePath,
    size: req.file.size,
  })
})

// POST /api/upload/:uploadId/complete — Finalize the upload
router.post('/:uploadId/complete', (req, res) => {
  const { uploadId } = req.params

  if (!/^[0-9a-f-]{36}$/.test(uploadId)) {
    return res.status(400).json({ error: 'Invalid upload ID' })
  }

  const uploadPath = path.join(uploadsDir, uploadId)
  if (!fs.existsSync(uploadPath)) {
    return res.status(404).json({ error: 'Upload not found' })
  }

  // Count files recursively and find folder name
  let totalFiles = 0
  let totalSize = 0
  let folderName = null
  function countFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!folderName) folderName = entry.name
        countFiles(fullPath)
      } else if (entry.name !== 'metadata.json') {
        totalFiles++
        totalSize += fs.statSync(fullPath).size
      }
    }
  }
  countFiles(uploadPath)

  // Write metadata
  const metadata = {
    uploadId,
    folderName: req.body.folderName || folderName || uploadId,
    totalFiles,
    totalSize,
    completedAt: new Date().toISOString(),
  }
  fs.writeFileSync(
    path.join(uploadPath, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  )

  res.json(metadata)
})

// GET /api/upload/:uploadId/files — List all files in a session
router.get('/:uploadId/files', (req, res) => {
  const { uploadId } = req.params
  if (!/^[0-9a-f-]{36}$/.test(uploadId)) {
    return res.status(400).json({ error: 'Invalid upload ID' })
  }

  const uploadPath = path.join(uploadsDir, uploadId)
  if (!fs.existsSync(uploadPath)) {
    return res.status(404).json({ error: 'Upload not found' })
  }

  const files = []
  function walk(dir, prefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), rel)
      } else if (entry.name !== 'metadata.json') {
        const stat = fs.statSync(path.join(dir, entry.name))
        files.push({ path: rel, size: stat.size })
      }
    }
  }
  walk(uploadPath, '')
  files.sort((a, b) => a.path.localeCompare(b.path))
  res.json(files)
})

// GET /api/upload/:uploadId/file/* — Download a single file
router.get('/:uploadId/file/{*filePath}', (req, res) => {
  const { uploadId, filePath } = req.params
  if (!/^[0-9a-f-]{36}$/.test(uploadId)) {
    return res.status(400).json({ error: 'Invalid upload ID' })
  }

  const relativePath = Array.isArray(filePath) ? filePath.join('/') : filePath
  const absPath = path.resolve(path.join(uploadsDir, uploadId, relativePath))

  if (!absPath.startsWith(path.resolve(uploadsDir))) {
    return res.status(400).json({ error: 'Invalid path' })
  }

  if (!fs.existsSync(absPath) || fs.statSync(absPath).isDirectory()) {
    return res.status(404).json({ error: 'File not found' })
  }

  res.download(absPath)
})

// GET /api/upload/:uploadId/zip — Download all files as ZIP
router.get('/:uploadId/zip', (req, res) => {
  const { uploadId } = req.params
  if (!/^[0-9a-f-]{36}$/.test(uploadId)) {
    return res.status(400).json({ error: 'Invalid upload ID' })
  }

  const uploadPath = path.join(uploadsDir, uploadId)
  if (!fs.existsSync(uploadPath)) {
    return res.status(404).json({ error: 'Upload not found' })
  }

  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${uploadId}.zip"`)

  const archive = archiver('zip', { zlib: { level: 5 } })
  archive.pipe(res)

  // Add all files except metadata.json
  function addFiles(dir, prefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const arcPath = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        addFiles(fullPath, arcPath)
      } else if (entry.name !== 'metadata.json') {
        archive.file(fullPath, { name: arcPath })
      }
    }
  }
  addFiles(uploadPath, '')
  archive.finalize()
})

module.exports = router
