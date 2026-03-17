import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileArchive, File, Image, Film, Music, FileText, Loader2 } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:3002/api/upload'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext))
    return <Image className="w-4 h-4 text-emerald-400/70" />
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext))
    return <Film className="w-4 h-4 text-purple-400/70" />
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext))
    return <Music className="w-4 h-4 text-amber-400/70" />
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext))
    return <FileText className="w-4 h-4 text-blue-400/70" />
  return <File className="w-4 h-4 text-white/40" />
}

function isPreviewable(name) {
  const ext = name.split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
}

export default function SessionModal({ session, onClose }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    axios.get(`${API}/${session.uploadId}/files`)
      .then(res => setFiles(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session.uploadId])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const downloadFile = (filePath) => {
    const url = `${API}/${session.uploadId}/file/${encodeURIComponent(filePath)}`
    const a = document.createElement('a')
    a.href = url
    a.download = filePath.split('/').pop()
    a.click()
  }

  const downloadZip = () => {
    const a = document.createElement('a')
    a.href = `${API}/${session.uploadId}/zip`
    a.download = `${session.uploadId}.zip`
    a.click()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-[#0d0d1a]/95 backdrop-blur-xl
                     border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-semibold text-white/90">Upload Details</h2>
              <p className="text-xs text-white/35 mt-0.5">
                {session.totalFiles} {session.totalFiles === 1 ? 'Datei' : 'Dateien'} &middot; {formatSize(session.totalSize)}
                &middot; {new Date(session.completedAt).toLocaleDateString('de-CH')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadZip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30
                           text-xs text-violet-300 hover:bg-violet-600/30 transition-colors cursor-pointer"
              >
                <FileArchive className="w-3.5 h-3.5" />
                ZIP
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Image preview */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-white/[0.06]"
              >
                <div className="p-4 flex justify-center bg-black/30">
                  <img
                    src={`${API}/${session.uploadId}/file/${encodeURIComponent(preview)}`}
                    alt={preview}
                    className="max-h-64 rounded-lg object-contain"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File list */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
              </div>
            ) : (
              <div className="space-y-px">
                {files.map((file) => (
                  <motion.div
                    key={file.path}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors
                                ${preview === file.path ? 'bg-white/[0.06]' : ''}`}
                  >
                    <button
                      onClick={() => isPreviewable(file.path) ? setPreview(prev => prev === file.path ? null : file.path) : null}
                      className={`flex items-center gap-3 flex-1 min-w-0 text-left ${isPreviewable(file.path) ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {getFileIcon(file.path)}
                      <span className="text-sm text-white/70 truncate flex-1">
                        {file.path}
                      </span>
                      <span className="text-xs text-white/25 shrink-0">
                        {formatSize(file.size)}
                      </span>
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => downloadFile(file.path)}
                      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/[0.06]
                                 text-white/30 hover:text-white/70 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
