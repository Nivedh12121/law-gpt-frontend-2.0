import React, { useState, useEffect } from 'react';
import scstLogo from '../assets/scst_logo.jpg';

interface LegalWatermarkProps {
  opacity?: number;
  size?: 'small' | 'medium' | 'large';
  position?: 'center' | 'bottom-right' | 'top-left';
  showText?: boolean;
  interactive?: boolean;
}

const LegalWatermark: React.FC<LegalWatermarkProps> = ({ 
  opacity = 0.04, 
  size = 'large',
  position = 'center',
  showText = true,
  interactive = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Subtle rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40', 
    large: 'w-80 h-80'
  };

  const positionClasses = {
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    'bottom-right': 'bottom-12 right-12',
    'top-left': 'top-12 left-12'
  };

  const hoverOpacity = interactive ? (isHovered ? opacity * 2 : opacity) : opacity;

  return (
    <div 
      className={`fixed ${positionClasses[position]} pointer-events-none z-0 select-none transition-all duration-1000`}
      style={{ opacity: hoverOpacity }}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
    >
      <div className="relative scales-container">
        {/* Multiple layered watermark images for depth */}
        <div className="relative">
          {/* Background glow layer */}
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-radial from-blue-400/5 via-purple-400/3 to-transparent rounded-full blur-2xl animate-pulse-slow`}
            style={{ 
              animationDelay: '1s',
              transform: `rotate(${rotation * 0.3}deg)` 
            }}
          />
          
          {/* Secondary glow */}
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-radial from-gold-400/8 via-transparent to-transparent rounded-full blur-xl animate-pulse-slow`}
            style={{ 
              animationDelay: '2s',
              transform: `rotate(${-rotation * 0.2}deg)` 
            }}
          />
          
          {/* Main watermark image - SCST Logo */}
          <img 
            src={scstLogo} 
            alt="SCST GPT Logo"
            className={`${sizeClasses[size]} object-contain transition-all duration-2000 animate-pulse-slow legal-watermark rounded-full`}
            style={{ 
              transform: `rotate(${rotation * 0.1}deg) scale(${isHovered ? 1.05 : 1})`,
              filter: `opacity(0.6) drop-shadow(0 0 20px rgba(59, 130, 246, 0.2))`
            }}
            draggable={false}
          />
          
          {/* Overlay pattern for texture */}
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} opacity-20`}
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(184, 134, 11, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
              `,
              transform: `rotate(${rotation * 0.05}deg)`
            }}
          />
        </div>
        
        {/* Enhanced legal text overlay */}
        {showText && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
            <div 
              className="text-gray-400/40 text-lg font-serif tracking-[0.3em] mb-2 transition-all duration-1000"
              style={{ 
                textShadow: '0 0 10px rgba(184, 134, 11, 0.2)',
                transform: `scale(${isHovered ? 1.1 : 1})`
              }}
            >
              SCST-GPT
            </div>
            <div className="text-gray-400/25 text-xs font-light tracking-[0.2em] uppercase">
              Legal AI Assistant
            </div>
            <div className="mt-2 w-16 h-px bg-gradient-to-r from-transparent via-gray-400/20 to-transparent mx-auto" />
            <div className="text-gray-400/20 text-xs font-light tracking-wider mt-2 italic">
              Powered by AI • Indian Law
            </div>
          </div>
        )}
        
        {/* Animated legal symbols around the scales */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 text-gray-400/10 animate-pulse-slow"
              style={{
                top: `${30 + Math.sin(rotation * 0.01 + i * 60) * 25}%`,
                left: `${50 + Math.cos(rotation * 0.01 + i * 60) * 35}%`,
                animationDelay: `${i * 0.5}s`,
                transform: `rotate(${rotation + i * 60}deg)`
              }}
            >
              ⚖️
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalWatermark;