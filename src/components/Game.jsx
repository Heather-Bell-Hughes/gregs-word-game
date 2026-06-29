import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { isValidWord } from '../dictionary'
import { WORD_ORDER, getUsedLetters } from '../letterUsage'
import { wordSlots, setLetterAt, deleteLetterAt, firstEmptySlot, isWordFull } from '../wordSlots'

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
]

export default function Game({ puzzle, puzzleIndex, onSolved, onGaveUp, onNextPuzzle, totalPuzzles }) {
  const [words, setWords] = useState({
    5: '',
    4: '',
    3: '',
    2: '',
    1: ''
  })
  const [selectedWordSize, setSelectedWordSize] = useState(5)
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null)
  const sixLetter = puzzle.sixLetter
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

  const advanceFromWord = useCallback((wordSize, newWord) => {
    if (!isWordFull(newWord, wordSize) || !isValidWord(newWord.replace(/_/g, ''))) return
    const currentIndex = WORD_ORDER.indexOf(wordSize)
    if (currentIndex >= WORD_ORDER.length - 1) return
    const nextSize = WORD_ORDER[currentIndex + 1]
    selectedWordSizeRef.current = nextSize
    selectedBoxIndexRef.current = 0
    setSelectedWordSize(nextSize)
    setSelectedBoxIndex(0)
  }, [])

  const resolveInputTarget = useCallback(() => {
    let wordSize = selectedWordSizeRef.current
    let word = wordsRef.current[wordSize]
    let boxIndex = selectedBoxIndexRef.current

    // Only skip ahead to the next row when typing without a selected letter box.
    // If the player clicked a letter, they want to edit this row — even if it's green.
    if (
      boxIndex === null &&
      isWordFull(word, wordSize) &&
      isValidWord(word.replace(/_/g, ''))
    ) {
      const currentIndex = WORD_ORDER.indexOf(wordSize)
      if (currentIndex < WORD_ORDER.length - 1) {
        wordSize = WORD_ORDER[currentIndex + 1]
        word = wordsRef.current[wordSize]
        boxIndex = 0
      }
    }

    return { wordSize, word, boxIndex }
  }, [])

  const updateWordMarking = useCallback((wordSize, word) => {
    if (isWordFull(word, wordSize)) {
      const valid = isValidWord(word.replace(/_/g, ''))
      setLetterMarking(prev => ({
        ...prev,
        [wordSize]: wordSlots(word, wordSize).map(() => valid ? 'correct' : 'wrong')
      }))
    } else {
      setLetterMarking(prev => ({ ...prev, [wordSize]: [] }))
    }
  }, [])

  const keyboardUsedLetters = useMemo(
    () => getUsedLetters(
      words,
      sixLetter,
      selectedBoxIndex !== null ? selectedWordSize : null,
      selectedBoxIndex
    ),
    [words, sixLetter, selectedWordSize, selectedBoxIndex]
  )

  const applyLetterInput = useCallback((letter) => {
    let { wordSize, word, boxIndex } = resolveInputTarget()

    const usedLetters = getUsedLetters(
      wordsRef.current,
      sixLetter,
      boxIndex !== null ? wordSize : null,
      boxIndex
    )
    if (usedLetters.has(letter)) return

    if (wordSize !== selectedWordSizeRef.current) {
      selectedWordSizeRef.current = wordSize
      selectedBoxIndexRef.current = boxIndex ?? 0
      setSelectedWordSize(wordSize)
      setSelectedBoxIndex(boxIndex ?? 0)
    }

    const slots = wordSlots(word, wordSize)
    if (boxIndex !== null && boxIndex < wordSize && slots[boxIndex] === letter) {
      const nextIndex = boxIndex + 1
      if (nextIndex < wordSize) {
        selectedBoxIndexRef.current = nextIndex
        setSelectedBoxIndex(nextIndex)
      }
      return
    }

    let newWord = null

    if (boxIndex !== null && boxIndex < wordSize) {
      newWord = setLetterAt(word, wordSize, boxIndex, letter)
      setWords(prev => ({ ...prev, [wordSize]: newWord }))
      const nextIndex = boxIndex + 1
      if (nextIndex < wordSize) {
        selectedBoxIndexRef.current = nextIndex
        setSelectedBoxIndex(nextIndex)
      }
    } else {
      const emptyIndex = firstEmptySlot(word, wordSize)
      if (emptyIndex !== -1) {
        newWord = setLetterAt(word, wordSize, emptyIndex, letter)
        setWords(prev => ({ ...prev, [wordSize]: newWord }))
      }
    }

    if (newWord !== null) {
      updateWordMarking(wordSize, newWord)
      advanceFromWord(wordSize, newWord)
    }
  }, [sixLetter, resolveInputTarget, advanceFromWord, updateWordMarking])

  const handleLetterClick = useCallback((letter) => {
    applyLetterInput(letter)
  }, [applyLetterInput])

  const selectBox = useCallback((wordSize, boxIndex) => {
    selectedWordSizeRef.current = wordSize
    selectedBoxIndexRef.current = boxIndex
    setSelectedWordSize(wordSize)
    setSelectedBoxIndex(boxIndex)
  }, [])

  const handleBoxClick = (size, index) => {
    selectBox(size, index)
  }

  const handleWordBoxSelect = (size) => {
    const word = wordsRef.current[size]
    selectedWordSizeRef.current = size
    setSelectedWordSize(size)
    if (word.replace(/_/g, '').length === 0) {
      selectedBoxIndexRef.current = 0
      setSelectedBoxIndex(0)
    } else {
      const slots = wordSlots(word, size)
      let index = slots.findLastIndex(c => c !== '_')
      if (index === -1) index = 0
      selectedBoxIndexRef.current = index
      setSelectedBoxIndex(index)
    }
  }

  const applyBackspace = useCallback((wordSize, boxIndex) => {
    const word = wordsRef.current[wordSize]
    const slots = wordSlots(word, wordSize)

    let currentIndex = boxIndex
    if (currentIndex === null) {
      currentIndex = slots.findLastIndex(c => c !== '_')
      if (currentIndex === -1) currentIndex = 0
    }

    if (slots[currentIndex] !== '_') {
      const newWord = deleteLetterAt(word, wordSize, currentIndex)
      if (newWord !== word) {
        setWords(prev => ({ ...prev, [wordSize]: newWord }))
        updateWordMarking(wordSize, newWord)
      }
    }

    selectBox(wordSize, Math.max(0, currentIndex - 1))
  }, [updateWordMarking, selectBox])

  const navigateBox = useCallback((direction) => {
    const wordSize = selectedWordSizeRef.current
    let boxIndex = selectedBoxIndexRef.current
    const word = wordsRef.current[wordSize]
    const slots = wordSlots(word, wordSize)

    if (boxIndex === null) {
      boxIndex = direction === 'left'
        ? (slots.findLastIndex(c => c !== '_') !== -1 ? slots.findLastIndex(c => c !== '_') : 0)
        : 0
    } else {
      boxIndex = direction === 'left'
        ? Math.max(0, boxIndex - 1)
        : Math.min(wordSize - 1, boxIndex + 1)
    }

    selectBox(wordSize, boxIndex)
  }, [selectBox])

  const handleDeleteLetter = useCallback(() => {
    applyBackspace(selectedWordSizeRef.current, selectedBoxIndexRef.current)
  }, [applyBackspace])

  // Keyboard handler that always uses current state
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        return
      }

      const letter = e.key.toUpperCase()

      if (/^[A-Z]$/.test(letter)) {
        e.preventDefault()
        applyLetterInput(letter)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBox('left')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateBox('right')
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        applyBackspace(selectedWordSizeRef.current, selectedBoxIndexRef.current)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [applyLetterInput, applyBackspace, navigateBox])

  // Auto-check all words for completion and validity
  useEffect(() => {
    let allComplete = true
    let allValid = true
    const marking = {}

    for (const size of [5, 4, 3, 2, 1]) {
      const word = words[size]
      const clean = word.replace(/_/g, '')
      marking[size] = []

      if (!isWordFull(word, size)) {
        allComplete = false
      }

      if (isWordFull(word, size)) {
        const valid = isValidWord(clean)
        for (let i = 0; i < size; i++) {
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
      window.gtag?.('event', 'puzzle_solved', { puzzle_index: puzzleIndex, puzzle_word: puzzle.sixLetter })
      onSolved()
    }
  }, [words, puzzleSolved, showSolution, onSolved])

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
    window.gtag?.('event', 'puzzle_gave_up', { puzzle_index: puzzleIndex, puzzle_word: puzzle.sixLetter })
    onGaveUp()
  }

  const resetPuzzle = () => {
    setWords({ 5: '', 4: '', 3: '', 2: '', 1: '' })
    setMessage('')
    setLetterMarking({})
    setSelectedWordSize(5)
    setSelectedBoxIndex(0)
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
    selectedBoxIndexRef.current = 0
    setSelectedBoxIndex(0)
  }

  return (
    <div className="container" data-testid="game-screen">
      {message && (
        <div className={`message ${message.includes('✓') || message.includes('🎉') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="header">
        <div className="header-spacer" aria-hidden="true" />
        <div className="puzzle-title">AlphaDelta #{puzzleIndex + 1}</div>
        <button className="info-btn" onClick={() => setShowRules(!showRules)}>?</button>
      </div>

      {showRules && (
        <div className="rules-modal">
          <div className="rules-content">
            <h2>How to Play</h2>
            <p>When the game starts, a 6-letter word will appear from an A-Z alphabet. Using the remaining letters of the alphabet, make a 5-letter word, a 4-letter word, a 3-letter word, a 2-letter word &amp; a 1-letter word in the boxes. Each alphabet letter can only be used once. All valid words are regular everyday english words.</p>
            <button className="btn" onClick={() => setShowRules(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="buttons-row">
        {(showSolution || puzzleSolved) ? (
          <button className="btn reveal" onClick={onNextPuzzle}>
            New Game
          </button>
        ) : (
          <button className="btn reveal" onClick={showSolutionWords}>
            Solution
          </button>
        )}
        {!puzzleSolved && !showSolution && <button className="btn" data-testid="clear-btn" onClick={clearCurrentWord}>Clear</button>}
        {!puzzleSolved && !showSolution && <button className="btn restart" data-testid="restart-btn" onClick={() => {
          if (confirm('Are you sure you want to restart the puzzle?')) {
            resetPuzzle()
          }
        }}>Restart</button>}
      </div>

      <div className="puzzle-area">
        <div className="word-boxes-container">
          <div className="word-row six-letter-row" data-testid="six-letter-row">
            {puzzle.sixLetter.split('').map((letter, i) => (
              <div key={i} className="letter-box">{letter}</div>
            ))}
          </div>

          {[5, 4, 3, 2, 1].map(size => {
            const slots = wordSlots(words[size], size)
            return (
            <div key={size} className="word-row" data-word-size={size} data-testid={`word-row-${size}`} onClick={() => handleWordBoxSelect(size)}>
              {slots.map((letter, i) => (
                <button
                  key={i}
                  type="button"
                  data-testid={`word-box-${size}-${i}`}
                  aria-label={`${size}-letter word, position ${i + 1}${letter !== '_' ? `, letter ${letter}` : ', empty'}${selectedWordSize === size && selectedBoxIndex === i ? ', selected' : ''}`}
                  className={`word-box ${letter !== '_' ? 'filled' : 'empty'} ${selectedWordSize === size && selectedBoxIndex === i ? 'focused' : selectedWordSize === size ? 'selected' : ''} ${letterMarking[size]?.[i] ? letterMarking[size][i] : ''}`}
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
                  {letter !== '_' ? letter : ''}
                </button>
              ))}
            </div>
            )
          })}
        </div>

        <div className="keyboard-container" data-testid="keyboard">
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
                      type="button"
                      data-testid="keyboard-delete"
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
                    type="button"
                    data-testid={`keyboard-key-${key}`}
                    className={`keyboard-key ${keyboardUsedLetters.has(key) ? 'used' : ''}`}
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