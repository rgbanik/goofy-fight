import { ExtendedObject3D, ExtendedGroup, PhysicsLoader, Project, Scene3D, THREE } from "enable3d"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
// Models
import FighterModelUrl from '/assets/models/Fighter.glb?url'
import counterUrl from '/assets/models/Kitchen_Bar.glb?url'
import SoldierUrl from '/assets/models/Soldier.glb?url'
import TableUrl from '/assets/models/Table.glb?url'
import AmogusUrl from '/assets/models/Imposter.glb?url'
import KitchenStoveUrl from '/assets/models/Kitchen_Stove.glb?url'
import KitchenFridgeUrl from '/assets/models/Kitchen_Fridge.glb?url'
import HamburgerUrl from '/assets/models/Hamburger.glb?url'
import FoodUrl from '/assets/models/Food.glb?url'
import chickenBucketUrl from '/assets/models/Chicken_Bucket.glb?url'

// Anims
import FlairDanceUrl from '/assets/animations/FighterDance.glb?url'
import RunUrl from '/assets/animations/RunningInPlace.glb?url'
import IdleUrl from '/assets/animations/Idle.glb?url'
import JumpUrl from '/assets/animations/Jump.glb?url'

// Textures
import fingerUrl from '/assets/images/finger.jpg?url'
import gusUrl from '/assets/images/gus.jpg?url'

import { Raycaster, Vector2, Vector3 } from "three"

type UISetters = {
    setShowMainMenu: (v: boolean) => void,
    setShowReturnToMainMenu: (v: boolean) => void,
    setScore: (v: number) => void
}

let uiSetters: UISetters
export const initUISetters = (setters: UISetters) => {
    uiSetters = setters
}

export class PhysicsTest extends Scene3D {
    // class variables
    playerMixer!: THREE.AnimationMixer
    cashierMixer!: THREE.AnimationMixer
    // playerModel!: THREE.Object3D
    playerModel!: ExtendedGroup
    anims: {[key: string]: THREE.AnimationAction} = {}
    activeAction?: THREE.AnimationAction
    movingForward?: boolean
    raycaster: Raycaster = new Raycaster()
    mouse: Vector2 = new Vector2()
    amountofRotation?: number
    destination?: Vector3 = undefined
    rotating?: boolean
    running?: boolean
    yellowPointLight1?: THREE.PointLight
    yellowPointLight2?: THREE.PointLight
    yellowPointLight3?: THREE.PointLight
    yellowPointLight4?: THREE.PointLight
    yellowPointLight5?: THREE.PointLight
    yellowPointLight6?: THREE.PointLight
    line?: THREE.Line
    physicsObjects: any[] = []
    foodObjects: any[] = []
    trashObjects: any[] = []
    currentFoodObj!: ExtendedGroup
    hamburger!: ExtendedGroup
    timeAccumulator: number = 0
    interval: number = 3

    async init() {
        this.renderer.setPixelRatio(1)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        window.addEventListener("dblclick", this.onDoubleClick)
        console.log(this.scene.children[1])
    }

    runToPosition = (targetPosition: Vector3) => {
        const xDelta = (targetPosition.x - this.playerModel.position.x)
        const zDelta = (targetPosition.z - this.playerModel.position.z)
        
        if (xDelta !== 0) {
            this.playerModel.position.x += 0.01 * xDelta
        }
        if (zDelta !== 0) {
            this.playerModel.position.z += 0.01 * zDelta
        }
    }

    smoothRotateToTarget = (targetAngle: number) => {
        // Normalize angles between -PI and PI
        let currentAngle = this.playerModel.children[0].rotation.z
        const rotationSpeed = 0.07
        // Invert angle if facing opposite direction
        targetAngle = -targetAngle
        // Calculate shortest difference between angles
        let deltaAngle = targetAngle - currentAngle
        deltaAngle = ((deltaAngle + Math.PI) % (2 * Math.PI)) - Math.PI // wrap to [-PI, PI]

        // If angle difference is very small, snap to target
        if (Math.abs(deltaAngle) < 0.001) {
            this.playerModel.children[0].rotation.z = targetAngle
            return true // rotation done
        }

        // Rotate by a small step toward the target
        this.playerModel.children[0].rotation.z += Math.sign(deltaAngle) * Math.min(rotationSpeed, Math.abs(deltaAngle))
        return false // rotation ongoing
    }

