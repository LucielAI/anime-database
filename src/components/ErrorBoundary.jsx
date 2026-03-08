import React from 'react'
import StandardCardsExplorer from '../visualizations/StandardCardsExplorer'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[ARCHIVE] Renderer crashed. Falling back to StandardCardsExplorer.')
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-4">
          <div className="p-3 border border-red-500/30 bg-red-500/5 rounded-lg text-xs text-red-500 font-mono">
            // [SYS_ERR]: RENDERER CRASHED. FALLBACK PROTOCOL ENGAGED.
          </div>
          <StandardCardsExplorer 
            characters={this.props.data?.characters || []} 
            isSystemMode={this.props.isSystemMode} 
            theme={this.props.theme} 
          />
        </div>
      )
    }

    return this.props.children
  }
}
