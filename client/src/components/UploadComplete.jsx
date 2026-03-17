import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 },
  },
}

const circleVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export default function UploadComplete({ result, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', damping: 20 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 text-center"
    >
      {/* Animated checkmark */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center"
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <motion.circle
                cx="22"
                cy="22"
                r="20"
                stroke="rgb(52, 211, 153)"
                strokeWidth="2"
                strokeLinecap="round"
                variants={circleVariants}
                initial="hidden"
                animate="visible"
              />
              <motion.path
                d="M14 22l6 6 10-12"
                stroke="rgb(52, 211, 153)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                variants={checkmarkVariants}
                initial="hidden"
                animate="visible"
              />
            </svg>
          </motion.div>
          {/* Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.5, 2] }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl"
          />
        </div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-xl font-semibold text-white/90 mb-2"
      >
        Upload abgeschlossen
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-white/40 text-sm mb-6"
      >
        {result?.totalFiles} {result?.totalFiles === 1 ? 'Datei' : 'Dateien'} erfolgreich hochgeladen
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onReset}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10
                   text-sm text-white/70 hover:text-white/90 hover:bg-white/[0.1] transition-colors cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        Weiteren Ordner hochladen
      </motion.button>
    </motion.div>
  )
}
