# RENDERER CONTRACT

This document defines the strict requirements for the Anime Architecture Archive visualization engines.

## Available Renderers
- `timeline`: Requires `causalEvents` [4-10 nodes optimal]
- `node-graph`: Requires `relationships` [8-25 edges optimal]
- `counter-tree`: Requires `counterplay` [5-12 matchups optimal]
- `standard-cards`: The universal fallback.

## Universal Contract
Every renderer MUST accept the following props:
```javascript
export default function RendererExplorer({ 
  characters = [], 
  pipelines = [], // counterplay, causalEvents, or relationships
  isSystemMode = false, 
  theme = {} 
}) 
```

## Error Boundaries
If a renderer receives an invalid payload shape or experiences a runtime DOM crash (e.g. D3 simulation bounds failure), the global `<ErrorBoundary>` will catch the exception and immediately gracefully flush the screen, injecting `<StandardCardsExplorer />` wrapped in a warning banner.

*No dashboard is allowed to hard-crash the user session under any circumstance.*
