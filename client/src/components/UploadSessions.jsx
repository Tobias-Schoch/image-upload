import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, FileArchive, Loader2 } from 'lucide-react'
import axios from 'axios'
import SessionModal from './SessionModal'

const API = 'http://localhost:3002/api/upload'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'gerade eben'
  if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`
  if (diff < 86400) return `vor ${Math.floor(diff / 3600)} Std.`
  if (diff < 604800) return `vor ${Math.floor(diff / 86400)} Tagen`
  return date.toLocaleDateString('de-CH')
}

export default function UploadSessions({ refreshTrigger }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setLoading(true)
    axios.get(`${API}/sessions`)
      .then(res => setSessions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshTrigger])

  if (loading && sessions.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
      </div>
    )
  }

  if (sessions.length === 0) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-sm font-medium text-white/30 mb-3 px-1">Bisherige Uploads</h2>
        <div className="space-y-2">
          {sessions.map((session, i) => (
            <motion.button
              key={session.uploadId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelected(session)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]
                         hover:bg-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer text-left group"
            >
              <div className="p-2 rounded-lg bg-violet-500/10">
                <FolderOpen className="w-4 h-4 text-violet-400/60" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white/70 font-medium truncate block">
                  {session.folderName || 'Upload'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-white/30">
                    {session.totalFiles} {session.totalFiles === 1 ? 'Datei' : 'Dateien'}
                  </span>
                  <span className="text-xs text-white/20">&middot;</span>
                  <span className="text-xs text-white/25">{formatSize(session.totalSize)}</span>
                  <span className="text-xs text-white/20">&middot;</span>
                  <span className="text-xs text-white/25">{timeAgo(session.completedAt)}</span>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <FileArchive className="w-4 h-4 text-white/20" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <SessionModal session={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
