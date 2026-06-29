import { useState, useEffect, useCallback } from 'react'
import { puzzles } from './puzzles'
import Menu from './components/Menu'
import Game from './components/Game'
import PuzzleTreeViewer from './components/PuzzleTreeViewer'
import {
  parsePuzzleIndexFromPath,
  isMenuPath,
  isTreePath,
  navigateToPuzzle,
} from './routing'
import './App.css'

export default function App() {
  const [showMenu, setShowMenu] = useState(() =>
    isMenuPath(window.location.pathname)
  )
  const [showTree, setShowTree] = useState(() =>
    isTreePath(window.location.pathname)
  )
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
      setShowMenu(isMenuPath(window.location.pathname))
      setShowTree(isTreePath(window.location.pathname))
      setPuzzleIndex(parsePuzzleIndexFromPath(window.location.pathname, puzzles.length))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (showTree) {
      window.gtag?.('event', 'page_view', { page_title: 'Puzzle Tree', page_path: '/tree' })
    } else if (showMenu) {
      window.gtag?.('event', 'page_view', { page_title: 'Menu', page_path: '/menu' })
    } else {
      window.gtag?.('event', 'page_view', { page_title: `Puzzle #${puzzleIndex + 1}`, page_path: `/puzzle/${puzzleIndex + 1}` })
    }
  }, [showTree, showMenu, puzzleIndex])

  const goToPuzzle = useCallback((index) => {
    const clamped = Math.min(Math.max(index, 0), puzzles.length - 1)
    navigateToPuzzle(clamped)
    setShowMenu(false)
    setPuzzleIndex(clamped)
    window.gtag?.('event', 'puzzle_selected', { puzzle_index: clamped + 1, puzzle_word: puzzles[clamped].sixLetter })
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

  const solvedCount = stats.filter(s => s.solved).length
  const gaveUpCount = stats.filter(s => s.status === 'gaveup').length

  if (showTree) {
    return <PuzzleTreeViewer />
  }

  if (showMenu) {
    return (
      <Menu
        puzzles={puzzles}
        stats={stats}
        onSelectPuzzle={goToPuzzle}
        solvedCount={solvedCount}
        gaveUpCount={gaveUpCount}
      />
    )
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
