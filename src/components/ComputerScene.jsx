import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Bounds,
  Center,
  Environment,
  Lightformer,
  useGLTF,
} from '@react-three/drei'
import { COMPUTER_GLB_URL } from '../constants'
import { markBootGate } from '../utils/bootReadiness'
import {
  getTallViewportCameraFactor,
  getUiScaleForElement,
  onViewportScaleChange,
} from '../utils/viewportVars'
import './ComputerScene.css'

useGLTF.preload(COMPUTER_GLB_URL)

/** Display scale inside Bounds (tune with camera distance). */
const MODEL_SCALE = 0.2

/** Radians per second — full turn ~16s. */
const AUTO_ROTATE_SPEED = 0.585 /* 0.39 × 1.5 */

function ComputerModel() {
  const { scene } = useGLTF(COMPUTER_GLB_URL)
  const groupRef = useRef()
  const model = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    if (scene) markBootGate('sphereComputer')
  }, [scene])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * AUTO_ROTATE_SPEED
    }
  })

  return (
    <group ref={groupRef} scale={MODEL_SCALE}>
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  )
}

function ScaledCamera({ stageRef }) {
  const { camera } = useThree()

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const update = () => {
      const w = stage.clientWidth
      const h = stage.clientHeight
      if (w <= 0 || h <= 0) return

      const ui = getUiScaleForElement(stage)
      const tall = getTallViewportCameraFactor(w, h)
      camera.position.set(0, 0.5, (19 / ui) * tall)
      camera.fov = 32
      camera.aspect = w / h
      camera.lookAt(0, 0.5, 0)
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

export default function ComputerScene() {
  const stageRef = useRef(null)

  return (
    <div ref={stageRef} className="computer-stage">
      <Canvas
        className="computer-stage__canvas"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.5, 19], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ScaledCamera stageRef={stageRef} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 4, 3]} intensity={1.3} />
        <directionalLight position={[-3, 2, -3]} intensity={0.55} />
        <pointLight position={[0, 2, 3]} intensity={6} distance={12} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={2.8}>
            <ComputerModel />
          </Bounds>
          <Environment resolution={256}>
            <Lightformer
              form="rect"
              intensity={1.6}
              color="#ffffff"
              position={[0, 3, 4]}
              rotation={[-Math.PI / 4, 0, 0]}
              scale={[10, 6, 1]}
            />
            <Lightformer
              form="rect"
              intensity={0.9}
              color="#df2020"
              position={[-4, -1, 2]}
              scale={[6, 6, 1]}
            />
            <Lightformer
              form="rect"
              intensity={0.6}
              color="#f5f5f7"
              position={[4, 1, 2]}
              scale={[6, 6, 1]}
            />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  )
}
