import { useState, useEffect, useCallback } from 'react'

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'DEL'],
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
  const [selectedWordSize, setSelectedWordSize] = useState(5)
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null) // Track which specific box is selected
  const [usedLetters, setUsedLetters] = useState(new Set(puzzle.sixLetter.split('')))
  const [message, setMessage] = useState('')
  const [showRules, setShowRules] = useState(false)
  const [letterMarking, setLetterMarking] = useState({})

  const handleLetterClick = useCallback((letter) => {
    if (usedLetters.has(letter)) return

    setWords(prevWords => {
      const word = prevWords[selectedWordSize]

      // If a specific box is selected, replace letter at that position
      if (selectedBoxIndex !== null && selectedBoxIndex < selectedWordSize) {
        const oldLetter = word[selectedBoxIndex]
        const newWord = word.slice(0, selectedBoxIndex) + letter + word.slice(selectedBoxIndex + 1)

        // Update used letters
        setUsedLetters(prevLetters => {
          const next = new Set(prevLetters)
          if (oldLetter) next.delete(oldLetter)
          next.add(letter)
          return next
        })

        // Move to next box
        const nextIndex = selectedBoxIndex + 1
        if (nextIndex < selectedWordSize) {
          setSelectedBoxIndex(nextIndex)
        }

        return {
          ...prevWords,
          [selectedWordSize]: newWord
        }
      } else if (word.length < selectedWordSize) {
        // Append to end if no specific box selected
        setUsedLetters(prevLetters => new Set([...prevLetters, letter]))
        return {
          ...prevWords,
          [selectedWordSize]: word + letter
        }
      }
      return prevWords
    })

    // Clear marking for current word when typing
    setLetterMarking(prev => ({
      ...prev,
      [selectedWordSize]: []
    }))
  }, [usedLetters, selectedWordSize, selectedBoxIndex])

  const handleBoxClick = (size, index) => {
    setSelectedWordSize(size)
    setSelectedBoxIndex(index)
  }

  const handleWordBoxSelect = (size) => {
    setSelectedWordSize(size)
  }

  const handleDeleteLetter = useCallback(() => {
    setWords(prev => {
      const word = prev[selectedWordSize]
      if (word.length > 0) {
        const lastLetter = word[word.length - 1]
        setUsedLetters(prevLetters => {
          const next = new Set(prevLetters)
          next.delete(lastLetter)
          return next
        })
        return {
          ...prev,
          [selectedWordSize]: word.slice(0, -1)
        }
      }
      return prev
    })
    // Clear marking for current word when deleting
    setLetterMarking(prev => ({
      ...prev,
      [selectedWordSize]: []
    }))
  }, [selectedWordSize])

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
  }, [selectedWordSize, selectedBoxIndex, words, usedLetters])

  const checkWords = () => {
    const expected = {
      5: puzzle.fiveLetters,
      4: puzzle.fourLetters,
      3: puzzle.threeLetters,
      2: puzzle.twoLetters,
      1: puzzle.oneLetter
    }

    let allComplete = true
    let allCorrectSoFar = true
    let anyWrongLetters = false
    const marking = {}

    // Check ALL required words
    for (const size of [5, 4, 3, 2, 1]) {
      const word = words[size]
      const expectedWord = expected[size]
      marking[size] = [] // Initialize marking array for this word

      // Only mark complete words (don't mark empty as wrong)
      if (word.length > 0) {
        // Check each letter in the word
        for (let i = 0; i < word.length; i++) {
          if (word[i] === expectedWord[i]) {
            marking[size][i] = 'correct'
          } else {
            marking[size][i] = 'wrong'
            anyWrongLetters = true
          }
        }
      }

      // Check if word is COMPLETE
      if (word.length !== size) {
        allComplete = false
      }

      // Check if what's entered matches the start of expected word
      if (word.length > 0) {
        const isCorrectPrefix = expectedWord.startsWith(word)
        if (!isCorrectPrefix) {
          allCorrectSoFar = false
        }
      }
    }

    setLetterMarking(marking)

    // Priority of messages:
    if (anyWrongLetters) {
      setMessage('✗ Some letters are incorrect. Try again!')
      setTimeout(() => setMessage(''), 3000)
    } else if (!allComplete) {
      setMessage('✓ Good so far! Fill in the remaining words.')
      setTimeout(() => setMessage(''), 3000)
    } else if (allCorrectSoFar) {
      // All complete AND all correct
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
    setLetterMarking({})
    setSelectedBoxIndex(null)
  }

  const clearCurrentWord = () => {
    setWords(prev => ({
      ...prev,
      [selectedWordSize]: ''
    }))

    // Release letters from used set
    const word = words[selectedWordSize]
    setUsedLetters(prev => {
      const next = new Set(prev)
      for (const letter of word) {
        next.delete(letter)
      }
      return next
    })

    setLetterMarking(prev => ({
      ...prev,
      [selectedWordSize]: []
    }))
    setSelectedBoxIndex(null)
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
        <div className="puzzle-title">Puzzle {puzzleIndex + 1} ({totalPuzzles})</div>
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

      <div className="buttons-row">
        <button className="btn" onClick={clearCurrentWord}>Clear</button>
        <button className="btn reveal" onClick={revealAnswer}>Reveal</button>
        <button className="btn" onClick={checkWords}>Check</button>
        <button className="btn restart" onClick={() => {
          if (confirm('Are you sure you want to restart the puzzle?')) {
            resetPuzzle()
          }
        }}>Restart</button>
      </div>

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
                  className={`word-box ${words[size][i] ? 'filled' : 'empty'} ${selectedWordSize === size && selectedBoxIndex === i ? 'focused' : selectedWordSize === size ? 'selected' : ''} ${letterMarking[size]?.[i] ? letterMarking[size][i] : ''}`}
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
              {row.map(key => {
                if (key === 'DEL') {
                  return (
                    <button
                      key={key}
                      className="keyboard-key delete-key"
                      onClick={handleDeleteLetter}
                    >
                      ⌫
                    </button>
                  )
                }
                return (
                  <button
                    key={key}
                    className={`keyboard-key ${usedLetters.has(key) ? 'used' : ''}`}
                    onClick={() => handleLetterClick(key)}
                    disabled={usedLetters.has(key)}
                  >
                    {key}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}