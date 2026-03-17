import { useState, useCallback } from 'react'
import { readDirectory, flattenFiles } from '../utils/readDirectory'

export function useFolderDrop() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [tree, setTree] = useState(null)
  const [files, setFiles] = useState([])
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set false if leaving the drop zone itself
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setError(null)

    const items = Array.from(e.dataTransfer.items)
    const entries = items
      .map((item) => item.webkitGetAsEntry?.() || null)
      .filter(Boolean)

    if (entries.length === 0) {
      // Fallback: regular file drop
      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) {
        const flatFiles = droppedFiles.map((f) => ({
          file: f,
          relativePath: f.name,
        }))
        setFiles(flatFiles)
        setFolderName('Dateien')
        setTree({
          name: 'Dateien',
          path: '',
          isDirectory: true,
          children: droppedFiles.map((f) => ({
            name: f.name,
            path: f.name,
            isDirectory: false,
            file: f,
            children: [],
          })),
        })
      }
      return
    }

    // If a single folder is dropped
    const folderEntry = entries.find((e) => e.isDirectory)
    if (folderEntry) {
      try {
        const treeData = await readDirectory(folderEntry)
        const flatFiles = flattenFiles(treeData)

        if (flatFiles.length === 0) {
          setError('Der Ordner ist leer.')
          return
        }

        setTree(treeData)
        setFiles(flatFiles)
        setFolderName(folderEntry.name)
      } catch (err) {
        setError('Fehler beim Lesen des Ordners.')
        console.error(err)
      }
      return
    }

    // Multiple files dropped (no folder)
    const fileResults = []
    for (const entry of entries) {
      if (entry.isFile) {
        const node = await readDirectory(entry)
        fileResults.push(node)
      }
    }
    const flatFiles = fileResults
      .filter((n) => n.file)
      .map((n) => ({ file: n.file, relativePath: n.path }))

    setFiles(flatFiles)
    setFolderName('Dateien')
    setTree({
      name: 'Dateien',
      path: '',
      isDirectory: true,
      children: fileResults,
    })
  }, [])

  const reset = useCallback(() => {
    setTree(null)
    setFiles([])
    setFolderName('')
    setError(null)
  }, [])

  return {
    isDragOver,
    tree,
    files,
    folderName,
    error,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset,
  }
}
