import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { GLB_URL } from '../constants'
import { onViewportScaleChange, readUiScale } from '../utils/viewportVars'

useGLTF.preload(GLB_URL)

/** Rotation around the vertical (Y) world axis — planet pole spin */
const VERTICAL_SPIN_SPEED = 0.32
const MODEL_SCALE = 1.122 /* 1.181 × 0.95 */
const ANIMATION_SPEED = 1.85
/** Tilts the sphere so Y-axis spin is visible (symmetric blobs hide pure Y rotation) */
const AXIAL_TILT = 0.42

function buildMorphClip(animations) {
  const source =
    animations.find((clip) => clip.name.includes('Action')) ?? animations[0]
  if (!source) return null

  const tracks = source.tracks.filter((track) => !track.name.endsWith('.quaternion'))
  if (tracks.length === 0) return source

  return new THREE.AnimationClip(source.name, source.duration, tracks)
}

export default function AnimatedSphere() {
  const verticalSpinRef = useRef()
  const spinAngle = useRef(0)
  const animRef = useRef()
  const mixerRef = useRef(null)
  const [uiScale, setUiScale] = useState(1)
  const { scene, animations } = useGLTF(GLB_URL)

  const model = useMemo(() => scene.clone(true), [scene])
  const morphClip = useMemo(() => buildMorphClip(animations), [animations])
  const modelScale = MODEL_SCALE * uiScale

  useEffect(() => {
    const sync = () => setUiScale(readUiScale())
    sync()
    return onViewportScaleChange(sync)
  }, [])

  useEffect(() => {
    model.traverse((child) => {
      if (!child.isMesh?.material) return

      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (material.color) material.color.multiplyScalar(1.2)
        if ('emissive' in material && material.emissive) {
          material.emissive.addScalar(0.08)
        }
        if ('emissiveIntensity' in material) {
          material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.25)
        }
        if ('roughness' in material) {
          material.roughness *= 0.82
        }
        material.needsUpdate = true
      })
    })
  }, [model])

  useEffect(() => {
    if (!morphClip) return

    const mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(morphClip)

    action.reset()
    action.setLoop(THREE.LoopRepeat)
    action.clampWhenFinished = false
    action.zeroSlopeAtStart = true
    action.zeroSlopeAtEnd = true
    action.timeScale = ANIMATION_SPEED
    action.play()

    mixerRef.current = mixer

    return () => {
      action.stop()
      mixer.stopAllAction()
      mixerRef.current = null
    }
  }, [model, morphClip])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    mixerRef.current?.update(dt)

    if (!verticalSpinRef.current) return

    spinAngle.current += dt * VERTICAL_SPIN_SPEED
    verticalSpinRef.current.rotation.set(0, spinAngle.current, 0, 'YXZ')
  })

  return (
    <group scale={modelScale}>
      <group ref={verticalSpinRef}>
        <group rotation={[AXIAL_TILT, 0, 0]}>
          <Center precise>
            <group ref={animRef}>
              <primitive object={model} />
            </group>
          </Center>
        </group>
      </group>
    </group>
  )
}
