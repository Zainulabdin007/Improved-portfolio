import { Suspense, useLayoutEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
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

/** Keep aspect ratio correct on resize — camera distance/FOV stay fixed. */
function AspectCamera({ stageRef }) {
  const { camera } = useThree()

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const update = () => {
      const w = stage.clientWidth
      const h = stage.clientHeight
      if (w <= 0 || h <= 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [camera, stageRef])

  return null
}

function HeroCanvas({ stageRef }) {
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
      <AspectCamera stageRef={stageRef} />
      <Suspense fallback={null}>
        <SceneLights />
        <AnimatedSphere />
      </Suspense>
    </Canvas>
  )
}

export default function HeroScene() {
  const stageRef = useRef(null)

  return (
    <div ref={stageRef} className="hero__stage">
      <HeroCanvas stageRef={stageRef} />
      <HeroHands />
    </div>
  )
}
