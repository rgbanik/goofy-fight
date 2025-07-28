import './App.css'
import { useEffect, useState, useRef } from 'react'
import { initUISetters } from '../game/main'
import unatcoURL from '/assets/sounds/unatco.mp3'

// import VoiceCommand from './helpers/speech'
// import Canvas from './components/Canvas'
function App() {
  
  const [showMainMenu, setShowMainMenu] = useState(true)
  const [showReturnToMainMenu, setShowReturnToMainMenu] = useState(false)
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

  useEffect(() => {
    initUISetters({setShowMainMenu, setShowReturnToMainMenu})
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
            The franchise was acquired by Multi Billionaire Tech Extremist and robotics company Microdong founder Gill Bates on April 20th 2069,
            and its human staff have been gradually replaced by robots since then. 
          </p>
          <p>
            Until recently, these robots have been running on Microdong's signature AGI model Hawk 1.5,
            but the robots were upgraded to run on Microdong's latest AGI model, Hawk 2A, this morning. 
          </p>
            You notice that this model is not very interested in taking orders from humans, and prefers to dance instead.
            But as the manager, it is your job to ensure that your Los Pollos branch maintains a profit.
          <p>
            You have three minutes to ensure that your profit doesn't stay bellow 1 Million Dollars, or Gill Bates will vaporize you.
            GOOD LUCK!
            <button onClick={handleStartGame}>PLAY</button>
          </p>
        </div>
      )}
      {showReturnToMainMenu && (
        <div className="backdrop-blur-xs bg-white/10 text-white text-2xl font-bold px-8 py-6 rounded-xl shadow-lg">
          <button onClick={handleReturnToMainMenu}>Return To Main Menu</button>
        </div>
      )}
      {/* <VoiceCommand /> */}
    </>
  )
}

export default App