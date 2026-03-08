import { useState } from 'react';

const TAILWIND_COLORS = {
  'slate-900': '#0f172a', 'slate-800': '#1e293b', 'slate-500': '#64748b',
  'red-900': '#7f1d1d', 'red-800': '#991b1b', 'red-500': '#ef4444',
  'orange-800': '#9a3412', 'orange-600': '#ea580c', 'orange-500': '#f97316',
  'amber-700': '#b45309', 'amber-400': '#fbbf24',
  'yellow-700': '#a16207', 'yellow-500': '#eab308',
  'emerald-800': '#065f46', 'emerald-600': '#059669', 'emerald-400': '#34d399',
  'green-900': '#14532d', 'green-800': '#166534', 'green-500': '#22c55e',
  'rose-900': '#881337', 'rose-400': '#fb7185',
  'indigo-500': '#6366f1', 'indigo-300': '#a5b4fc',
  'blue-900': '#1e3a8a',
  'purple-900': '#581c87', 'purple-400': '#c084fc',
  'fuchsia-700': '#a21caf',
  'stone-900': '#1c1917',
  'gray-900': '#111827', 'gray-950': '#030712', 'gray-500': '#6b7280', 'gray-300': '#d1d5db',
  'cyan-400': '#22d3ee',
};

function resolveColor(name, fallback) {
  return TAILWIND_COLORS[name] || fallback || '#1e293b';
}

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
