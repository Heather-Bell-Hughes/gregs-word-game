#!/usr/bin/env node
// Removes bad words from all puzzle-tree index.json files.
// Run after build-tree-files.js finishes.

import fs from 'fs'
import path from 'path'

const BAD_WORDS = new Set([
  // original set
  'ftping', 'wkly', 'yrs', 'dpi', 'xor', 'int', 'inc', 'dept', 'corp', 'doz',
  'hoc', 'misc', 'etc', 'fum', 'fums', 'dox', 'gyp', 'gyps',
  // offensive / vulgar
  'xterm', 'xref', 'excl', 'milfs', 'xrefs', 'twink', 'neg', 'fuck', 'pwned',
  'milf', 'wank', 'wanks', 'twinks', 'clit',
  // abbreviations
  'adj', 'adv', 'amt', 'avg', 'hos', 'meh', 'mos', 'obj', 'pis', 'sim',
  'tel', 'var', 'vol', 'advt', 'avdp', 'conj', 'cont', 'corp', 'excl',
  'govt', 'grep', 'masc', 'natl', 'pron', 'recd', 'resp', 'subj', 'tron',
  'contd', 'greps', 'groks', 'scrog', 'snarf', 'ca', 'lat', 'lib', 'med',
  'meg', 'mil', 'min', 'sec', 'chem', 'incs', 'cal', 'doc', 'gen', 'gov',
  // non-words / jargon / brands
  'gonk', 'gonks', 'glock', 'smurf', 'zorch', 'crufts', 'ftpers',
  'bletch', 'cruft', 'esp', 'hing', 'meds', 'megs', 'pres', 'vols',
].map(w => w.toUpperCase()))

const TREE_DIR = 'public/puzzle-tree'

let filesPatched = 0
let wordsRemoved = 0

function recomputeMaxDepth(node) {
  if (!node || !node.children || Object.keys(node.children).length === 0) return 0
  return 1 + Math.max(0, ...Object.values(node.children).map(recomputeMaxDepth))
}

function cleanNode(node) {
  if (!node || !node.children) return node
  let changed = false
  for (const word of Object.keys(node.children)) {
    if (BAD_WORDS.has(word)) {
      delete node.children[word]
      wordsRemoved++
      changed = true
    } else {
      cleanNode(node.children[word])
    }
  }
  if (changed) node.maxDepth = recomputeMaxDepth(node)
  return node
}

function processFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const before = JSON.stringify(data)
  cleanNode(data)
  const after = JSON.stringify(data)
  if (before !== after) {
    fs.writeFileSync(filePath, after)
    filesPatched++
    process.stdout.write(`  patched: ${filePath}\n`)
  }
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkDir(full)
    else if (entry.name === 'index.json') processFile(full)
  }
}

console.log(`Cleaning bad words from ${TREE_DIR}...\n`)
walkDir(TREE_DIR)
console.log(`\nDone. Patched ${filesPatched} files, removed ${wordsRemoved} word entries.`)
