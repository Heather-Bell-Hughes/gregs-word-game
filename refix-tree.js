#!/usr/bin/env node
// Recomputes maxDepth bottom-up and removes orphan nodes (no path to a 6L word).
// Also recomputes hasUnpuzzled. Run this after clean-tree-indexes.js.

import fs from 'fs'
import path from 'path'

const TREE_DIR = 'public/puzzle-tree'
const puzzleWords = new Set(JSON.parse(fs.readFileSync('puzzle-words.json', 'utf-8')))

// Returns -1 if this node has no valid path to a 6L word (prune it).
// Otherwise fixes maxDepth in-place and returns it.
function fixNode(word, node) {
  if (!node.children || Object.keys(node.children).length === 0) {
    node.maxDepth = 0
    return word.length === 6 ? 0 : -1
  }

  for (const [childWord, child] of Object.entries(node.children)) {
    if (fixNode(childWord, child) === -1) {
      delete node.children[childWord]
    }
  }

  const remaining = Object.values(node.children)
  if (remaining.length === 0) {
    node.maxDepth = 0
    return word.length === 6 ? 0 : -1
  }

  node.maxDepth = 1 + Math.max(...remaining.map(c => c.maxDepth))
  return node.maxDepth
}

function annotate(word, node) {
  if (!node.children || Object.keys(node.children).length === 0) {
    node.hasUnpuzzled = word.length === 6 && !puzzleWords.has(word)
    return node.hasUnpuzzled
  }
  let hasUnpuzzled = false
  for (const [childWord, child] of Object.entries(node.children)) {
    if (annotate(childWord, child)) hasUnpuzzled = true
  }
  node.hasUnpuzzled = hasUnpuzzled
  return hasUnpuzzled
}

let filesPatched = 0
const tier2HasUnpuzzled = new Map()

// Step 1: Fix all 2L folder files (contain embedded 3L–6L subtrees)
for (const letter of fs.readdirSync(TREE_DIR).filter(e => fs.statSync(path.join(TREE_DIR, e)).isDirectory())) {
  const dir1L = path.join(TREE_DIR, letter)
  for (const entry of fs.readdirSync(dir1L, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const word2L = entry.name
    const file = path.join(dir1L, word2L, 'index.json')
    if (!fs.existsSync(file)) continue

    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))

    // Fix and annotate all embedded children
    let hasUnpuzzled = false
    for (const [word3L, child3L] of Object.entries(data.children ?? {})) {
      if (fixNode(word3L, child3L) === -1) {
        delete data.children[word3L]
      } else {
        if (annotate(word3L, child3L)) hasUnpuzzled = true
      }
    }

    const remaining = Object.values(data.children ?? {})
    data.maxDepth = remaining.length ? 1 + Math.max(...remaining.map(c => c.maxDepth)) : 0
    data.hasUnpuzzled = hasUnpuzzled

    fs.writeFileSync(file, JSON.stringify(data))
    filesPatched++
    tier2HasUnpuzzled.set(`${letter}/${word2L}`, hasUnpuzzled)
  }
}

// Step 2: Update 1L folder files
const tier1HasUnpuzzled = new Map()
for (const letter of [...new Set([...tier2HasUnpuzzled.keys()].map(k => k.split('/')[0]))]) {
  const file = path.join(TREE_DIR, letter, 'index.json')
  if (!fs.existsSync(file)) continue
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
  let hasUnpuzzled = false
  for (const [word2L, child2L] of Object.entries(data.children ?? {})) {
    const val = tier2HasUnpuzzled.get(`${letter}/${word2L}`) ?? false
    child2L.hasUnpuzzled = val
    if (val) hasUnpuzzled = true
  }
  data.hasUnpuzzled = hasUnpuzzled
  fs.writeFileSync(file, JSON.stringify(data))
  filesPatched++
  tier1HasUnpuzzled.set(letter, hasUnpuzzled)
}

// Step 3: Update root
const rootFile = path.join(TREE_DIR, 'index.json')
const rootData = JSON.parse(fs.readFileSync(rootFile, 'utf-8'))
for (const [letter, child] of Object.entries(rootData.children ?? {})) {
  child.hasUnpuzzled = tier1HasUnpuzzled.get(letter) ?? false
}
rootData.hasUnpuzzled = Object.values(rootData.children ?? {}).some(c => c.hasUnpuzzled)
fs.writeFileSync(rootFile, JSON.stringify(rootData))
filesPatched++

console.log(`Done. Patched ${filesPatched} files.`)
