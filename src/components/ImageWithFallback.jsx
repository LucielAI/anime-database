import { useState } from 'react';

const ImageWithFallback = ({ src, alt, fallbackIcon: Icon, gradientFrom, gradientTo, accentColor, fetchFailed }) => {
  const [imgError, setImgError] = useState(false);
  
  if (!src || imgError || fetchFailed) {
    return (
      <div className={`w-full h-full bg-gradient-to-b from-${gradientFrom || 'slate-900'} to-${gradientTo || 'slate-800'} flex items-center justify-center`}>
        {Icon && <Icon className={`w-20 h-20 text-${accentColor || 'slate-500'} opacity-70`} />}
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover object-top" 
      onError={() => setImgError(true)} 
    />
  );
};

export default ImageWithFallback;
