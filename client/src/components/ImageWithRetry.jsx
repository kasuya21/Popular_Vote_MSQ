import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

const ImageWithRetry = ({ src, alt, fallback = 'https://placehold.co/300x400/1a1730/e8dfc8?text=No+Image', maxRetries = 999, className, style, ...props }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  // Reset when src changes
  useEffect(() => {
    if (src !== imgSrc) {
      setImgSrc(src);
      setRetryCount(0);
      setIsLoading(true);
    }
  }, [src]);

  // Check if image is already loaded (e.g., from cache)
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalHeight > 0) {
        setIsLoading(false);
      }
    }
  }, [imgSrc]);

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
          <LoadingSpinner small />
        </div>
      )}
      
      {/* Actual Image */}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover rounded-[inherit] transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
};

export default ImageWithRetry;
