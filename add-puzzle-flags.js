#!/usr/bin/env node
// Adds hasUnpuzzled:bool to every node in public/puzzle-tree/
// true  = at least one reachable 6L terminal word has no puzzle yet
// false = all reachable 6L terminal words are existing puzzles

import fs from 'fs'
import path from 'path'

const TREE_DIR = 'public/puzzle-tree'
const puzzleWords = new Set(JSON.parse(fs.readFileSync('puzzle-words.json', 'utf-8')))

// Annotates embedded subtree (3L and deeper, all within one index.json).
// Returns true if any unpuzzled 6L terminal exists under this node.
function annotateEmbedded(word, node) {
  if (!node.children || Object.keys(node.children).length === 0) {
    node.hasUnpuzzled = word.length === 6 && !puzzleWords.has(word)
    return node.hasUnpuzzled
  }
  let hasUnpuzzled = false
  for (const [childWord, child] of Object.entries(node.children)) {
    if (annotateEmbedded(childWord, child)) hasUnpuzzled = true
  }
  node.hasUnpuzzled = hasUnpuzzled
  return hasUnpuzzled
}

let filesPatched = 0

// Step 1: Process all 2L folder files (embedded subtrees from 3L+)
// Path: TREE_DIR/{1L}/{2L}/index.json
const tier2HasUnpuzzled = new Map() // "A/BE" -> bool

for (const letter of fs.readdirSync(TREE_DIR).filter(e => fs.statSync(path.join(TREE_DIR, e)).isDirectory())) {
  const dir1L = path.join(TREE_DIR, letter)
  for (const entry of fs.readdirSync(dir1L, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const word2L = entry.name
    const file = path.join(dir1L, word2L, 'index.json')
    if (!fs.existsSync(file)) continue
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    let hasUnpuzzled = false
    for (const [word3L, child3L] of Object.entries(data.children ?? {})) {
      if (annotateEmbedded(word3L, child3L)) hasUnpuzzled = true
    }
    data.hasUnpuzzled = hasUnpuzzled
    fs.writeFileSync(file, JSON.stringify(data))
    filesPatched++
    tier2HasUnpuzzled.set(`${letter}/${word2L}`, hasUnpuzzled)
  }
}

// Step 2: Update 1L folder files — set hasUnpuzzled on each lazy 2L child ref
const tier1HasUnpuzzled = new Map() // "A" -> bool

for (const letter of [...tier2HasUnpuzzled.keys()].map(k => k.split('/')[0]).filter((v, i, a) => a.indexOf(v) === i)) {
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
console.log(`Puzzle words: ${puzzleWords.size}`)
