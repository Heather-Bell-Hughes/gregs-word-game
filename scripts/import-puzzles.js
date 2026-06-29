#!/usr/bin/env node
// Fetches new puzzle submissions from Google Sheet and appends to src/puzzles.js

import fs from 'fs'

const SHEET_CSV   = 'https://docs.google.com/spreadsheets/d/1gPJKU-mlP6L_JljXvJFwxGOXSmJOpklTblGG1jfTq08/export?format=csv&gid=1881712769'
const PUZZLES_JSON = 'src/puzzles.json'

// Fetch CSV following redirects
const res = await fetch(SHEET_CSV)
if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`)
const csv = await res.text()

// Parse CSV rows (skip header)
const rows = csv.trim().split('\n').slice(1)
  .map(line => {
    const fields = []
    let cur = '', inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === ',' && !inQuote) { fields.push(cur.trim()); cur = '' }
      else cur += ch
    }
    fields.push(cur.trim())
    return fields
  })
  .filter(f => f.length >= 7 && f[1] && f[2] && f[3] && f[4] && f[5] && f[6])
  .map(([, six, five, four, three, two, one]) => ({
    sixLetter:    six.toUpperCase().trim(),
    fiveLetters:  five.toUpperCase().trim(),
    fourLetters:  four.toUpperCase().trim(),
    threeLetters: three.toUpperCase().trim(),
    twoLetters:   two.toUpperCase().trim(),
    oneLetter:    one.toUpperCase().trim(),
    difficulty:   'normal',
  }))

if (rows.length === 0) {
  console.log('No submissions in sheet.')
  process.exit(0)
}

// Read existing puzzles JSON
const puzzles = JSON.parse(fs.readFileSync(PUZZLES_JSON, 'utf-8'))
const existingSix = new Set(puzzles.map(p => p.sixLetter))

const toAdd = rows.filter(p => !existingSix.has(p.sixLetter))

if (toAdd.length === 0) {
  console.log('No new puzzles to add.')
  process.exit(0)
}

puzzles.push(...toAdd)
fs.writeFileSync(PUZZLES_JSON, JSON.stringify(puzzles, null, 2))

console.log(`Added ${toAdd.length} new puzzle(s): ${toAdd.map(p => p.sixLetter).join(', ')}`)
