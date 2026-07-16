import React, { useState, useEffect } from 'react';

const ImageWithRetry = ({ src, alt, fallback = 'https://placehold.co/300x400/1a1730/e8dfc8?text=No+Image', maxRetries = 999, className, style, ...props }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  // Reset when src changes
  useEffect(() => {
    setImgSrc(src);
    setRetryCount(0);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setImgSrc(`${src}${src.includes('?') ? '&' : '?'}retry=${Date.now()}`);
      }, 2000); // Wait 2 seconds before retrying to prevent spam
    } else {
      setImgSrc(fallback);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`} style={style}>
      {/* Loading Spinner overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/40 backdrop-blur-sm z-10 rounded-[inherit]">
          <span className="loading loading-spinner text-[#d4af37] w-5 h-5"></span>
        </div>
      )}
      
      {/* Actual Image */}
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-cover rounded-[inherit]"
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

export default ImageWithRetry;
