import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { formatBytes } from '../utils/formatBytes'

function FileProgressBar({ name, loaded, total, done }) {
  const percent = total > 0 ? Math.round((loaded / total) * 100) : 0

  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/50 truncate max-w-[70%]">{name}</span>
        <span className="text-xs text-white/30 tabular-nums">
          {done ? formatBytes(total) : `${percent}%`}
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${done
            ? 'bg-emerald-400/80'
            : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${done ? 100 : percent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default function UploadProgress({ fileProgress, overallProgress }) {
  const entries = Object.entries(fileProgress)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Overall progress */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            <span className="text-sm font-medium text-white/80">Hochladen...</span>
          </div>
          <span className="text-sm font-semibold text-white/60 tabular-nums">
            {overallProgress}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 bg-[length:200%_100%]"
            initial={{ width: 0 }}
            animate={{
              width: `${overallProgress}%`,
              backgroundPosition: ['0% 0%', '100% 0%'],
            }}
            transition={{
              width: { duration: 0.5, ease: 'easeOut' },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
            }}
          />
        </div>
      </div>

      {/* Per-file progress */}
      <div className="px-5 pb-4 max-h-48 overflow-y-auto border-t border-white/[0.04] pt-3">
        {entries.map(([path, progress]) => (
          <FileProgressBar
            key={path}
            name={path}
            loaded={progress.loaded}
            total={progress.total}
            done={progress.done}
          />
        ))}
      </div>
    </motion.div>
  )
}
