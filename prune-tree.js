#!/usr/bin/env node
// Produces a filtered copy of tree-data/puzzle-tree → public/puzzle-tree
// Only keeps paths that lead to at least one 6-letter word.
//
// Pruning rule: keep a node only if (wordLength + maxDepth) >= 6

import fs from 'fs'
import path from 'path'

const SRC_DIR  = 'tree-data/puzzle-tree'
const DEST_DIR = 'public/puzzle-tree'
const TARGET_DEPTH = 6

let filesWritten = 0
let filesSkipped = 0

function pruneChildren(children) {
  const out = {}
  for (const [word, child] of Object.entries(children)) {
    const reachable = word.length + child.maxDepth
    if (reachable < TARGET_DEPTH) { filesSkipped++; continue }

    if (child.children !== undefined) {
      // Embedded subtree — recurse into it
      const pruned = pruneChildren(child.children)
      if (Object.keys(pruned).length === 0 && word.length < TARGET_DEPTH) continue
      const newMaxDepth = Object.keys(pruned).length === 0
        ? 0
        : 1 + Math.max(0, ...Object.values(pruned).map(c => c.maxDepth))
      out[word] = { maxDepth: newMaxDepth, children: pruned }
    } else {
      // Lazy reference — just pass through the maxDepth
      out[word] = { maxDepth: child.maxDepth }
    }
  }
  return out
}

function processFile(srcPath, destPath) {
  const data = JSON.parse(fs.readFileSync(srcPath, 'utf-8'))
  const pruned = pruneChildren(data.children ?? {})
  if (Object.keys(pruned).length === 0) return false

  const newMaxDepth = Object.keys(pruned).length === 0
    ? 0
    : 1 + Math.max(0, ...Object.values(pruned).map(c => c.maxDepth))

  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.writeFileSync(destPath, JSON.stringify({ maxDepth: newMaxDepth, children: pruned }))
  filesWritten++
  return true
}

function walk(srcDir, destDir) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcFull  = path.join(srcDir, entry.name)
    const destFull = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      walk(srcFull, destFull)
    } else if (entry.name === 'index.json') {
      const kept = processFile(srcFull, destFull)
      if (!kept) console.log(`  dropped empty: ${srcFull}`)
    }
  }
}

console.log(`Pruning ${SRC_DIR} → ${DEST_DIR}`)
console.log(`Keeping only paths that reach ${TARGET_DEPTH}L words\n`)

fs.rmSync(DEST_DIR, { recursive: true, force: true })
walk(SRC_DIR, DEST_DIR)

console.log(`\nDone.`)
console.log(`  Files written: ${filesWritten}`)
console.log(`  Nodes pruned:  ${filesSkipped}`)
console.log(`  Size: `)
