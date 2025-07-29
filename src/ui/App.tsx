import './App.css'
import { useEffect, useState, useRef } from 'react'
import { initUISetters } from '../game/main'
import unatcoURL from '/assets/sounds/unatco.mp3'

// import VoiceCommand from './helpers/speech'
// import Canvas from './components/Canvas'
function App() {
  
  const [showMainMenu, setShowMainMenu] = useState(true)
  const [showReturnToMainMenu, setShowReturnToMainMenu] = useState(false)
  const [score, setScore] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleStartGame = () => {
    audioRef.current?.play()
    setShowMainMenu(false)
    setShowReturnToMainMenu(true)
  }
  const handleReturnToMainMenu = () => {
    setShowMainMenu(true)
    setShowReturnToMainMenu(false)
  }

  const handlePlayAgain = () => {
    window.location.reload()
  }

  useEffect(() => {
    initUISetters({setShowMainMenu, setShowReturnToMainMenu, setScore})
    if (audioRef.current) {
      console.log(audioRef.current)
      audioRef.current.volume = 0.02;
    }
  }, [])
  

  // const handleKeyDown = (keyPressEvent: any) => {
  //   if (keyPressEvent.code === "KeyX") {
  //     setShowMainMenu(false)
  //     setShowReturnToMainMenu(true)
  //   }
  //   if (keyPressEvent.code === "KeyC") {
  //     setShowMainMenu(true)
  //     setShowReturnToMainMenu(false)
  //   }
  // }
  // window.addEventListener("keydown", handleKeyDown)

  return (
    <>
      <audio ref={audioRef} src={unatcoURL} loop/>
      {showMainMenu && (
        <div className="backdrop-blur-xs bg-white/10 text-white text-4xl font-bold px-8 py-6 rounded-xl shadow-lg h-screen w-screen">
          Welcome to Los Pollos Hermanos
          <p>
            The year is 2077, and after your PhD in Computer Science, you have finally acquired the 
            highly coveted job of being a manager at your local "Los Pollos Hermanos".
          </p>
          <p>
            The franchise was acquired by a Multi Billionaire Tech Extremist CEO recently,
            and its human staff have been gradually replaced by robots since then. 
          </p>
            This morning, the robots received a new update to the company's latest AGI model. 
            You notice that this model is not very interested in taking orders from humans, and prefers to dance instead.
            But as the manager, it is your job to ensure that your Los Pollos branch maintains a profit.
          <p>
            You have three minutes to ensure that you make a profit, or else you'll be promoted to customer.
            GOOD LUCK!
          </p>
          <button onClick={handleStartGame}>PLAY</button>
        </div>
      )}
      {showReturnToMainMenu && (
        <div className="backdrop-blur-xs bg-white/10 text-white text-2xl font-bold px-8 py-6 rounded-xl shadow-lg">
          <button onClick={handleReturnToMainMenu}>Return To Main Menu</button>
        </div>
      )}
      {showReturnToMainMenu && (
        <div className="backdrop-blur-xs bg-white/10 text-white text-2xl font-bold px-8 py-6 rounded-xl shadow-lg">
          <h1>Score: {score}</h1>
        </div>
      )}
      <div className="backdrop-blur-xs bg-white/10 text-white text-2xl font-bold px-8 py-6 rounded-xl shadow-lg">
          <button onClick={handlePlayAgain}>Restart</button>
        </div>
      {/* <VoiceCommand /> */}
    </>
  )
}

export default App