import { useEffect, useRef } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import FighterModelUrl from '../assets/models/Fighter.glb?url'
import FlairDanceUrl from '../assets/animations/FighterDance.glb?url'


const Canvas = () => {
    const canvasRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        // SCENE
        const scene: THREE.Scene = new THREE.Scene()

        // RENDERER
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({antialias: true})
        renderer.setSize(window.innerWidth, window.innerHeight)
        canvasRef.current?.appendChild(renderer.domElement)

        // CAMERA
        const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
            75, // I like a large FOV, but is this impacting performance?
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        camera.position.set(0, 5, 5)
        camera.lookAt(0, 0, 0)

        // ORBITAL CONTROLS
        const orbitalControl = new OrbitControls(camera, renderer.domElement)
        // So just defining it is enough. Might use a button to add/remove this later
        console.log(orbitalControl) // Have to do this to get rid of the TypeScript error

        // Texture mapping
        // const texture = new THREE.TextureLoader().load(textureImg)
        // const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(), new THREE.MeshBasicMaterial({map: texture}))
        // scene.add(icosahedron)

        // Add a point light source here?
        const pointLight = new THREE.DirectionalLight(0xffffff, 5)
        scene.add(pointLight)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
        scene.add(ambientLight)
        
        var mixer: THREE.AnimationMixer
        const gltfLoader = new GLTFLoader()

        // gltfLoader.loadAsync(FighterGLBModelModelUrl).then((gltfDance) => {
        //     scene.add(gltfDance.scene)
        // })

        // First load the animation 
        gltfLoader.loadAsync(FlairDanceUrl).then((flairGLTF) => {
            const flairDance = flairGLTF.animations[0]
            gltfLoader.loadAsync(FighterModelUrl).then((fighter) => {
                mixer = new THREE.AnimationMixer(fighter.scene)
                const action = mixer.clipAction(flairDance)
                action.play()
                scene.add(fighter.scene)
            })
        })
        
        
        const clock: THREE.Clock = new THREE.Clock
        const animate = () => {
            requestAnimationFrame(animate)
            const delta = clock.getDelta()
            if (mixer) mixer.update(delta)
            renderer.render(scene, camera)
        }
        animate()

        const handleWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener("resize", handleWindowResize)
        handleWindowResize()

        // Add a gridhelper
        const gridHelper = new THREE.GridHelper(20, 20)
        scene.add(gridHelper)
        
        // Cleanup
        return () => {
            canvasRef.current?.removeChild(renderer.domElement)
            renderer.dispose()
        }
    }, [])

  return (
    <div ref={canvasRef}
    style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden"
    }}></div>
  )
}

export default Canvas