    onDoubleClick = (event: MouseEvent) => {
        // Convert to normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1    
        
        // Set up ray
        this.raycaster.setFromCamera(this.mouse, this.camera)

        // Intersect with ground // Hardcoded to this.scene.children[1]
        const intersects = this.raycaster.intersectObject(this.scene.children[1])
        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point
            intersectionPoint.y = this.playerModel.position.y

            // forward vector is (0,0,-1) in model local space
            const targetDir = new THREE.Vector3(
            intersectionPoint.x - this.playerModel.position.x,
            0,
            intersectionPoint.z - this.playerModel.position.z,
            ).normalize()

            const angle = Math.atan2(targetDir.x, targetDir.z) // signed angle on XZ plane
            // this.playerModel.rotation.y = angle // set absolute rotation
            this.amountofRotation = angle
            this.destination = intersectionPoint
            this.fadeToAction("run", 0.3)
            // this.running = true
        }
    }

    // Maybe I could use update later to move lights around
    // update(_time: number, _delta: number): void {
        
    // }

    async create() {
        // Initial world creation
        this.warpSpeed('-sky', '-light', '-grid')
        
        // this.haveSomeFun() // This really IS fun :)
        this.physics.debug?.enable() // Remember to set this off before production
        this.physics.setGravity(0, -9.8, 0);
        
        // Create a loader and wait for models and anims to finish loading
        const gltfLoader: GLTFLoader = new GLTFLoader()
        // anims
        const flairGLTF = await gltfLoader.loadAsync(FlairDanceUrl)
        const runningGLTF = await gltfLoader.loadAsync(RunUrl)
        const idleGLTF = await gltfLoader.loadAsync(IdleUrl)
        const jumpGLTF = await gltfLoader.loadAsync(JumpUrl)

        // models
        const fighterGLTF = await gltfLoader.loadAsync(FighterModelUrl)
        const counterGLTF = await gltfLoader.loadAsync(counterUrl)
        const workerGLTF = await gltfLoader.loadAsync(SoldierUrl)
        const tableGLTF = await gltfLoader.loadAsync(TableUrl)
        const amogusGLTF = await gltfLoader.loadAsync(AmogusUrl)
        const stoveGLTF = await gltfLoader.loadAsync(KitchenStoveUrl)
        const fridgeGLTF = await gltfLoader.loadAsync(KitchenFridgeUrl)

        
        const flairDance = flairGLTF.animations[0]
        const running = runningGLTF.animations[0]
        const jump = jumpGLTF.animations[0]
        const idle = idleGLTF.animations[0]
        
        // // Set up lights
        this.yellowPointLight1 = this.lights.pointLight({ color: 0xffc72c, intensity: 10, distance: 10 })
        this.yellowPointLight2 = this.lights.pointLight({ color: 0xffc72c, intensity: 10, distance: 10 })
        this.yellowPointLight3 = this.lights.pointLight({ color: 0xffc72c, intensity: 10, distance: 10 })
        this.yellowPointLight4 = this.lights.pointLight({ color: 0xffc72c, intensity: 10, distance: 10 })
        this.yellowPointLight5 = this.lights.pointLight({ color: 0xffc72c, intensity: 10, distance: 10 })
        this.yellowPointLight6 = this.lights.pointLight({ color: 0xffc72c, intensity: 10, distance: 10 })

        this.yellowPointLight1.position.set(-5, 5, 0)
        this.yellowPointLight2.position.set(5, 5, 5)
        this.yellowPointLight3.position.set(5, 5, -5)
        
        this.yellowPointLight4.position.set(-5, 5, 5)
        this.yellowPointLight5.position.set(5, 5, 0)
        this.yellowPointLight6.position.set(-5, 5, -5)
        
        // this.lights.helper.pointLightHelper(this.yellowPointLight1)
        // this.lights.helper.pointLightHelper(this.yellowPointLight2)
        // this.lights.helper.pointLightHelper(this.yellowPointLight3)
        // this.lights.helper.pointLightHelper(this.redPointLight1)
        // this.lights.helper.pointLightHelper(this.redPointLight2)
        // this.lights.helper.pointLightHelper(this.redPointLight3)
        // this.lights.hemisphereLight({ intensity: 0.1 })

        // Setup player. Originally called fighter
        // I don't know why, but if I don't add to the container, I have rotation issues
        // const fighter_container = new THREE.Object3D()
        const fighter = fighterGLTF.scene.children[0]
        // const fighter_container = new ExtendedGroup()
        const fighter_container = new ExtendedGroup()
        fighter_container.add(fighter)
        // Then initalize the playerMixer and add the animations to a dictionary for fast fetching
        // Kind of like motion-matching in Unreal Engine :)
        this.playerMixer = new THREE.AnimationMixer(fighter)
        this.anims['dance'] = this.playerMixer.clipAction(flairDance)
        this.anims['run'] = this.playerMixer.clipAction(running)
        this.anims['idle'] = this.playerMixer.clipAction(idle)
        this.anims['jump'] = this.playerMixer.clipAction(jump)
        // Jump is a little special. Handle it differently
        this.anims['jump'].setLoop(THREE.LoopOnce, 1)
        this.anims['jump'].clampWhenFinished = true
        // Finish any animation with idle
        this.playerMixer.addEventListener('finished', () => {
            this.fadeToAction("idle", 0.5)
        })

        // Now that everything is set, pick a starter animation. I choose idle
        this.activeAction = this.anims['idle']
        this.activeAction.play()
        this.playerModel = fighter_container
        const axesHelper = new THREE.AxesHelper(2)
        this.playerModel.add(axesHelper)
        this.playerModel.name = "Player"
        fighter.castShadow = true
        this.scene.add(fighter_container)
        fighter.position.y -= 0.5
        // Don't know why fighter_container is red underlined lol
        this.physics.add.existing(fighter_container, {shape: 'box', width: 0.6, height: 1.5, depth: 0.6})
        this.physicsObjects.push(fighter_container)
        this.playerModel.body.setAngularFactor(0, 0, 0)

        // Connecting line
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
        const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        this.line = new THREE.Line(geometry, material)
        this.scene.add(this.line)

        // Position and add workers
        const worker = workerGLTF.scene.children[0]
        // Cashier
        const cashier = worker.clone(true)
        this.cashierMixer = new THREE.AnimationMixer(worker)
        this.cashierMixer.clipAction(flairDance).play()
        const cashier_container = new ExtendedGroup()
        cashier_container.add(cashier)
        cashier_container.name = "Cashier"
        this.scene.add(cashier_container)
        cashier_container.position.x += 7
        cashier_container.position.y += 0.8
        cashier_container.position.z -= 3.3
        cashier.position.y -= 0.8
        // Don't know why fighter_container is red underlined lol
        this.physics.add.existing(cashier_container, {shape: 'box', width: 0.6, height: 1.5, depth: 0.6, mass: 0})
        this.physicsObjects.push(cashier_container)
        this.playerModel.body.setAngularFactor(0, 0, 0)

        // Counters
        // Counter 1
        const counter = counterGLTF.scene.children[0]
        const counter1 = counter.clone(true)
        console.log(counter1)
        const counter1_container = new ExtendedGroup()
        counter1_container.add(counter1)
        counter1_container.position.x -= 0.8
        counter1_container.position.z -= 2
        counter1.position.z -= 0.25
        counter1.position.x += 0.65
        // Amogus models are too small
        counter1_container.children[0].scale.x *= 3
        counter1_container.children[0].scale.y *= 3
        counter1_container.children[0].scale.z *= 3
        counter1_container.name = "Counter1"
        this.scene.add(counter1_container)
        this.physics.add.existing(counter1_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(counter1_container)

        // Counter 2
        const counter2 = counter.clone(true)
        console.log(counter2)
        const counter2_container = new ExtendedGroup()
        counter2_container.add(counter2)
        counter2_container.position.x += 0.7
        counter2_container.position.z -= 2
        counter2.position.z -= 0.25
        counter2.position.x += 0.65
        // Amogus models are too small
        counter2_container.children[0].scale.x *= 3
        counter2_container.children[0].scale.y *= 3
        counter2_container.children[0].scale.z *= 3
        counter2_container.name = "Counter2"
        this.scene.add(counter2_container)
        this.physics.add.existing(counter2_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(counter2_container)

        // // Counter 3
        const counter3 = counter.clone(true)
        console.log(counter3)
        const counter3_container = new ExtendedGroup()
        counter3_container.add(counter3)
        counter3_container.position.x += 2.2
        counter3_container.position.z -= 2
        counter3.position.z -= 0.25
        counter3.position.x += 0.65
        // Amogus models are too small
        counter3_container.children[0].scale.x *= 3
        counter3_container.children[0].scale.y *= 3
        counter3_container.children[0].scale.z *= 3
        counter3_container.name = "Counter3"
        this.scene.add(counter3_container)
        this.physics.add.existing(counter3_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(counter3_container)

        // // Counter 4
        const counter4 = counter.clone(true)
        console.log(counter4)
        const counter4_container = new ExtendedGroup()
        counter4_container.add(counter4)
        counter4_container.position.x += 3.7
        counter4_container.position.z -= 2
        counter4.position.z -= 0.25
        counter4.position.x += 0.65
        // Amogus models are too small
        counter4_container.children[0].scale.x *= 3
        counter4_container.children[0].scale.y *= 3
        counter4_container.children[0].scale.z *= 3
        counter4_container.name = "Counter4"
        this.scene.add(counter4_container)
        this.physics.add.existing(counter4_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(counter4_container)

        // // Counter 5
        const counter5 = counter.clone(true)
        console.log(counter5)
        const counter5_container = new ExtendedGroup()
        counter5_container.add(counter5)
        counter5_container.position.x += 5.2
        counter5_container.position.z -= 2
        counter5.position.z -= 0.25
        counter5.position.x += 0.65
        // Amogus models are too small
        counter5_container.children[0].scale.x *= 3
        counter5_container.children[0].scale.y *= 3
        counter5_container.children[0].scale.z *= 3
        counter5_container.name = "Counter5"
        this.scene.add(counter5_container)
        this.physics.add.existing(counter5_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(counter5_container)

        // // Counter 6
        const counter6 = counter.clone(true)
        console.log(counter6)
        const counter6_container = new ExtendedGroup()
        counter6_container.add(counter6)
        counter6_container.position.x += 6.7
        counter6_container.position.z -= 2
        counter6.position.z -= 0.25
        counter6.position.x += 0.65
        // Amogus models are too small
        counter6_container.children[0].scale.x *= 3
        counter6_container.children[0].scale.y *= 3
        counter6_container.children[0].scale.z *= 3
        counter6_container.name = "Counter6"
        this.scene.add(counter6_container)
        this.physics.add.existing(counter6_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(counter6_container)

        // // Counter 7
        const counter7 = counter.clone(true)
        console.log(counter7)
        const counter7_container = new ExtendedGroup()
        counter7_container.add(counter7)
        counter7_container.position.x += 8.2
        counter7_container.position.z -= 2
        counter7.position.z -= 0.25
        counter7.position.x += 0.65
        // Amogus models are too small
        counter7_container.children[0].scale.x *= 3
        counter7_container.children[0].scale.y *= 3
        counter7_container.children[0].scale.z *= 3
        counter7_container.name = "Counter7"
        this.scene.add(counter7_container)
        this.physics.add.existing(counter7_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(counter7_container)

        // // Counter 8
        const counter8 = counter.clone(true)
        console.log(counter8)
        const counter8_container = new ExtendedGroup()
        counter8_container.add(counter8)
        counter8_container.position.x += 9.7
        counter8_container.position.z -= 2
        counter8.position.z -= 0.25
        counter8.position.x += 0.65
        // Amogus models are too small
        counter8_container.children[0].scale.x *= 3
        counter8_container.children[0].scale.y *= 3
        counter8_container.children[0].scale.z *= 3
        counter8_container.name = "Counter8"
        this.scene.add(counter8_container)
        this.physics.add.existing(counter8_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(counter8_container)

        // Tables
        // Table 1
        const table = tableGLTF.scene.children[0]
        const table1 = table.clone(true)
        console.log(table1)
        const table1_container = new ExtendedGroup()
        table1_container.add(table1)
        table1_container.position.x += 7
        table1_container.position.y += 0.2
        table1_container.position.z += 9.7
        table1_container.rotateY(Math.PI / 2)
        table1.position.z += 0
        table1.position.x += 0.65
        // Amogus models are too small
        table1_container.children[0].scale.x *= 2
        table1_container.children[0].scale.y *= 2
        table1_container.children[0].scale.z *= 2
        table1_container.name = "Table1"
        this.scene.add(table1_container)
        this.physics.add.existing(table1_container, {shape: 'box', width: 5, height: 2.7, depth: 2.7, mass: 0})
        this.physicsObjects.push(table1_container)

        // Table 2
        const table2 = table.clone(true)
        console.log(table2)
        const table2_container = new ExtendedGroup()
        table2_container.add(table2)
        table2_container.position.x += 0
        table2_container.position.y += 0.2
        table2_container.position.z += 9.7
        table2_container.rotateY(Math.PI / 2)
        table2.position.z -= 0
        table2.position.x += 0.65
        // Amogus models are too small
        table2_container.children[0].scale.x *= 2
        table2_container.children[0].scale.y *= 2
        table2_container.children[0].scale.z *= 2
        table2_container.name = "Table2"
        this.scene.add(table2_container)
        this.physics.add.existing(table2_container, {shape: 'box', width: 5, height: 2.7, depth: 2.7, mass: 0})
        this.physicsObjects.push(table2_container)

        // Table 3
        const table3 = table.clone(true)
        console.log(table3)
        const table3_container = new ExtendedGroup()
        table3_container.add(table3)
        table3_container.position.x += -7
        table3_container.position.y += 0.2
        table3_container.position.z += 9.7
        table3_container.rotateY(Math.PI / 2)
        table3.position.z -= 0
        table3.position.x += 0.65
        // Amogus models are too small
        table3_container.children[0].scale.x *= 2
        table3_container.children[0].scale.y *= 2
        table3_container.children[0].scale.z *= 2
        table3_container.name = "Table3"
        this.scene.add(table3_container)
        this.physics.add.existing(table3_container, {shape: 'box', width: 5, height: 2.7, depth: 2.7, mass: 0})
        this.physicsObjects.push(table3_container)

        // Amoguses / Amogi?
        // Amogus 1
        const amogus = amogusGLTF.scene.children[0]
        const amogus1 = amogus.clone(true)
        const amogus1_container = new ExtendedGroup()
        amogus1_container.add(amogus1)
        amogus1_container.position.x += 7.95
        amogus1_container.position.y += 0.4
        amogus1_container.position.z += 9.7
        amogus1_container.rotateY(Math.PI / 2)
        // amogus1.rotateY(Math.PI / 2)
        // amogus1.position.z -= 4
        // amogus1.position.y += 1
        // amogus1.position.x += 3.5
        // Amogus models are too small
        amogus1_container.children[0].scale.x *= 2
        amogus1_container.children[0].scale.y *= 2
        amogus1_container.children[0].scale.z *= 2
        amogus1_container.name = "Amogus1"
        this.scene.add(amogus1_container)

        // Amogus 2
        const amogus2 = amogus.clone(true)
        const amogus2_container = new ExtendedGroup()
        amogus2_container.add(amogus2)
        amogus2_container.position.x += 7.95
        amogus2_container.position.y += 0.4
        amogus2_container.position.z += 8.5
        amogus2_container.rotateY(Math.PI / 2)
        // amogus2.rotateY(Math.PI / 2)
        // amogus2.position.z -= 4
        // amogus2.position.y += 1
        // amogus2.position.x += 3.5
        // Amogus models are too small
        amogus2_container.children[0].scale.x *= 2
        amogus2_container.children[0].scale.y *= 2
        amogus2_container.children[0].scale.z *= 2
        amogus2_container.name = "Amogus2"
        this.scene.add(amogus2_container)

        // Amogus 3
        const amogus3 = amogus.clone(true)
        const amogus3_container = new ExtendedGroup()
        amogus3_container.add(amogus3)
        amogus3_container.position.x += 6.05
        amogus3_container.position.y += 0.4
        amogus3_container.position.z += 9.5
        amogus3_container.rotateY(Math.PI / 2)
        amogus3.rotateY(Math.PI)
        // amogus2.position.z -= 4
        // amogus2.position.y += 1
        // amogus2.position.x += 3.5
        // Amogus models are too small
        amogus3_container.children[0].scale.x *= 2
        amogus3_container.children[0].scale.y *= 2
        amogus3_container.children[0].scale.z *= 2
        amogus3_container.name = "Amogus3"
        this.scene.add(amogus3_container)
        
        // Amogus 4
        const amogus4 = amogus.clone(true)
        const amogus4_container = new ExtendedGroup()
        amogus4_container.add(amogus4)
        amogus4_container.position.x += -0.95
        amogus4_container.position.y += 0.4
        amogus4_container.position.z += 9.5
        amogus4_container.rotateY(Math.PI / 2)
        amogus4.rotateY(Math.PI)
        // amogus2.position.z -= 4
        // amogus2.position.y += 1
        // amogus2.position.x += 3.5
        // Amogus models are too small
        amogus4_container.children[0].scale.x *= 2
        amogus4_container.children[0].scale.y *= 2
        amogus4_container.children[0].scale.z *= 2
        amogus4_container.name = "Amogus4"
        this.scene.add(amogus4_container)

        // Amogus 5
        const amogus5 = amogus.clone(true)
        const amogus5_container = new ExtendedGroup()
        amogus5_container.add(amogus5)
        amogus5_container.position.x += -6.05
        amogus5_container.position.y += 0.4
        amogus5_container.position.z += 9.2
        amogus5_container.rotateY(Math.PI / 2)
        // amogus2.rotateY(Math.PI / 2)
        // amogus2.position.z -= 4
        // amogus2.position.y += 1
        // amogus2.position.x += 3.5
        // Amogus models are too small
        amogus5_container.children[0].scale.x *= 2
        amogus5_container.children[0].scale.y *= 2
        amogus5_container.children[0].scale.z *= 2
        amogus5_container.name = "Amogus5"
        this.scene.add(amogus5_container)

        // Amogus 6
        const amogus6 = amogus.clone(true)
        const amogus6_container = new ExtendedGroup()
        amogus6_container.add(amogus6)
        amogus6_container.position.x += -8.05
        amogus6_container.position.y += 0.4
        amogus6_container.position.z += 9.2
        amogus6_container.rotateY(Math.PI / 2)
        amogus6.rotateY(Math.PI)
        // amogus2.position.z -= 4
        // amogus2.position.y += 1
        // amogus2.position.x += 3.5
        // Amogus models are too small
        amogus6_container.children[0].scale.x *= 2
        amogus6_container.children[0].scale.y *= 2
        amogus6_container.children[0].scale.z *= 2
        amogus6_container.name = "Amogus6"
        this.scene.add(amogus6_container)

        // Stoves
        // Stove 1
        const stove = stoveGLTF.scene.children[0]
        const stove1 = stove.clone(true)
        console.log(stove1)
        const stove1_container = new ExtendedGroup()
        stove1_container.add(stove1)
        stove1_container.position.x -= 9.5
        stove1_container.position.z -= 9
        // stove1.position.z += 0.2
        stove1.rotateY(-Math.PI)
        stove1.position.x -= 0.6
        // Amogus models are too small
        stove1_container.children[0].scale.x *= 3
        stove1_container.children[0].scale.y *= 3
        stove1_container.children[0].scale.z *= 3
        stove1_container.name = "Stove1"
        this.scene.add(stove1_container)
        this.physics.add.existing(stove1_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(stove1_container)

        // Stove 2
        const stove2 = stove.clone(true)
        console.log(stove2)
        const stove2_container = new ExtendedGroup()
        stove2_container.add(stove2)
        stove2_container.position.x -= 8
        stove2_container.position.z -= 9
        // stove2.position.z += 0.2
        stove2.rotateY(-Math.PI)
        stove2.position.x -= 0.6
        // Amogus models are too small
        stove2_container.children[0].scale.x *= 3
        stove2_container.children[0].scale.y *= 3
        stove2_container.children[0].scale.z *= 3
        stove2_container.name = "Stove1"
        this.scene.add(stove2_container)
        this.physics.add.existing(stove2_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(stove2_container)

        // Fridges
        // Fridge 1
        const fridge = fridgeGLTF.scene.children[0]
        const fridge1 = fridge.clone(true)
        console.log(fridge1)
        const fridge1_container = new ExtendedGroup()
        fridge1_container.add(fridge1)
        fridge1_container.position.x -= 6
        fridge1_container.position.z -= 9.5
        // stove1.position.z += 0.2
        // fridge1.rotateY(-Math.PI)
        fridge1.position.x -= 0.6
        // Amogus models are too small
        // fridge1_container.children[0].scale.x *= 3
        // fridge1_container.children[0].scale.y *= 3
        // fridge1_container.children[0].scale.z *= 3
        fridge1_container.name = "Fridge1"
        this.scene.add(fridge1_container)
        this.physics.add.existing(fridge1_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(fridge1_container)

        // Fridge 2
        const fridge2 = fridge.clone(true)
        console.log(fridge2)
        const fridge2_container = new ExtendedGroup()
        fridge2_container.add(fridge2)
        fridge2_container.position.x -= 4.5
        fridge2_container.position.z -= 9.5
        // stove2.position.z += 0.2
        // fridge2.rotateY(-Math.PI)
        fridge2.position.x -= 0.6
        // Amogus models are too small
        // fridge2_container.children[0].scale.x *= 3
        // fridge2_container.children[0].scale.y *= 3
        // fridge2_container.children[0].scale.z *= 3
        fridge2_container.name = "Fridge2"
        this.scene.add(fridge2_container)
        this.physics.add.existing(fridge2_container, {shape: 'box', width: 1.5, height: 2.7, depth: 0.5, mass: 0})
        this.physicsObjects.push(fridge2_container)

        // Hamburgers
        // Hamburger 1
        // const hamburger = hamburgerGLTF.scene.children[0]
        // this.hamburger = hamburger.clone(true)
        // const hamburger1 = hamburger.clone(true)
        // console.log(hamburger1)
        // const hamburger1_container = new ExtendedGroup()
        // hamburger1_container.add(hamburger1)
        // hamburger1_container.position.x -= 9.5
        // hamburger1_container.position.z -= 8
        // // hamburger1_container.position.y += 4
        // hamburger1.position.x += 0.75
        // // hamburger1.rotateY(-Math.PI)
        // hamburger1.position.x -= 0.6
        // // Amogus models are too small
        // hamburger1_container.children[0].scale.x *= 0.03
        // hamburger1_container.children[0].scale.y *= 0.03
        // hamburger1_container.children[0].scale.z *= 0.03
        // hamburger1_container.name = "hamburger1"
        // this.scene.add(hamburger1_container)
        // this.physics.add.existing(hamburger1_container, {shape: 'box', width: 0.5, height: 1, depth: 0.5, mass: 0})
        // // hamburger1_container.body.setCollisionFlags(4)
        // this.physicsObjects.push(hamburger1_container)
        // this.foodObjects.push(hamburger1_container)

        // This was extremely annoying to debug. Maybe mixamo uses a different coordinate system
        // Turning off for deployment
        // const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.playerModel.quaternion)
        // const arrowHelper = new THREE.ArrowHelper(forwardDir, this.playerModel.position, 2, 0xff0000)
        // this.scene.add(arrowHelper)

        // Walls
        // Finger wall
        const fingerLoader = new THREE.TextureLoader() 
        const fingerTexture = fingerLoader.load(fingerUrl, (tex) => {
        tex.anisotropy = 16 
        // You might want to update the material after load if needed
        }) 

        // Set texture repeat and wrapping
        fingerTexture.wrapS = THREE.RepeatWrapping 
        fingerTexture.wrapT = THREE.RepeatWrapping 
        fingerTexture.repeat.set(1,1) 

        // Create material
        const fingerMaterial = new THREE.MeshStandardMaterial({
        map: fingerTexture,
        side: THREE.FrontSide,
        }) 

        // Create a box geometry
        const finger_wallWidth = 15 
        const finger_wallHeight = 4 
        const finger_wallDepth = 0.5  // thickness of the wall

        const fingerWall = new THREE.Mesh(
        new THREE.BoxGeometry(finger_wallWidth, finger_wallHeight, finger_wallDepth),
        fingerMaterial
        ) 
        fingerWall.position.x += 3
        fingerWall.position.y += 2
        fingerWall.position.z += -10

        // Add to scene
        this.scene.add(fingerWall) 

        // Prevent collision
        this.physics.add.existing(fingerWall, {
        shape: 'box',
        width: finger_wallWidth,
        height: finger_wallHeight,
        depth: finger_wallDepth,
        mass: 0, 
        }) 

        // Finger wall
        const  gusLoader = new THREE.TextureLoader() 
        const  gusTexture =  gusLoader.load( gusUrl, (tex) => {
        tex.anisotropy = 16 
        // You might want to update the material after load if needed
        }) 

        // Set texture repeat and wrapping
         gusTexture.wrapS = THREE.RepeatWrapping 
         gusTexture.wrapT = THREE.RepeatWrapping 
         gusTexture.repeat.set(5, 1) 

        // Create material
        const  gusMaterial = new THREE.MeshStandardMaterial({
        map:  gusTexture,
        side: THREE.FrontSide,
        }) 

        // Create a box geometry
        const gus_wallWidth = 20 
        const gus_wallHeight = 4 
        const gus_wallDepth = 0.5  // thickness of the wall

        const  gusWall = new THREE.Mesh(
        new THREE.BoxGeometry(gus_wallWidth, gus_wallHeight, gus_wallDepth),
         gusMaterial
        ) 
         gusWall.position.x += 10.2
         gusWall.position.y += 2
         gusWall.position.z += 0.5

         gusWall.rotateY(Math.PI / 2)

        // Add to scene
        this.scene.add( gusWall) 

        // Prevent collision
        this.physics.add.existing( gusWall, {
        shape: 'box',
        width: gus_wallWidth,
        height: gus_wallHeight,
        depth: gus_wallDepth,
        mass: 0, 
        }) 
        

        // Create a clock and handle the animation frames
        const clock: THREE.Clock = new THREE.Clock
        const animate = () => {
            requestAnimationFrame(animate)
            const delta = clock.getDelta()
            if (this.playerMixer) this.playerMixer.update(delta)
            if (this.cashierMixer) this.cashierMixer.update(delta)
            if (this.amountofRotation) this.rotating = this.smoothRotateToTarget(this.amountofRotation) 
            if (this.destination) {
                const direction = this.destination.clone().sub(this.playerModel.position)
                direction.y = 0
                const distance = direction.length()
                if (distance > 0.1) {
                    direction.normalize()
                    const speed = 2 // I tried playing around with this
                    const velocity = direction.multiplyScalar(speed)
                    this.playerModel.body.setVelocity(velocity.x, this.playerModel.body.velocity.y, velocity.z)
                } else {
                    this.destination = undefined
                    this.fadeToAction("idle", 0.1)
                    this.running = false // reached destination
                    this.playerModel.body.setVelocity(0, this.playerModel.body.velocity.y, 0)
                }
            }
            
        }
        animate()

        // Handle collisions
        this.playerModel.body.on.collision((otherBody, _) => {
            if (this.foodObjects.includes(otherBody)) {
                this.physics.destroy(otherBody)
                this.scene.remove(otherBody)
                uiSetters.setScore((prevScore) => prevScore + 30)
            }
            else if (this.trashObjects.includes(otherBody)) {
                this.physics.destroy(otherBody)
                this.scene.remove(otherBody)
                uiSetters.setScore((prevScore) => prevScore - 30)
            }
        })

        // Add event listeners for keypress. Remove for production.
        // In production, point and click only
        window.addEventListener('keydown', this.handleKeyDown)
        window.addEventListener('keyup', this.handleKeyUp)

    }

    update(_time: number, _delta: number): void {
        this.timeAccumulator += _delta
        if (this.timeAccumulator >= 3000) {
            this.timeAccumulator = 0
            this.fun()
        }
        if (this.destination !== undefined) {
            
            const start = this.playerModel.position
            const end = this.destination

            if (this.line) {
            // Update the geometry’s positions
                const positions = this.line.geometry.attributes.position.array

                positions[0] = start.x
                positions[1] = 0.1
                positions[2] = start.z

                positions[3] = end.x
                positions[4] = 0.1
                positions[5] = end.z  

                this.line.geometry.attributes.position.needsUpdate = true
            }
        }
        if (this.destination === undefined) {
            
            if (this.line) {
            // Update the geometry’s positions
                const positions = this.line.geometry.attributes.position.array

                positions[0] = 0
                positions[1] = 0
                positions[2] = 0

                positions[3] = 0
                positions[4] = 0
                positions[5] = 0

                this.line.geometry.attributes.position.needsUpdate = true
            }
        }
    }
    
    getRandomPosition(): THREE.Vector3 {
        const range = 6
        const x = (Math.random() - 0.5) * range * 2  // -6 to +6
        const y = 4
        const z = (Math.random() - 0.5) * range * 2
        return new THREE.Vector3(x, y, z)
    }

    fun() {
        // fix some things
        //let sphere = this.physics.add.sphere({y: 5, z: -3}, {lamber: {color: 'yellow'}})
        const trashPos = this.getRandomPosition()
        const burgerPos = this.getRandomPosition()
        const chickenPos = this.getRandomPosition()
        console.log(trashPos)

        new GLTFLoader().loadAsync(FoodUrl).then((trash_gltf) => {

            let trash = new ExtendedObject3D()
            const food: any = trash_gltf.scene.children[0]
            trash.add(food)
            trash.children[0].position.y += 0.3
            trash.children[0].scale.x *= 0.3
            trash.children[0].scale.y *= 0.3
            trash.children[0].scale.z *= 0.3
            trash.position.x = trashPos.x
            trash.position.y = trashPos.y
            trash.position.z = trashPos.z
            this.scene.add(trash)
            this.physics.add.existing(trash, {shape: 'sphere', radius: 0.5})
            this.trashObjects.push(trash)
        })
        new GLTFLoader().loadAsync(chickenBucketUrl).then((chicken_gltf) => {

            let chicken = new ExtendedObject3D()
            const food: any = chicken_gltf.scene.children[0]
            chicken.add(food)
            chicken.children[0].position.y -= 0.2
            chicken.children[0].scale.x *= 1.5
            chicken.children[0].scale.y *= 1.5
            chicken.children[0].scale.z *= 1.5
            chicken.position.x = chickenPos.x
            chicken.position.y = chickenPos.y
            chicken.position.z = chickenPos.z
            this.scene.add(chicken)
            this.physics.add.existing(chicken, {shape: 'sphere', radius: 0.5})
            this.foodObjects.push(chicken)
        })
        new GLTFLoader().loadAsync(HamburgerUrl).then((burger_gltf) => {

            let burger = new ExtendedObject3D()
            const food: any = burger_gltf.scene.children[0]
            burger.add(food)
            
            burger.children[0].scale.x *= 0.03
            burger.children[0].scale.y *= 0.03
            burger.children[0].scale.z *= 0.03
            burger.position.x = burgerPos.x
            burger.position.y = burgerPos.y
            burger.position.z = burgerPos.z
            this.scene.add(burger)
            this.physics.add.existing(burger, {shape: 'sphere', radius: 0.3})
            this.foodObjects.push(burger)
        })
    }

    handleKeyDown = (onKeyDown: KeyboardEvent) => {
        if (!this.playerMixer) return
        switch (onKeyDown.code) {
            // case 'KeyR':
            //     this.fadeToAction("run", 0.3)
            //     this.movingForward = true
            //     break
            case 'KeyX':
                uiSetters.setShowMainMenu(false)
                uiSetters.setShowReturnToMainMenu(true)
                break
            case 'KeyH':
                // this.haveSomeFun()
                this.fun()
                break
            case 'KeyC':
                uiSetters.setShowMainMenu(true)
                uiSetters.setShowReturnToMainMenu(false)
                break
            case 'KeyD':
                this.fadeToAction("dance", 0.5)
                this.movingForward = false
                break
            case 'KeyI':
                this.fadeToAction("idle", 0.5)
                this.movingForward = false
                break
            case 'KeyJ': // Removing in production
                this.fadeToAction("jump", 0.2)
                // this.playerModel.body.setVelocityY(7) // Go back to idling after a jump
                break
        }
    }
    
    
    // Handling animation
    fadeToAction = (action: string, duration: number) => {
        const currentAction = this.activeAction
        const nextAction = this.anims[action]
        if (nextAction && nextAction !== currentAction) {
            nextAction.reset()
            nextAction.play()
            nextAction.crossFadeFrom(currentAction!, duration, true)
            this.activeAction = nextAction
        }
    }

    handleKeyUp = (_onKeyUp: KeyboardEvent) => {
        // console.log(onKeyUp)
        return
    }
    
}

const config = { scenes: [PhysicsTest], antialias: true}
PhysicsLoader('/goofy-fight/ammo/', () => new Project(config))