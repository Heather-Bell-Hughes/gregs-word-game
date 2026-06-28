#!/usr/bin/env node
// Builds the reverse puzzle tree: 6L+ words as roots, working DOWN to A/I as leaves.
// Each path represents a valid puzzle: GLITCH → DROWN → BUMP → SKY → EX → A

import fs from 'fs'
import path from 'path'

const args = process.argv.slice(2)
const folderDepthArg = args.find(a => a.startsWith('--folder-depth='))
const limitArg = args.find(a => a.startsWith('--limit='))
const FOLDER_DEPTH = folderDepthArg ? parseInt(folderDepthArg.split('=')[1]) : 3
const childLimit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity
const OUTPUT_DIR = 'tree-data/reverse-tree'

console.log(`Building reverse tree (6L+ → A/I):`)
console.log(`  Folder depth: ${FOLDER_DEPTH}`)
console.log(`  Child limit:  ${childLimit < Infinity ? childLimit + ' (test mode)' : 'none'}`)
console.log(`  Output:       ${OUTPUT_DIR}/\n`)

// Prime overlap detection
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101]

function getWordProduct(word) {
  let p = 1n
  for (const l of word.toLowerCase()) {
    const i = l.charCodeAt(0) - 97
    if (i >= 0 && i < 26) p *= BigInt(primes[i])
  }
  return p
}

function gcd(a, b) { a = BigInt(a); b = BigInt(b); return b === 0n ? a : gcd(b, a % b) }
function hasOverlap(a, b) { return gcd(BigInt(a), BigInt(b)) > 1n }
function fmt(s) { return s < 60 ? `${Math.round(s)}s` : `${Math.floor(s/60)}m ${Math.round(s%60)}s` }

// Load wordlist
console.log('Loading wordlist-generation.txt...')
const wordlist = fs.readFileSync('wordlist-generation.txt', 'utf-8')
  .split('\n').map(w => w.trim()).filter(Boolean)

const wordProducts = {}
wordlist.forEach(w => { wordProducts[w.toUpperCase()] = getWordProduct(w) })

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

// Scan the forward puzzle tree for all 6L+ words that are actually reachable from A/I
const FORWARD_TREE_DIR = 'public/puzzle-tree'
if (!fs.existsSync(FORWARD_TREE_DIR)) {
  console.error(`Forward tree not found at ${FORWARD_TREE_DIR}. Run build-tree-files.js first.`)
  process.exit(1)
}

const rootsFromTree = new Set()
function scanForDeepWords(node) {
  if (!node?.children) return
  for (const [word, child] of Object.entries(node.children)) {
    if (word.length >= 6) rootsFromTree.add(word)
    scanForDeepWords(child)
  }
}
function walkForwardTree(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkForwardTree(full)
    else if (entry.name === 'index.json') {
      scanForDeepWords(JSON.parse(fs.readFileSync(full, 'utf-8')))
    }
  }
}
console.log(`\nScanning forward tree for 6L+ words...`)
walkForwardTree(FORWARD_TREE_DIR)

const roots = [...rootsFromTree].sort()
console.log(`Roots (6L+ words reachable from A/I): ${roots.length}`)

// --- Build subtree fully in memory (called at depth >= FOLDER_DEPTH)
function buildSubtree(accProduct, targetLen, pathLabel) {
  if (targetLen < 1 || !wordsByLength[targetLen]) return {}

  const valid = wordsByLength[targetLen]
    .filter(w => !hasOverlap(wordProducts[w], accProduct))
    .sort()
    .slice(0, childLimit)

  if (valid.length === 0) return {}

  const children = {}
  for (let i = 0; i < valid.length; i++) {
    const child = valid[i]
    const combined = accProduct * wordProducts[child]
    const childPath = `${pathLabel}/${child}`
    if (targetLen >= 6) console.log(`    [${fmt((Date.now()-startTime)/1000)}]   ★ ${childPath}`)
    const grandchildren = buildSubtree(combined, targetLen - 1, childPath)
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

function writeNode(accProduct, targetLen, depth, outputPath, pathLabel) {
  if (targetLen < 1 || !wordsByLength[targetLen]) return 0

  const valid = wordsByLength[targetLen]
    .filter(w => !hasOverlap(wordProducts[w], accProduct))
    .sort()
    .slice(0, childLimit)

  if (valid.length === 0) return 0

  fs.mkdirSync(outputPath, { recursive: true })
  dirsCreated++

  const children = {}
  let maxDepth = 0

  for (let i = 0; i < valid.length; i++) {
    const child = valid[i]
    const combined = accProduct * wordProducts[child]

    console.log(`  [${fmt((Date.now()-startTime)/1000)}] ${pathLabel}/${child} (${i+1}/${valid.length})  files:${filesWritten}  dirs:${dirsCreated}`)

    if (depth + 1 >= FOLDER_DEPTH) {
      const subtree = buildSubtree(combined, targetLen - 1, `${pathLabel}/${child}`)
      const childMaxDepth = Object.keys(subtree).length === 0
        ? 0
        : 1 + Math.max(0, ...Object.values(subtree).map(v => v.maxDepth))
      children[child] = { maxDepth: childMaxDepth, children: subtree }
      maxDepth = Math.max(maxDepth, childMaxDepth + 1)
    } else {
      const childMaxDepth = writeNode(combined, targetLen - 1, depth + 1, path.join(outputPath, child), `${pathLabel}/${child}`)
      children[child] = { maxDepth: childMaxDepth }
      maxDepth = Math.max(maxDepth, childMaxDepth + 1)
    }
  }

  fs.writeFileSync(path.join(outputPath, 'index.json'), JSON.stringify({ maxDepth, children }))
  filesWritten++
  return maxDepth
}

// --- Build from roots
fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

const rootChildren = {}

for (let i = 0; i < roots.length; i++) {
  const root = roots[i]
  console.log(`\n[${fmt((Date.now()-startTime)/1000)}] Root ${i+1}/${roots.length}: ${root}`)
  const rootLen = root.length
  const childMaxDepth = writeNode(wordProducts[root], rootLen - 1, 1, path.join(OUTPUT_DIR, root), root)
  const requiredDepth = root.length - 1  // must reach all the way down to 1L
  if (childMaxDepth === requiredDepth) {
    rootChildren[root] = { maxDepth: childMaxDepth }
  } else {
    const reason = childMaxDepth === 0 ? 'no children' : `only reaches ${root.length - childMaxDepth}L, can't get to 1L`
    console.log(`  (skipping — ${reason})`)
    fs.rmSync(path.join(OUTPUT_DIR, root), { recursive: true, force: true })
    dirsCreated--
  }
}

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify({ children: rootChildren }))
filesWritten++

console.log(`\n\n✅ Done in ${fmt((Date.now()-startTime)/1000)}`)
console.log(`   Roots with valid paths: ${Object.keys(rootChildren).length} / ${roots.length}`)
console.log(`   Directories: ${dirsCreated.toLocaleString()}`)
console.log(`   Files:       ${filesWritten.toLocaleString()}`)
console.log(`\n   Run with --limit=2 for a quick test`)
