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

export default function HeroHands({ layoutRootClass = 'hero__stage' }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const stage =
      root.closest(`.${layoutRootClass}`) ?? root.closest('.hero__stage')
    if (!stage) return

    const update = () => syncHandLayoutVars(stage)
    update()

    const ro = new ResizeObserver(update)
    ro.observe(stage)

    return () => ro.disconnect()
  }, [layoutRootClass])

  return (
    <div ref={rootRef} className="hero__hands" aria-hidden="true">
      <HeroHand side="left" />
      <HeroHand side="right" />
    </div>
  )
}
