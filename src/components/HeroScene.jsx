import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import AnimatedSphere from './AnimatedSphere'
import HeroHands from './HeroHands'
import './HeroScene.css'

function SceneLights() {
  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.65} />
      <directionalLight position={[-3, 2, 4]} intensity={0.85} />
      <pointLight position={[0, 2, 4]} intensity={14} distance={14} />
    </>
  )
}

function HeroCanvas() {
  return (
    <Canvas
      className="hero__canvas"
      camera={{ position: [0, 0, 5.8], fov: 40 }}
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
      onCreated={({ camera, gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.domElement.style.background = 'transparent'
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
      }}
    >
      <Suspense fallback={null}>
        <SceneLights />
        <AnimatedSphere />
      </Suspense>
    </Canvas>
  )
}

export default function HeroScene() {
  return (
    <div className="hero__stage">
      <HeroCanvas />
      <HeroHands />
    </div>
  )
}
