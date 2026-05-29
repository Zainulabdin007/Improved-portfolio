/** Deterministic 0–1 from index (stable across renders). */
function hash(index, salt) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** Per-logo sine drift params (px amplitudes, rad/s speeds, phase offsets). */
export function createLogoFloatMotion(index) {
  const h = (s) => hash(index, s)
  return {
    px: h(1) * Math.PI * 2,
    py: h(2) * Math.PI * 2,
    sx: 0.35 + h(3) * 0.55,
    sy: 0.3 + h(4) * 0.5,
    ax: 10 + h(5) * 14,
    ay: 10 + h(6) * 14,
    bx: 0.25 + h(7) * 0.2,
    by: 0.25 + h(8) * 0.2,
  }
}

export function logoFloatOffset(m, timeSec) {
  const x =
    Math.sin(timeSec * m.sx + m.px) * m.ax +
    Math.sin(timeSec * m.sx * 0.67 + m.py) * m.ax * m.bx
  const y =
    Math.cos(timeSec * m.sy + m.py) * m.ay +
    Math.sin(timeSec * m.sy * 0.73 + m.px) * m.ay * m.by
  return { x, y }
}
