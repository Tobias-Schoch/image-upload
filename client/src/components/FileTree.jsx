import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Folder, FolderOpen, Image, Film, File } from 'lucide-react'
import { formatBytes } from '../utils/formatBytes'

const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif']
const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv', 'm4v']

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (imageExts.includes(ext)) return <Image className="w-4 h-4 text-emerald-400/70" />
  if (videoExts.includes(ext)) return <Film className="w-4 h-4 text-purple-400/70" />
  return <File className="w-4 h-4 text-white/30" />
}

function TreeNode({ node, depth = 0, index = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2)

  if (!node.isDirectory) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02, duration: 0.3 }}
        className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-white/[0.04] transition-colors"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {getFileIcon(node.name)}
        <span className="text-sm text-white/60 truncate flex-1">{node.name}</span>
        {node.file && (
          <span className="text-xs text-white/25 tabular-nums">{formatBytes(node.file.size)}</span>
        )}
      </motion.div>
    )
  }

  return (
    <div>
      <motion.button
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02, duration: 0.3 }}
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-white/[0.04] transition-colors w-full text-left"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        </motion.div>
        {expanded ? (
          <FolderOpen className="w-4 h-4 text-violet-400/70" />
        ) : (
          <Folder className="w-4 h-4 text-violet-400/70" />
        )}
        <span className="text-sm text-white/80 font-medium">{node.name}</span>
        <span className="text-xs text-white/25 ml-auto">
          {node.children.length} {node.children.length === 1 ? 'Element' : 'Elemente'}
        </span>
      </motion.button>

      {expanded && node.children.map((child, i) => (
        <TreeNode key={child.path} node={child} depth={depth + 1} index={i} />
      ))}
    </div>
  )
}

export default function FileTree({ tree, totalFiles, totalSize }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Folder className="w-5 h-5 text-violet-400" />
          <h3 className="text-white/90 font-semibold">{tree.name}</h3>
        </div>
        <span className="text-sm text-white/40">
          {totalFiles} {totalFiles === 1 ? 'Datei' : 'Dateien'} &middot; {formatBytes(totalSize)}
        </span>
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {tree.children.map((child, i) => (
          <TreeNode key={child.path} node={child} index={i} />
        ))}
      </div>
    </motion.div>
  )
}
