import { useState, useEffect } from 'react'

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
]

export default function Game({ puzzle, puzzleIndex, onBack, onSolved, onGaveUp, totalPuzzles }) {
  const [words, setWords] = useState({
    5: '',
    4: '',
    3: '',
    2: '',
    1: ''
  })
  const [selectedWordSize, setSelectedWordSize] = useState(5) // Track which word box is selected
  const [usedLetters, setUsedLetters] = useState(new Set(puzzle.sixLetter.split('')))
  const [message, setMessage] = useState('')
  const [showRules, setShowRules] = useState(false)

  const handleLetterClick = (letter) => {
    if (usedLetters.has(letter)) return

    // Add to selected word box if there's room
    if (words[selectedWordSize].length < selectedWordSize) {
      setWords(prev => ({
        ...prev,
        [selectedWordSize]: prev[selectedWordSize] + letter
      }))
      setUsedLetters(prev => new Set([...prev, letter]))
    }
  }

  const handleBoxClick = (size, index) => {
    if (words[size].length > 0) {
      // If clicking on a filled box, remove that letter
      if (index < words[size].length) {
        const letter = words[size][index]
        setWords(prev => ({
          ...prev,
          [size]: prev[size].slice(0, index) + prev[size].slice(index + 1)
        }))
        setUsedLetters(prev => {
          const next = new Set(prev)
          next.delete(letter)
          return next
        })
      }
    } else {
      // If clicking on an empty word box, select it
      setSelectedWordSize(size)
    }
  }

  const handleWordBoxSelect = (size) => {
    setSelectedWordSize(size)
  }

  const handleDeleteLetter = () => {
    if (words[selectedWordSize].length > 0) {
      const lastLetter = words[selectedWordSize][words[selectedWordSize].length - 1]
      setWords(prev => ({
        ...prev,
        [selectedWordSize]: prev[selectedWordSize].slice(0, -1)
      }))
      setUsedLetters(prev => {
        const next = new Set(prev)
        next.delete(lastLetter)
        return next
      })
    }
  }

  // Auto-advance to next word when current word is complete
  useEffect(() => {
    if (words[selectedWordSize].length === selectedWordSize) {
      // Word is complete, move to next word
      const wordOrder = [5, 4, 3, 2, 1]
      const currentIndex = wordOrder.indexOf(selectedWordSize)
      if (currentIndex < wordOrder.length - 1) {
        const nextSize = wordOrder[currentIndex + 1]
        setSelectedWordSize(nextSize)
      }
    }
  }, [words, selectedWordSize])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const letter = e.key.toUpperCase()

      // Check if it's a letter key
      if (/^[A-Z]$/.test(letter)) {
        e.preventDefault()
        handleLetterClick(letter)
      }
      // Handle Backspace to delete
      else if (e.key === 'Backspace') {
        e.preventDefault()
        handleDeleteLetter()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedWordSize, usedLetters, words])

  const checkWords = () => {
    const expected = {
      5: puzzle.fiveLetters,
      4: puzzle.fourLetters,
      3: puzzle.threeLetters,
      2: puzzle.twoLetters,
      1: puzzle.oneLetter
    }

    let allCompleteWordsCorrect = true
    let hasCompleteWords = false

    // Only check COMPLETE words
    for (const size of [5, 4, 3, 2, 1]) {
      const word = words[size]
      const expectedWord = expected[size]

      // Only validate if word is COMPLETE
      if (word.length === size) {
        hasCompleteWords = true
        if (word !== expectedWord) {
          allCompleteWordsCorrect = false
          break
        }
      }
      // Ignore incomplete words - don't fail on them
    }

    if (!hasCompleteWords) {
      setMessage('✗ No complete words yet!')
      setTimeout(() => setMessage(''), 3000)
    } else if (allCompleteWordsCorrect) {
      setMessage('✓ Perfect!')
      onSolved()
      setTimeout(() => {
        onBack()
      }, 1500)
    } else {
      setMessage('✗ Some words are incorrect. Try again!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const revealAnswer = () => {
    setWords({
      5: puzzle.fiveLetters,
      4: puzzle.fourLetters,
      3: puzzle.threeLetters,
      2: puzzle.twoLetters,
      1: puzzle.oneLetter
    })
    const allLetters = new Set(
      (puzzle.sixLetter + puzzle.fiveLetters +
       puzzle.fourLetters + puzzle.threeLetters +
       puzzle.twoLetters + puzzle.oneLetter).split('')
    )
    setUsedLetters(allLetters)

    alert(
      `Solution:\n\n` +
      `6-letter: ${puzzle.sixLetter}\n` +
      `5-letter: ${puzzle.fiveLetters}\n` +
      `4-letter: ${puzzle.fourLetters}\n` +
      `3-letter: ${puzzle.threeLetters}\n` +
      `2-letter: ${puzzle.twoLetters}\n` +
      `1-letter: ${puzzle.oneLetter}`
    )

    onGaveUp()
    setTimeout(() => {
      onBack()
    }, 500)
  }

  const resetPuzzle = () => {
    setWords({ 5: '', 4: '', 3: '', 2: '', 1: '' })
    setUsedLetters(new Set(puzzle.sixLetter.split('')))
    setMessage('')
  }

  return (
    <div className="container">
      {message && (
        <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="puzzle-title">{puzzle.sixLetter}</div>
        <button className="info-btn" onClick={() => setShowRules(!showRules)}>?</button>
      </div>

      {showRules && (
        <div className="rules-modal">
          <div className="rules-content">
            <h2>How to Play</h2>
            <p><strong>Goal:</strong> Find one 6, 5, 4, 3, 2, and 1-letter word using each letter exactly once.</p>
            <ul>
              <li>The <strong>6-letter word is given</strong> at the top</li>
              <li>Using those 6 letters plus 15 additional letters (21 total), find:</li>
              <li style={{ marginLeft: '20px' }}>• One 5-letter word</li>
              <li style={{ marginLeft: '20px' }}>• One 4-letter word</li>
              <li style={{ marginLeft: '20px' }}>• One 3-letter word</li>
              <li style={{ marginLeft: '20px' }}>• One 2-letter word</li>
              <li style={{ marginLeft: '20px' }}>• One 1-letter word</li>
              <li>Each letter can only be used <strong>once</strong> across all words</li>
              <li>Click any word box to select it, then type letters</li>
              <li>Use your keyboard (A-Z) or click letter buttons</li>
              <li>Press <strong>Delete</strong> or <strong>Backspace</strong> to remove a letter</li>
              <li>Press <strong>Check</strong> to verify complete words</li>
              <li>Press <strong>Reveal</strong> to see the solution</li>
            </ul>
            <button className="btn" onClick={() => setShowRules(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="puzzle-area">
        <div className="word-boxes-container">
          <div className="word-row six-letter-row">
            {puzzle.sixLetter.split('').map((letter, i) => (
              <div key={i} className="letter-box">{letter}</div>
            ))}
          </div>

          {[5, 4, 3, 2, 1].map(size => (
            <div key={size} className="word-row" onClick={() => handleWordBoxSelect(size)}>
              {Array.from({ length: size }).map((_, i) => (
                <button
                  key={i}
                  className={`word-box ${words[size][i] ? 'filled' : 'empty'} ${selectedWordSize === size ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBoxClick(size, i)
                  }}
                >
                  {words[size][i] || ''}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="keyboard-container">
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="keyboard-row">
              {row.map(letter => (
                <button
                  key={letter}
                  className={`keyboard-key ${usedLetters.has(letter) ? 'used' : ''}`}
                  onClick={() => handleLetterClick(letter)}
                  disabled={usedLetters.has(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="buttons-row">
        <button className="btn" onClick={resetPuzzle}>Clear</button>
        <button className="btn" onClick={handleDeleteLetter}>Delete</button>
        <button className="btn reveal" onClick={revealAnswer}>Reveal</button>
        <button className="btn" onClick={checkWords}>Check</button>
      </div>
    </div>
  )
}