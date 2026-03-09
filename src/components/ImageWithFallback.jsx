import { useState } from 'react';
import { resolveColor } from '../utils/resolveColor';

const ImageWithFallback = ({ src, alt, fallbackIcon: Icon, gradientFrom, gradientTo, accentColor, fetchFailed }) => {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError || fetchFailed) {
    const color = resolveColor(accentColor, '#64748b');
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom, ${resolveColor(gradientFrom, '#0f172a')}, ${resolveColor(gradientTo, '#1e293b')})`
        }}
      >
        {Icon ? (
          <Icon className="w-20 h-20 opacity-70" style={{ color }} />
        ) : alt ? (
          <span className="text-2xl font-bold font-mono opacity-70" style={{ color }}>
            {alt.split(' ')[0].slice(0, 3)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={225}
      height={350}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover object-top"
      onError={() => setImgError(true)}
    />
  );
};

export default ImageWithFallback;
