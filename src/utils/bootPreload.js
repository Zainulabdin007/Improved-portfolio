import { useGLTF } from '@react-three/drei'
import { GLB_URL } from '../constants'

/** Above-the-fold / first-scroll assets */
const CRITICAL_IMAGES = [
  '/improveLeft.png',
  '/gradientbackground.svg',
  '/ZBicon.svg',
  '/CSS3_logo.svg.png',
  '/openai.svg',
  '/Visual_Studio_Code_1.35_icon.svg.png',
]

const GLTF_URLS = [GLB_URL, '/my_computer.glb', '/3d_chrome_dino_walking.glb']

function waitForWindowLoad() {
  if (typeof document === 'undefined') return Promise.resolve()
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    window.addEventListener('load', resolve, { once: true })
  })
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function kickoffGltfPreload() {
  GLTF_URLS.forEach((url) => useGLTF.preload(url))
}

/** Fonts, images, and GLTF parser warmup — runs while the boot overlay is visible. */
export async function runBootPreload() {
  const fonts =
    typeof document !== 'undefined' && document.fonts
      ? document.fonts.ready
      : Promise.resolve()

  await Promise.all([
    fonts,
    waitForWindowLoad(),
    Promise.all(CRITICAL_IMAGES.map(preloadImage)),
    kickoffGltfPreload(),
  ])
}
