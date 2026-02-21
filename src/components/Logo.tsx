"use client";

import React from 'react';
import { Sparkles } from 'lucide-react'; // Changed from Gem to Sparkles
import { cn } from '@/lib/utils';

interface LogoProps {
  src?: string;
  alt?: string;
  appName: string;
  iconClassName?: string;
  appNameClassName?: string;
  containerClassName?: string;
}

const Logo = ({ src, alt = "App Logo", appName, iconClassName, appNameClassName, containerClassName }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", containerClassName)}>
      {src ? (
        <img src={src} alt={alt} className={cn("h-8 w-8", iconClassName)} />
      ) : (
        <Sparkles className={cn("h-8 w-8 text-primary", iconClassName)} /> // Default icon if no src
      )}
      {appName && <span className={cn("text-lg font-semibold", appNameClassName)}>{appName}</span>}
    </div>
  );
};

export default Logo;