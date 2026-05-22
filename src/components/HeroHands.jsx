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
  return (
    <>
      <HeroHand side="left" />
      <HeroHand side="right" />
    </>
  )
}
