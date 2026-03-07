import { useState } from 'react'

export default function ImageWithFallback({
  src,
  alt,
  fallbackIcon: FallbackIcon,
  gradientFrom = 'from-gray-900',
  gradientTo = 'to-gray-800',
  accentColor = 'text-cyan-400',
  className = '',
}) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    return (
      <div
        className={`bg-gradient-to-b ${gradientFrom} ${gradientTo} flex items-center justify-center ${className}`}
      >
        {FallbackIcon && <FallbackIcon className={`w-16 h-16 ${accentColor}`} />}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className={`object-cover object-top ${className}`}
    />
  )
}
