import { useState, useEffect } from 'react'
import styles from './PuzzleTreeViewer.module.css'
import { puzzles } from '../puzzles'

const puzzleMap = new Map(puzzles.map((p, i) => [p.sixLetter, i + 1]))

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

async function fetchNodeData(pathArr) {
  const suffix = pathArr.length ? pathArr.join('/') + '/' : ''
  const res = await fetch(`${base}/puzzle-tree/${suffix}index.json`)
  if (!res.ok) throw new Error(`${res.status} loading ${suffix}index.json`)
  return res.json()
}

function mergeAt(tree, path, data) {
  if (path.length === 0) return { ...tree, ...data }
  const [head, ...rest] = path
  return {
    ...tree,
    children: {
      ...(tree.children ?? {}),
      [head]: mergeAt(tree.children?.[head] ?? {}, rest, data)
    }
  }
}

function nodeAt(tree, path) {
  let cur = tree
  for (const w of path) {
    if (!cur?.children?.[w]) return null
    cur = cur.children[w]
  }
  return cur
}

export default function PuzzleTreeViewer() {
  const [tree, setTree]               = useState(null)
  const [navPath, setNavPath]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [fetchError, setFetchError]   = useState(null)

  useEffect(() => {
    fetchNodeData([])
      .then(data => { setTree(data); setLoading(false) })
      .catch(err  => { setFetchError(err.message); setLoading(false) })
  }, [])

  async function navigateTo(word, terminal = false) {
    const newPath = [...navPath, word]
    if (terminal) { setNavPath(newPath); return }

    const node = nodeAt(tree, newPath)
    if (node?.children !== undefined) {
      setNavPath(newPath)
      return
    }

    setLoading(true)
    try {
      const data = await fetchNodeData(newPath)
      setTree(prev => mergeAt(prev, newPath, data))
      setNavPath(newPath)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!tree && loading) return <div className={styles.container}><p>Loading puzzle tree…</p></div>
  if (fetchError)        return <div className={styles.container}><p className={styles.error}>{fetchError}</p></div>

  const currentNode     = nodeAt(tree, navPath) ?? tree
  const currentChildren = currentNode?.children ?? {}
  const visibleChildren = Object.entries(currentChildren)
    .filter(([w, c]) => w.length + c.maxDepth >= 6)
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className={styles.container}>
      <div className={styles.dagView}>
        <div className={styles.scrollArea}>
          <h1 className={styles.title}>Puzzle Tree</h1>
          <p className={styles.subtitle}>Build a new puzzle from the bottom up</p>
          {navPath.length > 0 && (
            <div className={styles.pathStack}>
              {[...navPath].reverse().map((word, i) => {
                const depth   = navPath.length - 1 - i
                const isFinal = word.length === 6
                return (
                  <button
                    key={word}
                    className={`${styles.pathWord} ${isFinal ? styles.pathWordFinal : ''}`}
                    onClick={() => setNavPath(navPath.slice(0, depth + 1))}
                  >
                    {word}
                  </button>
                )
              })}
            </div>
          )}

          {navPath.length < 6 && (
            <div className={styles.levelHeader}>
              <span className={styles.levelLabel}>{navPath.length + 1}-letter words</span>
              {loading && <span className={styles.loadingLabel}>Loading…</span>}
            </div>
          )}

          {navPath.length === 6 ? (
            <div className={styles.pathComplete}>
              {puzzleMap.get(navPath[5])
                ? <><div className={styles.pathCompleteTitle}>Already a puzzle</div><div className={styles.pathCompleteNum}>Puzzle #{puzzleMap.get(navPath[5])}</div></>
                : <><div className={styles.pathCompleteTitle}>New puzzle candidate</div><div className={styles.pathCompleteSub}>This path has no puzzle yet</div></>
              }
            </div>
          ) : (
            <div className={styles.nodes}>
              {visibleChildren.map(([word, child]) => {
                const isTerminal = child.maxDepth === 0
                const puzzleNum  = puzzleMap.get(word)
                const hasPuzzle  = isTerminal ? !!puzzleNum : !child.hasUnpuzzled
                return (
                  <div
                    key={word}
                    className={`${styles.node} ${isTerminal ? styles.terminalNode : ''} ${hasPuzzle ? styles.nodePuzzled : styles.nodeUnpuzzled}`}
                    onClick={() => navigateTo(word, isTerminal)}
                  >
                    <span>{word}</span>
                    {isTerminal && <div className={styles.depthBadge}>end</div>}
                    {puzzleNum && <div className={styles.puzzleBadge}>Puzzle #{puzzleNum}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={styles.bottomBar}>
          {navPath.length > 0 && (
            <button className={styles.backButton} onClick={() => setNavPath(p => p.slice(0, -1))}>← Back</button>
          )}
          {navPath.length > 1 && (
            <button className={styles.resetBtn} onClick={() => setNavPath([])}>Reset</button>
          )}
          <span className={styles.bottomSpacer} />
          <span className={styles.legendDot} style={{ background: '#81c784' }} />
          <span className={styles.legendText}>unpuzzled</span>
          <span className={styles.legendSep} />
          <span className={styles.legendDot} style={{ background: '#ffb347' }} />
          <span className={styles.legendText}>puzzled</span>
        </div>
      </div>
    </div>
  )
}
