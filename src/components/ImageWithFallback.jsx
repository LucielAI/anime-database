import { useState } from 'react';
import { resolveColor } from '../utils/resolveColor';

const ImageWithFallback = ({ src, alt, fallbackIcon: Icon, gradientFrom, gradientTo, accentColor, fetchFailed }) => {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError || fetchFailed) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom, ${resolveColor(gradientFrom, '#0f172a')}, ${resolveColor(gradientTo, '#1e293b')})`
        }}
      >
        {Icon && <Icon className="w-20 h-20 opacity-70" style={{ color: resolveColor(accentColor, '#64748b') }} />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover object-top"
      onError={() => setImgError(true)}
    />
  );
};

export default ImageWithFallback;
