import { useState, useEffect, useCallback } from 'react'
import { puzzles } from './puzzles'
import Game from './components/Game'
import { parsePuzzleIndexFromPath, navigateToPuzzle } from './routing'
import './App.css'

export default function App() {
  const [puzzleIndex, setPuzzleIndex] = useState(() =>
    parsePuzzleIndexFromPath(window.location.pathname, puzzles.length)
  )
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('wordGameStats')
    const savedStats = saved ? JSON.parse(saved) : []

    return puzzles.map((_, i) =>
      savedStats[i] || {
        id: i,
        status: 'unsolved',
        attempts: 0,
        solved: false
      }
    )
  })

  useEffect(() => {
    localStorage.setItem('wordGameStats', JSON.stringify(stats))
  }, [stats])

  useEffect(() => {
    const onPopState = () => {
      setPuzzleIndex(parsePuzzleIndexFromPath(window.location.pathname, puzzles.length))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goToPuzzle = useCallback((index) => {
    const clamped = Math.min(Math.max(index, 0), puzzles.length - 1)
    navigateToPuzzle(clamped)
    setPuzzleIndex(clamped)
  }, [])

  const handleNextPuzzle = () => {
    goToPuzzle((puzzleIndex + 1) % puzzles.length)
  }

  const handlePuzzleSolved = () => {
    setStats(prev => {
      const newStats = [...prev]
      newStats[puzzleIndex] = {
        ...newStats[puzzleIndex],
        status: 'solved',
        solved: true,
        attempts: (newStats[puzzleIndex].attempts || 0) + 1
      }
      return newStats
    })
  }

  const handlePuzzleGaveUp = () => {
    setStats(prev => {
      const newStats = [...prev]
      newStats[puzzleIndex] = {
        ...newStats[puzzleIndex],
        status: 'gaveup',
        attempts: (newStats[puzzleIndex].attempts || 0) + 1
      }
      return newStats
    })
  }

  return (
    <Game
      key={puzzleIndex}
      puzzle={puzzles[puzzleIndex]}
      puzzleIndex={puzzleIndex}
      onSolved={handlePuzzleSolved}
      onGaveUp={handlePuzzleGaveUp}
      onNextPuzzle={handleNextPuzzle}
      totalPuzzles={puzzles.length}
    />
  )
}
