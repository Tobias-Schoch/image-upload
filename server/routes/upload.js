const express = require('express')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')

const router = express.Router()
const uploadsDir = path.join(__dirname, '..', 'uploads')

// POST /api/upload/init — Create a new upload session
router.post('/init', (req, res) => {
  const uploadId = uuidv4()
  const uploadPath = path.join(uploadsDir, uploadId)
  fs.mkdirSync(uploadPath, { recursive: true })
  res.json({ uploadId })
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

  // Count files recursively
  let totalFiles = 0
  let totalSize = 0
  function countFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
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

module.exports = router
