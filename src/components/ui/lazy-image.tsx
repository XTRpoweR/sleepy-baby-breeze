
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className,
  loading = 'lazy',
  fetchPriority = 'auto',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if native lazy loading is supported
  const supportsNativeLazyLoading = 'loading' in HTMLImageElement.prototype;

  useEffect(() => {
    if (!supportsNativeLazyLoading && loading === 'lazy') {
      const img = imgRef.current;
      if (!img) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsLoaded(true);
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );

      observer.observe(img);

      return () => {
        observer.unobserve(img);
      };
    } else {
      setIsLoaded(true);
    }
  }, [loading, supportsNativeLazyLoading]);

  const handleError = () => {
    setError(true);
  };

  const imgSrc = error && fallbackSrc ? fallbackSrc : src;
  const shouldLoad = loading === 'eager' || isLoaded;

  return (
    <img
      ref={imgRef}
      src={shouldLoad ? imgSrc : undefined}
      alt={alt}
      loading={supportsNativeLazyLoading ? loading : undefined}
      fetchpriority={fetchPriority}
      onError={handleError}
      className={cn(
        'transition-opacity duration-300',
        shouldLoad ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    />
  );
};
