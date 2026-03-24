// Lightweight Analytics for Anime Archive
// Minimal tracking without external dependencies
// Fire-and-forget, doesn't block UX

const TRACKING_EVENTS = {
  CTA_CLICK: 'cta_click',
  OPEN_SYSTEM: 'open_system',
  SCROLL_DEPTH: 'scroll_depth',
  HERO_VISIBILITY: 'hero_visibility',
  SHARE_FRAME: 'share_frame',
  EXTERNAL_LINK: 'external_link',
  SHARE_BUTTON: 'share_button',
}

// Default tracking target (GoatCounter or console)
const TRACKING_CONFIG = {
  enabled: typeof window !== 'undefined',
  trackURL: window?.location?.pathname || '/',
}

// Track CTA clicks (hero CTA or mobile sticky footer)
export function trackCTAClick(url, universe, phase) {
  if (!TRACKING_CONFIG.enabled || !url) return
  
  const data = {
    page: TRACKING_CONFIG.trackURL,
    universe,
    link_type: phase,
    event_name: TRACKING_EVENTS.CTA_CLICK,
    timestamp: Date.now(),
  }

  // Fire to GoatCounter if available
  if (window.goatcounter) {
    window.goatcounter.count({
      path: `cta_${url}_${phase}`,
      title: `CTA Click: ${phase}`,
      event: true,
      data,
    })
  }

  // Backup: console log for debugging
  if (import.meta.env.DEV) {
    console.debug('[Analytics] CTA Click:', { url, universe, phase, ...data })
  }

  // Optional: send beacon for reliable delivery
  try {
    const beaconData = encodeURIComponent(JSON.stringify(data))
    navigator.sendBeacon(`https://hashi.goatcounter.com/count?t=${Date.now()}&d=${beaconData}`, new Blob([beaconData], { type: 'application/json' }))
  } catch {
    // Silent fail for beacon
  }
}

// Track "Open System" button clicks
export function trackOpenSystem(tabIndex, universe, tabName) {
  if (!TRACKING_CONFIG.enabled) return
  
  const data = {
    page: TRACKING_CONFIG.trackURL,
    universe,
    tab_index: tabIndex,
    tab_name: tabName,
    event_name: TRACKING_EVENTS.OPEN_SYSTEM,
    timestamp: Date.now(),
  }

  if (window.goatcounter) {
    window.goatcounter.count({
      path: `open_system_${tabIndex}`,
      title: `Open System: ${tabName}`,
      event: true,
      data,
    })
  }

  if (import.meta.env.DEV) {
    console.debug('[Analytics] Open System:', { tabIndex, universe, tabName, ...data })
  }
}

// Track scroll depth
export function trackScrollDepth(currentDepth) {
  if (!TRACKING_CONFIG.enabled) return

  const data = {
    page: TRACKING_CONFIG.trackURL,
    scroll_depth: currentDepth,
    event_name: TRACKING_EVENTS.SCROLL_DEPTH,
    timestamp: Date.now(),
  }

  // Only track every 25% depth change to avoid spam
  if (!window._lastTrackDepth || currentDepth - window._lastTrackDepth >= 25) {
    window._lastTrackDepth = currentDepth

    if (window.goatcounter) {
      window.goatcounter.count({
        path: `scroll_${currentDepth}`,
        title: `Scroll Depth: ${currentDepth}%`,
        event: true,
        data,
      })
    }

    if (import.meta.env.DEV) {
      console.debug('[Analytics] Scroll Depth:', currentDepth)
    }
  }
}

// Track hero visibility changes
export function trackHeroVisibility(isVisible, duration = 0) {
  if (!TRACKING_CONFIG.enabled) return

  const data = {
    page: TRACKING_CONFIG.trackURL,
    hero_visible: isVisible,
    duration_seconds: duration,
    event_name: TRACKING_EVENTS.HERO_VISIBILITY,
    timestamp: Date.now(),
  }

  if (window.goatcounter) {
    window.goatcounter.count({
      path: `hero_${isVisible ? 'visible' : 'hidden'}`,
      title: `Hero Visibility: ${isVisible}`,
      event: true,
      data,
    })
  }

  if (import.meta.env.DEV) {
    console.debug('[Analytics] Hero Visibility:', { isVisible, duration: `${duration}s`, ...data })
  }
}

// Track share frame visibility
export function trackShareFrame(visible) {
  if (!TRACKING_CONFIG.enabled) return

  const data = {
    page: TRACKING_CONFIG.trackURL,
    share_frame: visible,
    event_name: TRACKING_EVENTS.SHARE_FRAME,
    timestamp: Date.now(),
  }

  if (window.goatcounter) {
    window.goatcounter.count({
      path: `share_frame_${visible}`,
      title: `Share Frame: ${visible}`,
      event: true,
      data,
    })
  }

  if (import.meta.env.DEV) {
    console.debug('[Analytics] Share Frame:', { visible, ...data })
  }
}

// Track external link clicks (TikTok, MAL, BuyMeACoffee, etc.)
export function trackExternalLink(platform, url) {
  if (!TRACKING_CONFIG.enabled) return

  const data = {
    page: TRACKING_CONFIG.trackURL,
    platform,
    url: url || '',
    event_name: TRACKING_EVENTS.EXTERNAL_LINK,
    timestamp: Date.now(),
  }

  if (window.goatcounter) {
    window.goatcounter.count({
      path: `external_${platform}`,
      title: `External Link: ${platform}`,
      event: true,
      data,
    })
  }
}

// Track share button usage
export function trackShareButton(method) {
  if (!TRACKING_CONFIG.enabled) return

  const data = {
    page: TRACKING_CONFIG.trackURL,
    method: method || 'clipboard',
    event_name: TRACKING_EVENTS.SHARE_BUTTON,
    timestamp: Date.now(),
  }

  if (window.goatcounter) {
    window.goatcounter.count({
      path: `share_button_${method || 'clipboard'}`,
      title: `Share Button: ${method || 'clipboard'}`,
      event: true,
      data,
    })
  }
}

// Get analytics state (for debugging)
export function getAnalyticsState() {
  return {
    enabled: TRACKING_CONFIG.enabled,
    url: TRACKING_CONFIG.trackURL,
    lastTrackDepth: window._lastTrackDepth || 'none',
    goatcounter: typeof window.goatcounter !== 'undefined',
  }
}
