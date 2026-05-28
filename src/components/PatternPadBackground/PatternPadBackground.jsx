import './PatternPadBackground.css'

/** Tiled PatternPad export — used as the WATCARD page backdrop. */
export default function PatternPadBackground() {
  return (
    <div className="patternpad-bg" aria-hidden="true">
      <div className="patternpad-bg__tile" />
      <div className="patternpad-bg__shade" />
    </div>
  )
}
