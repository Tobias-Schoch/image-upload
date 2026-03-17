function readEntriesPromise(reader) {
  return new Promise((resolve, reject) => {
    reader.readEntries(resolve, reject)
  })
}

async function readAllEntries(reader) {
  const entries = []
  let batch
  do {
    batch = await readEntriesPromise(reader)
    entries.push(...batch)
  } while (batch.length > 0)
  return entries
}

function fileFromEntry(entry) {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject)
  })
}

export async function readDirectory(entry, path = '') {
  const tree = {
    name: entry.name,
    path: path ? `${path}/${entry.name}` : entry.name,
    isDirectory: entry.isDirectory,
    children: [],
    file: null,
  }

  if (entry.isFile) {
    tree.file = await fileFromEntry(entry)
    return tree
  }

  const reader = entry.createReader()
  const entries = await readAllEntries(reader)

  for (const child of entries) {
    const childNode = await readDirectory(child, tree.path)
    tree.children.push(childNode)
  }

  // Sort: folders first, then files, alphabetically
  tree.children.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return tree
}

export function flattenFiles(tree) {
  const files = []
  function walk(node) {
    if (!node.isDirectory && node.file) {
      files.push({ file: node.file, relativePath: node.path })
    }
    if (node.children) {
      node.children.forEach(walk)
    }
  }
  walk(tree)
  return files
}
