import { useRef, useEffect } from 'react'
import { Renderer, Program, Triangle, Mesh } from 'ogl'
import './RippleGrid.css'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [1, 1, 1]
}

export default function RippleGrid({
  enableRainbow = false,
  gridColor = '#ffffff',
  rippleIntensity = 0.001,
  gridSize = 15.0,
  gridThickness = 15.0,
  fadeDistance = 1.5,
  vignetteStrength = 1.5,
  glowIntensity = 0.1,
  opacity = 0.5,
  gridRotation = 0,
  mouseInteraction = true,
  mouseInteractionRadius = 1,
  className = '',
}) {
  const containerRef = useRef(null)
  const mousePositionRef = useRef({ x: 0.5, y: 0.5 })
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 })
  const mouseInfluenceRef = useRef(0)
  const uniformsRef = useRef(null)
  const propsRef = useRef({
    enableRainbow,
    gridColor,
    rippleIntensity,
    gridSize,
    gridThickness,
    fadeDistance,
    vignetteStrength,
    glowIntensity,
    opacity,
    gridRotation,
    mouseInteraction,
    mouseInteractionRadius,
  })

  propsRef.current = {
    enableRainbow,
    gridColor,
    rippleIntensity,
    gridSize,
    gridThickness,
    fadeDistance,
    vignetteStrength,
    glowIntensity,
    opacity,
    gridRotation,
    mouseInteraction,
    mouseInteractionRadius,
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true,
    })
    const gl = renderer.gl
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    container.appendChild(gl.canvas)

    const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`

    const frag = `precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    if (gridRotation != 0.0) {
        uv = rotate(gridRotation * pi / 180.0) * uv;
    }

    float dist = length(uv);
    float func = sin(pi * (iTime - dist));
    vec2 rippleUv = uv + uv * func * rippleIntensity;

    if (mouseInteraction && mouseInfluence > 0.0) {
        vec2 mouseUv = (mousePosition * 2.0 - 1.0);
        mouseUv.x *= iResolution.x / iResolution.y;
        float mouseDist = length(uv - mouseUv);
        
        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
        
        float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
        rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
    }

    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
    vec2 b = abs(a);

    float aaWidth = 0.5;
    vec2 smoothB = vec2(
        smoothstep(0.0, aaWidth, b.x),
        smoothstep(0.0, aaWidth, b.y)
    );

    vec3 color = vec3(0.0);
    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
    color += exp(-gridThickness * smoothB.y);
    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

    if (glowIntensity > 0.0) {
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
    }

    float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
    
    vec2 vignetteCoords = vUv - 0.5;
    float vignetteDistance = length(vignetteCoords);
    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
    vignette = clamp(vignette, 0.0, 1.0);
    
    vec3 t;
    if (enableRainbow) {
        t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
        ) + 0.5;
    } else {
        t = gridColor;
    }

    float finalFade = ddd * vignette;
    float alpha = length(color) * finalFade * opacity;
    gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}`

    const p = propsRef.current
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      enableRainbow: { value: p.enableRainbow },
      gridColor: { value: hexToRgb(p.gridColor) },
      rippleIntensity: { value: p.rippleIntensity },
      gridSize: { value: p.gridSize },
      gridThickness: { value: p.gridThickness },
      fadeDistance: { value: p.fadeDistance },
      vignetteStrength: { value: p.vignetteStrength },
      glowIntensity: { value: p.glowIntensity },
      opacity: { value: p.opacity },
      gridRotation: { value: p.gridRotation },
      mouseInteraction: { value: p.mouseInteraction },
      mousePosition: { value: [0.5, 0.5] },
      mouseInfluence: { value: 0 },
      mouseInteractionRadius: { value: p.mouseInteractionRadius },
    }

    uniformsRef.current = uniforms

    const geometry = new Triangle(gl)
    const program = new Program(gl, { vertex: vert, fragment: frag, uniforms })
    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container
      if (w <= 0 || h <= 0) return
      renderer.setSize(w, h)
      uniforms.iResolution.value = [w, h]
    }

    const handleMouseMove = (e) => {
      if (!propsRef.current.mouseInteraction) return
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1.0 - (e.clientY - rect.top) / rect.height
      targetMouseRef.current = { x, y }
    }

    const handleMouseEnter = () => {
      if (!propsRef.current.mouseInteraction) return
      mouseInfluenceRef.current = 1.0
    }

    const handleMouseLeave = () => {
      if (!propsRef.current.mouseInteraction) return
      mouseInfluenceRef.current = 0.0
    }

    window.addEventListener('resize', resize)
    if (propsRef.current.mouseInteraction) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)
    }
    resize()

    let frameId = 0
    const render = (t) => {
      frameId = requestAnimationFrame(render)
      const live = propsRef.current

      uniforms.enableRainbow.value = live.enableRainbow
      uniforms.gridColor.value = hexToRgb(live.gridColor)
      uniforms.rippleIntensity.value = live.rippleIntensity
      uniforms.gridSize.value = live.gridSize
      uniforms.gridThickness.value = live.gridThickness
      uniforms.fadeDistance.value = live.fadeDistance
      uniforms.vignetteStrength.value = live.vignetteStrength
      uniforms.glowIntensity.value = live.glowIntensity
      uniforms.opacity.value = live.opacity
      uniforms.gridRotation.value = live.gridRotation
      uniforms.mouseInteraction.value = live.mouseInteraction
      uniforms.mouseInteractionRadius.value = live.mouseInteractionRadius

      uniforms.iTime.value = t * 0.001

      const lerpFactor = 0.1
      mousePositionRef.current.x +=
        (targetMouseRef.current.x - mousePositionRef.current.x) * lerpFactor
      mousePositionRef.current.y +=
        (targetMouseRef.current.y - mousePositionRef.current.y) * lerpFactor

      uniforms.mouseInfluence.value +=
        (mouseInfluenceRef.current - uniforms.mouseInfluence.value) * 0.05
      uniforms.mousePosition.value = [
        mousePositionRef.current.x,
        mousePositionRef.current.y,
      ]

      renderer.render({ scene: mesh })
    }

    frameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      if (propsRef.current.mouseInteraction) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas)
      }
    }
  }, [])

  const rootClass = ['ripple-grid-container', className].filter(Boolean).join(' ')

  return <div ref={containerRef} className={rootClass} aria-hidden="true" />
}
