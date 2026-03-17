import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Film } from 'lucide-react'

const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif']
const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv']

function isImage(name) {
  return imageExts.includes(name.split('.').pop().toLowerCase())
}

function isVideo(name) {
  return videoExts.includes(name.split('.').pop().toLowerCase())
}

function Thumbnail({ file }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!file || !isImage(file.name)) return
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (isVideo(file?.name)) {
    return (
      <div className="w-full h-full bg-purple-500/10 flex items-center justify-center">
        <Film className="w-6 h-6 text-purple-400/60" />
      </div>
    )
  }

  if (!url) return null

  return (
    <img
      src={url}
      alt={file.name}
      className="w-full h-full object-cover"
    />
  )
}

export default function FilePreview({ files }) {
  const previewFiles = files
    .filter(({ file }) => isImage(file.name) || isVideo(file.name))
    .slice(0, 8)

  if (previewFiles.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5"
    >
      <h3 className="text-white/60 text-sm font-medium mb-4">Vorschau</h3>
      <div className="grid grid-cols-4 gap-2">
        {previewFiles.map(({ file, relativePath }, i) => (
          <motion.div
            key={relativePath}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="aspect-square rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]"
          >
            <Thumbnail file={file} />
          </motion.div>
        ))}
        {files.filter(({ file }) => isImage(file.name) || isVideo(file.name)).length > 8 && (
          <div className="aspect-square rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
            <span className="text-sm text-white/30">
              +{files.filter(({ file }) => isImage(file.name) || isVideo(file.name)).length - 8}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
