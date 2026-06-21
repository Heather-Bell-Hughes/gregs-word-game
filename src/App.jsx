import { useState } from 'react'
import { puzzles, getAllLettersForPuzzle } from './puzzles'
import './App.css'

export default function App() {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
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

  const currentPuzzle = puzzles[currentPuzzleIndex]
  const availableLetters = getAllLettersForPuzzle(currentPuzzle)

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
      6: currentPuzzle.sixLetter,
      5: currentPuzzle.fiveLetters,
      4: currentPuzzle.fourLetters,
      3: currentPuzzle.threeLetters,
      2: currentPuzzle.twoLetters,
      1: currentPuzzle.oneLetter
    }

    let allCorrect = true
    for (const size of [6, 5, 4, 3, 2, 1]) {
      if (words[size] !== expected[size]) {
        allCorrect = false
        break
      }
    }

    if (allCorrect) {
      setMessage('✓ Perfect! Level Complete!')
      setTimeout(() => {
        if (currentPuzzleIndex < puzzles.length - 1) {
          setCurrentPuzzleIndex(currentPuzzleIndex + 1)
          setWords({ 6: '', 5: '', 4: '', 3: '', 2: '', 1: '' })
          setUsedLetters(new Set())
          setMessage('')
        }
      }, 1500)
    } else {
      setMessage('✗ Some words are incorrect. Try again!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const revealAnswer = () => {
    setWords({
      6: currentPuzzle.sixLetter,
      5: currentPuzzle.fiveLetters,
      4: currentPuzzle.fourLetters,
      3: currentPuzzle.threeLetters,
      2: currentPuzzle.twoLetters,
      1: currentPuzzle.oneLetter
    })
    const allLetters = new Set(
      (currentPuzzle.sixLetter + currentPuzzle.fiveLetters +
       currentPuzzle.fourLetters + currentPuzzle.threeLetters +
       currentPuzzle.twoLetters + currentPuzzle.oneLetter).split('')
    )
    setUsedLetters(allLetters)

    alert(
      `Solution:\n\n` +
      `6-letter: ${currentPuzzle.sixLetter}\n` +
      `5-letter: ${currentPuzzle.fiveLetters}\n` +
      `4-letter: ${currentPuzzle.fourLetters}\n` +
      `3-letter: ${currentPuzzle.threeLetters}\n` +
      `2-letter: ${currentPuzzle.twoLetters}\n` +
      `1-letter: ${currentPuzzle.oneLetter}`
    )

    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1)
      setWords({ 6: '', 5: '', 4: '', 3: '', 2: '', 1: '' })
      setUsedLetters(new Set())
      setMessage('')
    }
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
        <div className="level-title">Level {currentPuzzleIndex + 1}</div>
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
        <button className="btn" onClick={() => resetPuzzle()}>Clear</button>
        <button className="btn reveal" onClick={revealAnswer}>Reveal</button>
        <button className="btn" onClick={checkWords}>Check</button>
      </div>
    </div>
  )
}