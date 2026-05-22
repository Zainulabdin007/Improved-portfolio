import Aurora from './Aurora'
import './AuroraSection.css'

export default function AuroraSection() {
  return (
    <div className="aurora-section" aria-hidden="true">
      <div className="aurora-section__bg">
        <Aurora
          colorStops={['#7cff67', '#B497CF', '#5227FF']}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>
    </div>
  )
}
