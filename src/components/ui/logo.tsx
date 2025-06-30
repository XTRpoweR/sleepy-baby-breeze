
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };

  return (
    <img 
      src="/lovable-uploads/f6cc4bb8-f75f-424b-a5f3-c8e9e4b8d82d" 
      alt="SleepyBaby Logo" 
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
};
