import Aurora from './Aurora'
import './AuroraSection.css'

export default function AuroraSection({
  origin = 'top',
  className = '',
  colorStops = ['#7cff67', '#B497CF', '#5227FF'],
  blend = 0.5,
  amplitude = 1.0,
  speed = 1,
}) {
  const rootClass = ['aurora-section', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} aria-hidden="true">
      <div className="aurora-section__bg">
        <Aurora
          origin={origin}
          colorStops={colorStops}
          blend={blend}
          amplitude={amplitude}
          speed={speed}
        />
      </div>
    </div>
  )
}
