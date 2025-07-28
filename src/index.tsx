import { createRoot } from 'react-dom/client'
import './index.css'
import App from './ui/App'
import { PhysicsTest } from './game/main'

// enable3d scene creation  
const test = new PhysicsTest()
test.create()

// React UI Creation
createRoot(document.getElementById('root')!).render(<App />)