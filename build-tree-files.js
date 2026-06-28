#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// CLI args
const args = process.argv.slice(2)
const folderDepthArg = args.find(a => a.startsWith('--folder-depth='))
const limitArg = args.find(a => a.startsWith('--limit='))
const FOLDER_DEPTH = folderDepthArg ? parseInt(folderDepthArg.split('=')[1]) : 3
const childLimit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity
const RESUME = args.includes('--resume')
const OUTPUT_DIR = 'tree-data/puzzle-tree'

console.log(`Building file-based tree:`)
console.log(`  Folder depth: ${FOLDER_DEPTH}`)
console.log(`  Child limit:  ${childLimit < Infinity ? childLimit + ' (test mode)' : 'none'}`)
console.log(`  Resume:       ${RESUME ? 'yes — skipping completed nodes' : 'no — full rebuild'}`)
console.log(`  Output:       ${OUTPUT_DIR}/\n`)

// Bitmask overlap detection — ~100x faster than BigInt GCD
function wordMask(word) {
  let m = 0
  for (const l of word.toLowerCase()) {
    const i = l.charCodeAt(0) - 97
    if (i >= 0 && i < 26) m |= (1 << i)
  }
  return m
}
function hasOverlap(a, b) { return (a & b) !== 0 }
function fmt(s) { return s < 60 ? `${Math.round(s)}s` : `${Math.floor(s/60)}m ${Math.round(s%60)}s` }

// Load wordlist
console.log('Loading wordlist-generation.txt...')
const wordlist = fs.readFileSync('wordlist-generation.txt', 'utf-8')
  .split('\n').map(w => w.trim()).filter(Boolean)

const wordMasks = {}
wordlist.forEach(w => { wordMasks[w.toUpperCase()] = wordMask(w) })

const wordsByLength = {}
wordlist.forEach(w => {
  const l = w.length
  if (!wordsByLength[l]) wordsByLength[l] = []
  wordsByLength[l].push(w.toUpperCase())
})

console.log('Word distribution:')
Object.keys(wordsByLength).sort((a,b) => a-b).forEach(l => {
  console.log(`  ${l}L: ${wordsByLength[l].length}`)
})

// --- Build a subtree fully in memory (only called at depth >= FOLDER_DEPTH)
function buildSubtree(accMask, targetLen, pathLabel) {
  if (!wordsByLength[targetLen]) return {}

  const valid = wordsByLength[targetLen]
    .filter(w => !hasOverlap(wordMasks[w], accMask))
    .sort()
    .slice(0, childLimit)

  if (valid.length === 0) return {}

  const children = {}
  for (let i = 0; i < valid.length; i++) {
    const child = valid[i]
    const combined = accMask | wordMasks[child]
    const childPath = `${pathLabel}/${child}`
    if (targetLen >= 6) console.log(`    [${fmt((Date.now()-startTime)/1000)}]   ★ ${childPath}`)
    const grandchildren = buildSubtree(combined, targetLen + 1, childPath)
    const maxDepth = Object.keys(grandchildren).length === 0
      ? 0
      : 1 + Math.max(0, ...Object.values(grandchildren).map(v => v.maxDepth))
    children[child] = { maxDepth, children: grandchildren }
  }
  return children
}

// --- Write node to disk
let filesWritten = 0
let dirsCreated = 0
const startTime = Date.now()

function writeNode(accMask, targetLen, depth, outputPath, pathLabel) {
  if (!wordsByLength[targetLen]) return 0

  // Resume: if index.json already exists, trust it and skip
  const indexPath = path.join(outputPath, 'index.json')
  if (RESUME && fs.existsSync(indexPath)) {
    const existing = JSON.parse(fs.readFileSync(indexPath))
    const deepest = (targetLen - 1) + existing.maxDepth
    console.log(`  [SKIP] ${pathLabel} (done, deepest word: ${deepest}L)`)
    return existing.maxDepth
  }

  const valid = wordsByLength[targetLen]
    .filter(w => !hasOverlap(wordMasks[w], accMask))
    .sort()
    .slice(0, childLimit)

  if (valid.length === 0) return 0

  fs.mkdirSync(outputPath, { recursive: true })
  dirsCreated++

  const children = {}
  let maxDepth = 0

  for (let i = 0; i < valid.length; i++) {
    const child = valid[i]
    const combined = accMask | wordMasks[child]

    console.log(`  [${fmt((Date.now()-startTime)/1000)}] ${pathLabel}/${child} (${i+1}/${valid.length})  files:${filesWritten}  dirs:${dirsCreated}`)

    if (depth + 1 >= FOLDER_DEPTH) {
      const subtree = buildSubtree(combined, targetLen + 1, `${pathLabel}/${child}`)
      const childMaxDepth = Object.keys(subtree).length === 0
        ? 0
        : 1 + Math.max(0, ...Object.values(subtree).map(v => v.maxDepth))
      children[child] = { maxDepth: childMaxDepth, children: subtree }
      maxDepth = Math.max(maxDepth, childMaxDepth + 1)
    } else {
      const childMaxDepth = writeNode(combined, targetLen + 1, depth + 1, path.join(outputPath, child), `${pathLabel}/${child}`)
      children[child] = { maxDepth: childMaxDepth }
      maxDepth = Math.max(maxDepth, childMaxDepth + 1)
    }
  }

  fs.writeFileSync(indexPath, JSON.stringify({ maxDepth, children }))
  filesWritten++
  return maxDepth
}

// --- Build from root
if (!RESUME) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

const roots = wordsByLength[1] || []
const rootChildren = {}

for (let i = 0; i < roots.length; i++) {
  const root = roots[i]
  console.log(`\n[${fmt((Date.now()-startTime)/1000)}] Root ${i+1}/${roots.length}: ${root}`)
  const childMaxDepth = writeNode(wordMasks[root], 2, 1, path.join(OUTPUT_DIR, root), root)
  rootChildren[root] = { maxDepth: childMaxDepth }
}

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify({ children: rootChildren }))
filesWritten++

console.log(`\n\n✅ Done in ${fmt((Date.now()-startTime)/1000)}`)
console.log(`   Directories: ${dirsCreated.toLocaleString()}`)
console.log(`   Files:       ${filesWritten.toLocaleString()}`)
console.log(`\n   Run with --limit=2 for a quick test`)
