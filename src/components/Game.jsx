import { useState } from 'react'

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
  const [usedLetters, setUsedLetters] = useState(new Set(puzzle.sixLetter.split('')))
  const [message, setMessage] = useState('')
  const [showRules, setShowRules] = useState(false)

  const handleLetterClick = (letter) => {
    if (usedLetters.has(letter)) return

    // Try to add to first incomplete word box (5, 4, 3, 2, 1)
    for (const size of [5, 4, 3, 2, 1]) {
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
      5: puzzle.fiveLetters,
      4: puzzle.fourLetters,
      3: puzzle.threeLetters,
      2: puzzle.twoLetters,
      1: puzzle.oneLetter
    }

    let allCorrect = true
    for (const size of [5, 4, 3, 2, 1]) {
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
            <p><strong>Goal:</strong> Find all 5 words hidden in the given 6-letter word and remaining letters.</p>
            <ul>
              <li>The <strong>6-letter word</strong> is shown (you don't need to guess it)</li>
              <li>Use the remaining 20 letters to form:<br />
                1 five-letter word,<br />
                1 four-letter word,<br />
                1 three-letter word,<br />
                1 two-letter word,<br />
                1 one-letter word</li>
              <li>Each letter can only be used <strong>once</strong></li>
              <li>Use the keyboard to select letters</li>
              <li>Click on a letter in the word boxes to remove it</li>
              <li>Press <strong>Check</strong> to verify your answers</li>
              <li>Press <strong>Reveal</strong> to see the solution</li>
            </ul>
            <button className="btn" onClick={() => setShowRules(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="puzzle-area">
        <div className="six-letter-display">
          <div className="six-letter-label">Given Word</div>
          <div className="six-letter-word">
            {puzzle.sixLetter.split('').map((letter, i) => (
              <div key={i} className="letter-box">{letter}</div>
            ))}
          </div>
        </div>

        <div className="word-boxes-container">
          {[5, 4, 3, 2, 1].map(size => (
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
        <button className="btn reveal" onClick={revealAnswer}>Reveal</button>
        <button className="btn" onClick={checkWords}>Check</button>
      </div>
    </div>
  )
}