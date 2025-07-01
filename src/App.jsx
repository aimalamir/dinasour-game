import { useState, useRef, useEffect } from 'react'


const GROUND_Y = 200
const DINO_WIDTH = 40
const DINO_HEIGHT = 40
const OBSTACLE_WIDTH = 20
const OBSTACLE_HEIGHT = 40
const GRAVITY = 0.5         // Slower gravity for a slower, floatier jump
const JUMP_VELOCITY = -18   // Bigger jump (more negative = higher jump)
const GAME_WIDTH = 600
const GAME_HEIGHT = 250
const OBSTACLE_GAP = 200
const OBSTACLE_SPEED = 3    // Slower obstacle speed

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function App() {
  const [dinoY, setDinoY] = useState(GROUND_Y)
  const [velocity, setVelocity] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [obstacles, setObstacles] = useState([
    { x: GAME_WIDTH + 100, y: GROUND_Y }
  ])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const animationRef = useRef()
  const gameAreaRef = useRef()

  // Handle jump
  useEffect(() => {
    function handleSpace(e) {
      if ((e.code === "Space" || e.key === " ") && !isJumping && !gameOver) {
        setVelocity(JUMP_VELOCITY)
        setIsJumping(true)
      }
      if (gameOver && (e.code === "Space" || e.key === " ")) {
        restartGame()
      }
    }
    window.addEventListener('keydown', handleSpace)
    return () => window.removeEventListener('keydown', handleSpace)
    /// eslint-disable-next-line
  }, [isJumping, gameOver])

  // Game loop
  useEffect(() => {
    if (gameOver) {
      cancelAnimationFrame(animationRef.current)
      return
    }
    function gameLoop() {
      // Dino physics
      setDinoY(prevY => {
        let nextY = prevY + velocity
        if (nextY >= GROUND_Y) {
          setIsJumping(false)
          setVelocity(0)
          return GROUND_Y
        } else {
          setVelocity(v => v + GRAVITY)
          return nextY
        }
      })

      // Move obstacles
      setObstacles(prevObs => {
        let newObs = prevObs
          .map(ob => ({ ...ob, x: ob.x - OBSTACLE_SPEED }))
          .filter(ob => ob.x + OBSTACLE_WIDTH > 0)

        // Add new obstacle if needed
        if (
          newObs.length === 0 ||
          newObs[newObs.length - 1].x < GAME_WIDTH - OBSTACLE_GAP
        ) {
          newObs.push({
            x: GAME_WIDTH + getRandomInt(0, 100),
            y: GROUND_Y
          })
        }
        return newObs
      })

      // Collision detection
      obstacles.forEach(ob => {
        if (
          ob.x < 60 + DINO_WIDTH &&
          ob.x + OBSTACLE_WIDTH > 60 &&
          dinoY + DINO_HEIGHT > ob.y
        ) {
          setGameOver(true)
        }
      })

      // Score
      setScore(prevScore => prevScore + 1)

      animationRef.current = requestAnimationFrame(gameLoop)
    }
    animationRef.current = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationRef.current)
    /// eslint-disable-next-line
  }, [velocity, obstacles, dinoY, gameOver])

  function restartGame() {
    setDinoY(GROUND_Y)
    setVelocity(0)
    setIsJumping(false)
    setObstacles([{ x: GAME_WIDTH + 100, y: GROUND_Y }])
    setScore(0)
    setGameOver(false)
  }

  return (
    <div
      ref={gameAreaRef}
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        background: "#f7f7f7",
        border: "2px solid #222",
        margin: "40px auto",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 16px #0002"
      }}
      tabIndex={0}
    >
      {/* Dino */}
      <div
        style={{
          position: "absolute",
          left: 60,
          bottom: 0,
          width: DINO_WIDTH,
          height: DINO_HEIGHT,
          background: "#222",
          borderRadius: 8,
          transform: `translateY(-${GAME_HEIGHT - dinoY - DINO_HEIGHT}px)`,
          transition: "background 0.1s"
        }}
      />
      {/* Obstacles */}
      {obstacles.map((ob, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: ob.x,
            bottom: 0,
            width: OBSTACLE_WIDTH,
            height: OBSTACLE_HEIGHT,
            background: "#4caf50",
            borderRadius: 4
          }}
        />
      ))}
      {/* Ground */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: 4,
          background: "#888"
        }}
      />
      {/* Score */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 20,
          fontSize: 22,
          fontWeight: "bold",
          color: "#222"
        }}
      >
        Score: {score}
      </div>
      {/* Game Over */}
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            color: "#222",
            padding: "24px 40px",
            borderRadius: 12,
            fontSize: 28,
            fontWeight: "bold",
            boxShadow: "0 2px 12px #0003",
            textAlign: "center"
          }}
        >
          Game Over<br />
          <span style={{ fontSize: 18, fontWeight: 400 }}>
            Press Space to Restart
          </span>
        </div>
      )}
      {/* Instructions */}
      {!gameOver && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 20,
            fontSize: 16,
            color: "#555"
          }}
        >
          Press Space to Jump
        </div>
      )}
    </div>
  )
}

export default App
