import { useState } from 'react'

const ImageWithFallback = ({ src, alt, fallbackIcon: Icon, gradientFrom, gradientTo, accentColor, fetchFailed }) => {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError || fetchFailed) {
    return (
      <div className={`w-full h-full bg-gradient-to-b from-${gradientFrom} to-${gradientTo} flex items-center justify-center`}>
        <Icon className={`w-20 h-20 text-${accentColor} opacity-70`} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover object-top"
      onError={() => setImgError(true)}
    />
  )
}

export default ImageWithFallback
