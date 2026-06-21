import { useState } from 'react'
import { getAllLettersForPuzzle } from '../puzzles'

export default function Game({ puzzle, puzzleIndex, onBack, onSolved, onGaveUp, totalPuzzles }) {
  const [words, setWords] = useState({
    6: '',
    5: '',
    4: '',
    3: '',
    2: '',
    1: ''
  })
  const [usedLetters, setUsedLetters] = useState(new Set())
  const [message, setMessage] = useState('')

  const availableLetters = getAllLettersForPuzzle(puzzle)

  const handleLetterClick = (letter) => {
    if (usedLetters.has(letter)) return

    // Try to add to first incomplete word box (6, 5, 4, 3, 2, 1)
    for (const size of [6, 5, 4, 3, 2, 1]) {
      if (words[size].length < size) {
        setWords(prev => ({
          ...prev,
          [size]: prev[size] + letter
        }))
        setUsedLetters(prev => new Set([...prev, letter]))
        return
      }
    }
  }

  const handleBoxClick = (size, index) => {
    if (words[size].length > index) {
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
  }

  const checkWords = () => {
    const expected = {
      6: puzzle.sixLetter,
      5: puzzle.fiveLetters,
      4: puzzle.fourLetters,
      3: puzzle.threeLetters,
      2: puzzle.twoLetters,
      1: puzzle.oneLetter
    }

    let allCorrect = true
    for (const size of [6, 5, 4, 3, 2, 1]) {
      if (words[size] !== expected[size]) {
        allCorrect = false
        break
      }
    }

    if (allCorrect) {
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
      6: puzzle.sixLetter,
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
    setWords({ 6: '', 5: '', 4: '', 3: '', 2: '', 1: '' })
    setUsedLetters(new Set())
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
        <div className="puzzle-title">Puzzle {puzzleIndex + 1} / {totalPuzzles}</div>
      </div>

      <div className="puzzle-area">
        <div className="keyboard-grid">
          {availableLetters.map(letter => (
            <button
              key={letter}
              className={`key ${usedLetters.has(letter) ? 'used' : ''}`}
              onClick={() => handleLetterClick(letter)}
              disabled={usedLetters.has(letter)}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="word-boxes-container">
          {[6, 5, 4, 3, 2, 1].map(size => (
            <div key={size} className="word-row">
              {Array.from({ length: size }).map((_, i) => (
                <button
                  key={i}
                  className={`word-box ${words[size][i] ? 'filled' : 'empty'}`}
                  onClick={() => handleBoxClick(size, i)}
                >
                  {words[size][i] || ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="buttons-row">
        <button className="btn" onClick={resetPuzzle}>Clear</button>
        <button className="btn reveal" onClick={revealAnswer}>Reveal</button>
        <button className="btn" onClick={checkWords}>Check</button>
      </div>
    </div>
  )
}