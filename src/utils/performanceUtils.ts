
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

export const preloadCriticalResources = () => {
  // Preload critical fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  link.as = 'style';
  document.head.appendChild(link);
};

// Initialize performance optimizations
if (typeof window !== 'undefined') {
  // Enable hardware acceleration for smoother animations
  document.documentElement.style.transform = 'translateZ(0)';
  
  // Optimize scroll performance
  if ('scrollBehavior' in document.documentElement.style) {
    document.documentElement.style.scrollBehavior = 'smooth';
  }
}
