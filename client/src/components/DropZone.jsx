import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FolderOpen } from 'lucide-react'

export default function DropZone({ isDragOver, onDragOver, onDragLeave, onDrop }) {
  return (
    <motion.div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="relative cursor-pointer select-none"
      animate={isDragOver ? { scale: 1.02 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Glow effect */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 blur-xl"
          />
        )}
      </AnimatePresence>

      <div
        className={`
          relative rounded-2xl border-2 border-dashed p-16 transition-all duration-300
          flex flex-col items-center justify-center gap-6
          ${isDragOver
            ? 'border-violet-400/60 bg-violet-500/10 shadow-[0_0_60px_-10px_rgba(139,92,246,0.3)]'
            : 'border-white/15 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]'
          }
        `}
      >
        <motion.div
          animate={isDragOver ? { y: -8, scale: 1.1 } : { y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {isDragOver ? (
            <FolderOpen className="w-16 h-16 text-violet-400" strokeWidth={1.5} />
          ) : (
            <Upload className="w-16 h-16 text-white/30" strokeWidth={1.5} />
          )}
        </motion.div>

        <div className="text-center">
          <motion.p
            className="text-lg font-medium"
            animate={isDragOver ? { color: '#a78bfa' } : { color: 'rgba(255,255,255,0.8)' }}
          >
            {isDragOver ? 'Loslassen zum Hochladen' : 'Ordner hierher ziehen'}
          </motion.p>
          <p className="text-sm text-white/40 mt-2">
            Ordner mit Bildern und Videos werden unterstützt
          </p>
        </div>
      </div>
    </motion.div>
  )
}
