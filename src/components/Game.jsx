import { useState, useEffect, useCallback, useRef } from 'react'
import { isValidWord } from '../dictionary'

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '', 'DEL']
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
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null)
  const [disabledLetters] = useState(new Set(puzzle.sixLetter.split('')))
  const [message, setMessage] = useState('')
  const [showRules, setShowRules] = useState(false)
  const [letterMarking, setLetterMarking] = useState({})
  const [showSolution, setShowSolution] = useState(false)
  const [puzzleSolved, setPuzzleSolved] = useState(false)

  // Refs for current state values (for immediate access in event handlers)
  const selectedWordSizeRef = useRef(5)
  const selectedBoxIndexRef = useRef(null)
  const wordsRef = useRef({ 5: '', 4: '', 3: '', 2: '', 1: '' })
  // Update refs whenever state changes
  useEffect(() => {
    selectedWordSizeRef.current = selectedWordSize
  }, [selectedWordSize])

  useEffect(() => {
    selectedBoxIndexRef.current = selectedBoxIndex
  }, [selectedBoxIndex])

  useEffect(() => {
    wordsRef.current = words
  }, [words])

  const handleLetterClick = useCallback((letter) => {
    if (disabledLetters.has(letter)) return

    const wordSize = selectedWordSizeRef.current
    const boxIndex = selectedBoxIndexRef.current
    const word = wordsRef.current[wordSize]

    // If a specific box is selected, replace letter at that position
    if (boxIndex !== null && boxIndex < wordSize) {
      // Pad word with placeholder '_' up to selected position
      let paddedWord = word.padEnd(boxIndex + 1, '_')
      const newWord = paddedWord.slice(0, boxIndex) + letter + paddedWord.slice(boxIndex + 1)

      // Update word
      setWords(prev => ({
        ...prev,
        [wordSize]: newWord
      }))

      // Move to next box
      const nextIndex = boxIndex + 1
      if (nextIndex < wordSize) {
        setSelectedBoxIndex(nextIndex)
      }
    } else if (word.length < wordSize) {
      // Append to end if no specific box selected
      setWords(prev => ({
        ...prev,
        [wordSize]: word + letter
      }))
    }

    // Clear marking for current word when typing
    setLetterMarking(prev => ({
      ...prev,
      [wordSize]: []
    }))
  }, [disabledLetters])

  const handleBoxClick = (size, index) => {
    selectedWordSizeRef.current = size
    selectedBoxIndexRef.current = index
    setSelectedWordSize(size)
    setSelectedBoxIndex(index)
  }

  const handleWordBoxSelect = (size) => {
    setSelectedWordSize(size)
  }

  const handleDeleteLetter = useCallback(() => {
    const wordSize = selectedWordSizeRef.current
    const boxIndex = selectedBoxIndexRef.current
    const word = wordsRef.current[wordSize]

    if (word.length > 0) {
      setWords(prev => ({
        ...prev,
        [wordSize]: word.slice(0, -1)
      }))
    }

    // Move selection backwards
    if (boxIndex !== null && boxIndex > 0) {
      setSelectedBoxIndex(boxIndex - 1)
    } else if (boxIndex === 0) {
      // If at position 0, clear the selection
      setSelectedBoxIndex(null)
    }

    // Clear marking for current word when deleting
    setLetterMarking(prev => ({
      ...prev,
      [wordSize]: []
    }))
  }, [])

  // Auto-advance to next word and auto-check when current word is complete
  useEffect(() => {
    const word = words[selectedWordSize]
    if (word.length === selectedWordSize && !word.includes('_')) {
      const wordOrder = [5, 4, 3, 2, 1]
      const currentIndex = wordOrder.indexOf(selectedWordSize)

      // Check if this word is valid
      if (word.length > 0) {
        const isValid = isValidWord(word)
        setLetterMarking(prev => ({
          ...prev,
          [selectedWordSize]: word.split('').map(() => isValid ? 'correct' : 'wrong')
        }))
      }

      // Move to next word
      if (currentIndex < wordOrder.length - 1) {
        const nextSize = wordOrder[currentIndex + 1]
        setSelectedWordSize(nextSize)
      }
    }
  }, [words, selectedWordSize])

  // Keyboard handler that always uses current state
  useEffect(() => {
    const handleKeyDown = (e) => {
      const letter = e.key.toUpperCase()

      // Check if it's a letter key
      if (/^[A-Z]$/.test(letter)) {
        e.preventDefault()

        const word = words[selectedWordSize]
        const boxIndex = selectedBoxIndex

        // If typing the same letter that's already at this position, just move forward
        if (boxIndex !== null && boxIndex < selectedWordSize && word[boxIndex] === letter) {
          const nextIndex = boxIndex + 1
          if (nextIndex < selectedWordSize) {
            setSelectedBoxIndex(nextIndex)
          }
          return
        }

        // Check if letter is disabled from 6-letter puzzle
        if (disabledLetters.has(letter)) return

        // If a specific box is selected, replace letter at that position
        if (boxIndex !== null && boxIndex < selectedWordSize) {
          // Pad word with placeholder '_' up to selected position
          let paddedWord = word.padEnd(boxIndex + 1, '_')
          const oldLetter = paddedWord[boxIndex]
          const newWord = paddedWord.slice(0, boxIndex) + letter + paddedWord.slice(boxIndex + 1)

          setWords(prev => ({
            ...prev,
            [selectedWordSize]: newWord
          }))

          const nextIndex = boxIndex + 1
          if (nextIndex < selectedWordSize) {
            setSelectedBoxIndex(nextIndex)
          }
        } else if (word.length < selectedWordSize) {
          setWords(prev => ({
            ...prev,
            [selectedWordSize]: word + letter
          }))
        }

        setLetterMarking(prev => ({
          ...prev,
          [selectedWordSize]: []
        }))
      }
      // Handle Backspace to delete
      else if (e.key === 'Backspace') {
        e.preventDefault()

        const word = words[selectedWordSize]
        if (word.length > 0) {
          setWords(prev => ({
            ...prev,
            [selectedWordSize]: word.slice(0, -1)
          }))
        }

        // Move selection backwards
        if (selectedBoxIndex !== null && selectedBoxIndex > 0) {
          setSelectedBoxIndex(selectedBoxIndex - 1)
        } else if (selectedBoxIndex === 0) {
          setSelectedBoxIndex(null)
        }

        setLetterMarking(prev => ({
          ...prev,
          [selectedWordSize]: []
        }))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedWordSize, selectedBoxIndex, words, disabledLetters])

  // Auto-check all words for completion and validity
  useEffect(() => {
    let allComplete = true
    let allValid = true
    const marking = {}

    for (const size of [5, 4, 3, 2, 1]) {
      const word = words[size].replace(/_/g, '')
      marking[size] = []

      if (word.length !== size) {
        allComplete = false
      }

      if (word.length > 0) {
        const valid = isValidWord(word)
        for (let i = 0; i < word.length; i++) {
          marking[size][i] = valid ? 'correct' : 'wrong'
        }
        if (!valid) {
          allValid = false
        }
      }
    }

    setLetterMarking(marking)

    if (allComplete && allValid && !puzzleSolved && !showSolution) {
      setPuzzleSolved(true)
      setMessage('🎉 Congratulations, Well Done!')
      onSolved()
      setTimeout(() => {
        onBack()
      }, 2000)
    }
  }, [words, puzzleSolved, showSolution, onSolved, onBack])

  const showSolutionWords = () => {
    setShowSolution(true)
    setWords({
      5: puzzle.fiveLetters,
      4: puzzle.fourLetters,
      3: puzzle.threeLetters,
      2: puzzle.twoLetters,
      1: puzzle.oneLetter
    })
    const marking = {}
    for (const size of [5, 4, 3, 2, 1]) {
      marking[size] = Array(size).fill('correct')
    }
    setLetterMarking(marking)
    onGaveUp()
  }

  const resetPuzzle = () => {
    setWords({ 5: '', 4: '', 3: '', 2: '', 1: '' })
    setMessage('')
    setLetterMarking({})
    setSelectedBoxIndex(null)
    setShowSolution(false)
    setPuzzleSolved(false)
  }

  const clearCurrentWord = () => {
    setWords(prev => ({
      ...prev,
      [selectedWordSize]: ''
    }))

    setLetterMarking(prev => ({
      ...prev,
      [selectedWordSize]: []
    }))
    setSelectedBoxIndex(null)
  }

  return (
    <div className="container">
      {message && (
        <div className={`message ${message.includes('✓') || message.includes('🎉') ? 'success' : 'error'}`}>
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
            <p>When the game starts, a 6-letter word will appear from an A-Z alphabet. Using the remaining letters of the alphabet, make a 5-letter word, a 4-letter word, a 3-letter word, a 2-letter word &amp; a 1-letter word in the boxes. Each alphabet letter can only be used once. All valid words are regular everyday english words.</p>
            <h3>Additional Rules:</h3>
            <ul>
              <li>All 5 words must have <strong>exactly one vowel</strong> each</li>
              <li>The 1-letter word can only be <strong>A</strong> or <strong>I</strong></li>
              <li>Click any word box to select it, then type letters</li>
              <li>Use your keyboard (A-Z) or click letter buttons</li>
              <li>Press <strong>Delete</strong> or <strong>Backspace</strong> to remove a letter</li>
              <li>Words are validated automatically as you complete them</li>
            </ul>
            <button className="btn" onClick={() => setShowRules(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="buttons-row">
        <button className="btn reveal" onClick={showSolution ? () => window.location.reload() : showSolutionWords}>
          {showSolution ? 'New Game' : 'Reveal'}
        </button>
        <button className="btn" onClick={clearCurrentWord}>Clear</button>
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
                  className={`word-box ${words[size][i] && words[size][i] !== '_' ? 'filled' : 'empty'} ${selectedWordSize === size && selectedBoxIndex === i ? 'focused' : selectedWordSize === size ? 'selected' : ''} ${letterMarking[size]?.[i] ? letterMarking[size][i] : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBoxClick(size, i)
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleBoxClick(size, i)
                  }}
                >
                  {(words[size][i] && words[size][i] !== '_') ? words[size][i] : ''}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="keyboard-container">
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="keyboard-row">
              {row.map((key, keyIndex) => {
                if (key === '') {
                  return <div key={keyIndex} className="keyboard-spacer"></div>
                }
                if (key === 'DEL') {
                  return (
                    <button
                      key={key}
                      className="keyboard-key delete-key"
                      onClick={handleDeleteLetter}
                      onTouchEnd={(e) => {
                        e.preventDefault()
                        handleDeleteLetter()
                      }}
                    >
                      ⌫
                    </button>
                  )
                }
                return (
                  <button
                    key={key}
                    className={`keyboard-key ${disabledLetters.has(key) ? 'used' : ''}`}
                    onClick={() => handleLetterClick(key)}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      handleLetterClick(key)
                    }}
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