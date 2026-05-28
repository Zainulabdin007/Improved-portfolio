import { Suspense, useLayoutEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import AnimatedSphere from './AnimatedSphere'
import { readUiScale, onViewportScaleChange } from '../utils/viewportVars'
import './HeroScene.css'

function SceneLights() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 5]} intensity={1.35} />
      <directionalLight position={[-3, 2, 4]} intensity={0.7} />
      <pointLight position={[0, 2, 4]} intensity={11} distance={14} />
    </>
  )
}

/** Match sphere framing to ui-scale (designed @ 1920×1080). */
function ScaledCamera({ stageRef }) {
  const { camera } = useThree()

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const update = () => {
      const w = stage.clientWidth
      const h = stage.clientHeight
      if (w <= 0 || h <= 0) return

      const ui = readUiScale()
      camera.position.set(0, 0, 5.8 / ui)
      camera.fov = 40
      camera.aspect = w / h
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(stage)
    const off = onViewportScaleChange(update)
    return () => {
      ro.disconnect()
      off()
    }
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
      <ScaledCamera stageRef={stageRef} />
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
    </div>
  )
}
