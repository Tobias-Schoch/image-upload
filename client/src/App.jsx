import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, RotateCcw } from 'lucide-react'
import Background from './components/Background'
import DropZone from './components/DropZone'
import FileTree from './components/FileTree'
import FilePreview from './components/FilePreview'
import UploadProgress from './components/UploadProgress'
import UploadComplete from './components/UploadComplete'
import UploadSessions from './components/UploadSessions'
import { useFolderDrop } from './hooks/useFolderDrop'
import { useUpload } from './hooks/useUpload'

export default function App() {
  const {
    isDragOver,
    tree,
    files,
    folderName,
    error: dropError,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFolderSelect,
    reset: resetDrop,
  } = useFolderDrop()

  const {
    phase,
    fileProgress,
    overallProgress,
    uploadResult,
    uploadError,
    upload,
    reset: resetUpload,
  } = useUpload()

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const totalSize = files.reduce((sum, { file }) => sum + file.size, 0)

  const handleUpload = () => {
    upload(files, folderName)
  }

  const handleReset = () => {
    resetDrop()
    resetUpload()
    setRefreshTrigger(t => t + 1)
  }

  // State machine: idle → ready → uploading → complete/error
  const state = phase !== 'idle' ? phase : tree ? 'ready' : 'idle'

  return (
    <>
      <Background />

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-2"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
              Folder Upload
            </h1>
            <p className="text-white/35 text-sm mt-1">
              Ordner per Drag & Drop hochladen
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Idle: show drop zone */}
            {state === 'idle' && (
              <motion.div
                key="dropzone"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <DropZone
                  isDragOver={isDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onFolderSelect={handleFolderSelect}
                />
                {dropError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 justify-center text-sm text-red-400/80"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {dropError}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Ready: show tree + preview + upload button */}
            {state === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <FileTree tree={tree} totalFiles={files.length} totalSize={totalSize} />
                <FilePreview files={files} />

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white/50
                               hover:text-white/70 hover:bg-white/[0.06] transition-colors text-sm font-medium cursor-pointer"
                  >
                    Abbrechen
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600
                               hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium text-sm
                               shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
                  >
                    {files.length} {files.length === 1 ? 'Datei' : 'Dateien'} hochladen
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Uploading */}
            {state === 'uploading' && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <UploadProgress
                  fileProgress={fileProgress}
                  overallProgress={overallProgress}
                />
              </motion.div>
            )}

            {/* Complete */}
            {state === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <UploadComplete result={uploadResult} onReset={handleReset} />
              </motion.div>
            )}

            {/* Error */}
            {state === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-red-500/20 rounded-2xl shadow-2xl p-8 text-center"
              >
                <AlertCircle className="w-12 h-12 text-red-400/60 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-white/80 mb-2">Upload fehlgeschlagen</h2>
                <p className="text-sm text-white/40 mb-6">{uploadError}</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10
                             text-sm text-white/70 hover:text-white/90 hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Erneut versuchen
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload history */}
          <UploadSessions refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </>
  )
}
