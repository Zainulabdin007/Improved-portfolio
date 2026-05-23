import { useLayoutEffect, useRef } from 'react'
import { syncHandLayoutVars } from '../utils/viewportVars'
import './HeroHands.css'

const HAND_SRC = '/improveLeft.png'

function HeroHand({ side }) {
  return (
    <div className={`hero__hand hero__hand--${side}`} aria-hidden="true">
      <img className="hero__hand__img" src={HAND_SRC} alt="" draggable={false} />
    </div>
  )
}

export default function HeroHands() {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const stage = rootRef.current?.closest('.hero__stage')
    if (!stage) return

    const update = () => syncHandLayoutVars(stage)
    update()

    const ro = new ResizeObserver(update)
    ro.observe(stage)

    return () => ro.disconnect()
  }, [])

  return (
    <div ref={rootRef} className="hero__hands" aria-hidden="true">
      <HeroHand side="left" />
      <HeroHand side="right" />
    </div>
  )
}
