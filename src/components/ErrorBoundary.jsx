import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: '2rem',
            color: '#111',
            fontFamily: 'system-ui, sans-serif',
            background: '#fff',
            minHeight: '100vh',
          }}
        >
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
