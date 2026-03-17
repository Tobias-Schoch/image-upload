import { useState, useCallback, useRef } from 'react'
import axios from 'axios'

const CONCURRENCY = 3

export function useUpload() {
  const [phase, setPhase] = useState('idle') // idle | uploading | complete | error
  const [fileProgress, setFileProgress] = useState({}) // { relativePath: { loaded, total, done } }
  const [overallProgress, setOverallProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const cancelRef = useRef(null)

  const upload = useCallback(async (files, folderName) => {
    setPhase('uploading')
    setUploadError(null)

    const initialProgress = {}
    files.forEach(({ relativePath }) => {
      initialProgress[relativePath] = { loaded: 0, total: 0, done: false }
    })
    setFileProgress(initialProgress)
    setOverallProgress(0)

    try {
      // Step 1: Init upload
      const { data: initData } = await axios.post('/api/upload/init')
      const { uploadId } = initData

      // Step 2: Upload files with concurrency limit
      const progressState = { ...initialProgress }
      let completedFiles = 0

      const updateOverall = () => {
        let totalLoaded = 0
        let totalSize = 0
        Object.values(progressState).forEach(({ loaded, total }) => {
          totalLoaded += loaded
          totalSize += total
        })
        setOverallProgress(totalSize > 0 ? Math.round((totalLoaded / totalSize) * 100) : 0)
      }

      const uploadFile = async ({ file, relativePath }) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('relativePath', relativePath)

        await axios.post(`/api/upload/${uploadId}/file`, formData, {
          onUploadProgress: (progressEvent) => {
            progressState[relativePath] = {
              loaded: progressEvent.loaded,
              total: progressEvent.total || file.size,
              done: false,
            }
            setFileProgress({ ...progressState })
            updateOverall()
          },
        })

        progressState[relativePath].done = true
        completedFiles++
        setFileProgress({ ...progressState })
        updateOverall()
      }

      // Process with concurrency limit
      const queue = [...files]
      const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
        while (queue.length > 0) {
          const item = queue.shift()
          await uploadFile(item)
        }
      })
      await Promise.all(workers)

      // Step 3: Complete
      const { data: completeData } = await axios.post(`/api/upload/${uploadId}/complete`, { folderName })
      setUploadResult(completeData)
      setOverallProgress(100)
      setPhase('complete')
    } catch (err) {
      console.error('Upload failed:', err)
      setUploadError(err.response?.data?.error || 'Upload fehlgeschlagen')
      setPhase('error')
    }
  }, [])

  const reset = useCallback(() => {
    setPhase('idle')
    setFileProgress({})
    setOverallProgress(0)
    setUploadResult(null)
    setUploadError(null)
  }, [])

  return {
    phase,
    fileProgress,
    overallProgress,
    uploadResult,
    uploadError,
    upload,
    reset,
  }
}
