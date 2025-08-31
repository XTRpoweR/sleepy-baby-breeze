
// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  } else {
    fn();
  }
};

export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  observer.observe(img);
};

// Enhanced lazy loading function for better performance
export const setupLazyLoading = () => {
  if (typeof window === 'undefined') return;

  // Use native lazy loading if supported, fallback to Intersection Observer
  const supportsNativeLazyLoading = 'loading' in HTMLImageElement.prototype;
  
  if (!supportsNativeLazyLoading) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy-loading');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
      threshold: 0.01
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  fontLink.as = 'style';
  document.head.appendChild(fontLink);

  // Preload hero image if not already preloaded
  const heroImageLink = document.createElement('link');
  heroImageLink.rel = 'preload';
  heroImageLink.href = '/lovable-uploads/6667cdc7-f4a7-4fad-9507-4f558fe9e8df.png';
  heroImageLink.as = 'image';
  heroImageLink.setAttribute('fetchpriority', 'high');
  
  // Check if already preloaded to avoid duplication
  const existingPreload = document.querySelector('link[href="/lovable-uploads/6667cdc7-f4a7-4fad-9507-4f558fe9e8df.png"]');
  if (!existingPreload) {
    document.head.appendChild(heroImageLink);
  }
};

// Initialize performance optimizations
if (typeof window !== 'undefined') {
  // Enable hardware acceleration for smoother animations
  document.documentElement.style.transform = 'translateZ(0)';
  
  // Optimize scroll performance
  if ('scrollBehavior' in document.documentElement.style) {
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  // Initialize lazy loading when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLazyLoading);
  } else {
    setupLazyLoading();
  }

  // Optimize image loading performance
  document.addEventListener('DOMContentLoaded', () => {
    // Force repaint for critical images
    const heroImages = document.querySelectorAll('img[fetchpriority="high"]');
    heroImages.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.style.willChange = 'transform';
        img.addEventListener('load', () => {
          img.style.willChange = 'auto';
        }, { once: true });
      }
    });

    // Setup lazy loading for images that don't have native support
    setupLazyLoading();
  });
}
