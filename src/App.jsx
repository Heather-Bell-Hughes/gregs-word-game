import { useState, useEffect } from 'react'
import { puzzles, getAllLettersForPuzzle } from './puzzles'
import Menu from './components/Menu'
import Game from './components/Game'
import './App.css'

export default function App() {
  const [currentView, setCurrentView] = useState('menu') // 'menu' or 'game'
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('wordGameStats')
    const savedStats = saved ? JSON.parse(saved) : []

    // Ensure we have an entry for each puzzle
    return puzzles.map((_, i) =>
      savedStats[i] || {
        id: i,
        status: 'unsolved', // 'solved', 'gaveup', 'unsolved'
        attempts: 0,
        solved: false
      }
    )
  })

  useEffect(() => {
    localStorage.setItem('wordGameStats', JSON.stringify(stats))
  }, [stats])

  const handlePuzzleSelect = (index) => {
    setCurrentPuzzleIndex(index)
    setCurrentView('game')
  }

  const handleBackToMenu = () => {
    setCurrentView('menu')
  }

  const handlePuzzleSolved = () => {
    setStats(prev => {
      const newStats = [...prev]
      newStats[currentPuzzleIndex] = {
        ...newStats[currentPuzzleIndex],
        status: 'solved',
        solved: true,
        attempts: (newStats[currentPuzzleIndex].attempts || 0) + 1
      }
      return newStats
    })
  }

  const handlePuzzleGaveUp = () => {
    setStats(prev => {
      const newStats = [...prev]
      newStats[currentPuzzleIndex] = {
        ...newStats[currentPuzzleIndex],
        status: 'gaveup',
        attempts: (newStats[currentPuzzleIndex].attempts || 0) + 1
      }
      return newStats
    })
  }

  const getSolvedCount = () => stats.filter(s => s.solved).length
  const getGaveUpCount = () => stats.filter(s => s.status === 'gaveup').length

  return (
    <>
      {currentView === 'menu' ? (
        <Menu
          puzzles={puzzles}
          stats={stats}
          onSelectPuzzle={handlePuzzleSelect}
          solvedCount={getSolvedCount()}
          gaveUpCount={getGaveUpCount()}
        />
      ) : (
        <Game
          puzzle={puzzles[currentPuzzleIndex]}
          puzzleIndex={currentPuzzleIndex}
          onBack={handleBackToMenu}
          onSolved={handlePuzzleSolved}
          onGaveUp={handlePuzzleGaveUp}
          totalPuzzles={puzzles.length}
        />
      )}
    </>
  )
}