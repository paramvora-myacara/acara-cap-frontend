'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  Calculator, 
  PieChart,
  BarChart3,
  Wallet,
  Building2,
  Home,
  Building,
  Factory,
  Store,
  Warehouse,
  MapPin,
  TreePine
} from 'lucide-react';

// Finance icons data (left side)
const financeIcons = [
  { icon: DollarSign, name: 'Dollar' },
  { icon: CreditCard, name: 'Credit Card' },
  { icon: Banknote, name: 'Banknote' },
  { icon: TrendingUp, name: 'Trending Up' },
  { icon: Calculator, name: 'Calculator' },
  { icon: PieChart, name: 'Pie Chart' },
  { icon: BarChart3, name: 'Bar Chart' },
  { icon: Wallet, name: 'Wallet' },
];

// Real estate icons data (right side)
const realEstateIcons = [
  { icon: Building2, name: 'Office Building' },
  { icon: Home, name: 'House' },
  { icon: Building, name: 'Building' },
  { icon: Factory, name: 'Factory' },
  { icon: Store, name: 'Store' },
  { icon: Warehouse, name: 'Warehouse' },
  { icon: MapPin, name: 'Location' },
  { icon: TreePine, name: 'Land' },
];

interface AnimationState {
  leftIconIndex: number;
  rightIconIndex: number;
  leftIconPosition: { x: number; y: number };
  rightIconPosition: { x: number; y: number };
  leftStartY: number;
  rightStartY: number;
  showConnection: boolean;
  connectionComplete: boolean;
  phase: 'idle' | 'moving-to-center' | 'moving-horizontal' | 'connecting' | 'connected' | 'resetting';
}

export function CapMatchAnimation() {
  const [animationState, setAnimationState] = useState<AnimationState>({
    leftIconIndex: 0,
    rightIconIndex: 0,
    leftIconPosition: { x: 8, y: 20 },
    rightIconPosition: { x: 92, y: 80 },
    leftStartY: 20,
    rightStartY: 80,
    showConnection: false,
    connectionComplete: false,
    phase: 'idle',
  });

  // State to control progressive drawing of the connection line
  const [lineDrawn, setLineDrawn] = useState(false);

  useEffect(() => {
    const runAnimation = () => {
      // Phase 1: Select random icons and their starting positions
      const leftIndex = Math.floor(Math.random() * financeIcons.length);
      const rightIndex = Math.floor(Math.random() * realEstateIcons.length);
      
      // Random Y positions for starting points (simulate different positions in columns)
      const leftStartY = 15 + Math.random() * 70; // Random Y between 15% and 85%
      const rightStartY = 15 + Math.random() * 70;
      
      setAnimationState(prev => ({
        ...prev,
        leftIconIndex: leftIndex,
        rightIconIndex: rightIndex,
        leftStartY,
        rightStartY,
        leftIconPosition: { x: 8, y: leftStartY },
        rightIconPosition: { x: 92, y: rightStartY },
        phase: 'moving-to-center',
        showConnection: false,
        connectionComplete: false,
      }));

      // Phase 1: Move icons diagonally to center Y position
      setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          leftIconPosition: { x: 8, y: 50 },
          rightIconPosition: { x: 92, y: 50 },
        }));
      }, 100);

      // Phase 2: Move icons horizontally toward each other
      setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          phase: 'moving-horizontal',
          leftIconPosition: { x: 35, y: 50 },
          rightIconPosition: { x: 65, y: 50 },
        }));
      }, 1200);

      // Phase 3: Show connection line
      setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          phase: 'connecting',
          showConnection: true,
        }));
      }, 2200);

      // Phase 4: Complete connection (turn green)
      setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          phase: 'connected',
          connectionComplete: true,
        }));
      }, 3200);

      // Phase 5: Reset
      setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          phase: 'resetting',
          leftIconPosition: { x: 8, y: prev.leftStartY },
          rightIconPosition: { x: 92, y: prev.rightStartY },
          showConnection: false,
          connectionComplete: false,
        }));
      }, 4200);

      // Phase 6: Return to idle and restart
      setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          phase: 'idle',
        }));
      }, 4700);
    };

    const interval = setInterval(runAnimation, 5000);
    runAnimation(); // Start immediately

    return () => clearInterval(interval);
  }, []);

  // Trigger progressive line drawing when entering the "connecting" phase
  useEffect(() => {
    if (animationState.phase === 'connecting') {
      // Reset line to hidden state first
      setLineDrawn(false);
      // Use double requestAnimationFrame to ensure DOM updates before drawing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLineDrawn(true);
        });
      });
    } else if (animationState.phase === 'resetting' || animationState.phase === 'idle') {
      setLineDrawn(false);
    }
  }, [animationState.phase]);

  const LeftIcon = financeIcons[animationState.leftIconIndex].icon;
  const RightIcon = realEstateIcons[animationState.rightIconIndex].icon;

  // Calculate actual pixel positions for the line
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = React.useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dynamicHeight = window.innerHeight - rect.top; // remaining viewport height
        setContainerDimensions({ width: rect.width, height: dynamicHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Icon boundary size scaled with container height (min 60, max 120)
  const iconBoundarySize = Math.min(120, Math.max(60, containerDimensions.height / 4));
  const iconSize = iconBoundarySize - 64; // smaller relative to boundary
  const staticIconSize = Math.min(40, Math.max(24, iconBoundarySize / 3));

  // Pixel positions for icons based on percentage coordinates and container size
  const leftIconPixelPos = {
    x: (animationState.leftIconPosition.x / 100) * containerDimensions.width,
    y: (animationState.leftIconPosition.y / 100) * containerDimensions.height,
  };

  const rightIconPixelPos = {
    x: (animationState.rightIconPosition.x / 100) * containerDimensions.width,
    y: (animationState.rightIconPosition.y / 100) * containerDimensions.height,
  };

  // Calculate connection points at the edges of icon boundaries
  const calculateConnectionPoints = () => {
    const centerToCenter = {
      x: rightIconPixelPos.x - leftIconPixelPos.x,
      y: rightIconPixelPos.y - leftIconPixelPos.y
    };
    
    const distance = Math.sqrt(centerToCenter.x * centerToCenter.x + centerToCenter.y * centerToCenter.y);
    
    if (distance === 0) return { start: leftIconPixelPos, end: rightIconPixelPos };
    
    // Normalize the direction vector
    const direction = {
      x: centerToCenter.x / distance,
      y: centerToCenter.y / distance
    };
    
    // Calculate connection points at boundary edges
    const startPoint = {
      x: leftIconPixelPos.x + direction.x * (iconBoundarySize / 2),
      y: leftIconPixelPos.y + direction.y * (iconBoundarySize / 2)
    };
    
    const endPoint = {
      x: rightIconPixelPos.x - direction.x * (iconBoundarySize / 2),
      y: rightIconPixelPos.y - direction.y * (iconBoundarySize / 2)
    };
    
    return { start: startPoint, end: endPoint };
  };
  
  const connectionPoints = calculateConnectionPoints();
  
  // Calculate line length for proper animation
  const lineLength = Math.sqrt(
    Math.pow(connectionPoints.end.x - connectionPoints.start.x, 2) + 
    Math.pow(connectionPoints.end.y - connectionPoints.start.y, 2)
  );

  return (
    <div
      ref={containerRef}
      className="w-full mt-8 relative overflow-hidden"
      style={{ height: containerDimensions.height ? `${containerDimensions.height}px` : '16rem' }}
    >
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern
              id="blueprint-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="0.5"
                opacity="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        </svg>
      </div>

      {/* Static Icon Columns */}
      <div className="absolute left-4 top-0 h-full flex flex-col justify-center space-y-4">
        {financeIcons.map((iconData, index) => {
          const IconComponent = iconData.icon;
          return (
            <div
              key={`static-left-${index}`}
              className="text-green-500 opacity-60"
            >
              <IconComponent size={staticIconSize} />
            </div>
          );
        })}
      </div>

      <div className="absolute right-4 top-0 h-full flex flex-col justify-center space-y-4">
        {realEstateIcons.map((iconData, index) => {
          const IconComponent = iconData.icon;
          return (
            <div
              key={`static-right-${index}`}
              className="text-blue-500 opacity-60"
            >
              <IconComponent size={staticIconSize} />
            </div>
          );
        })}
      </div>

      {/* Animated Icons with Boundaries */}
      <div
        className={`absolute transition-all duration-1000 ease-in-out transform -translate-x-1/2 -translate-y-1/2 ${
          animationState.phase === 'connected' ? 'scale-110' : ''
        }`}
        style={{
          left: `${animationState.leftIconPosition.x}%`,
          top: `${animationState.leftIconPosition.y}%`,
          width: `${iconBoundarySize}px`,
          height: `${iconBoundarySize}px`,
        }}
      >
        {/* Icon boundary - visible during connection */}
        <div 
          className={`absolute inset-0 border-2 border-green-400 rounded-lg transition-opacity duration-300 ${
            animationState.showConnection ? 'opacity-30' : 'opacity-0'
          }`}
        />
        <div className="flex items-center justify-center w-full h-full relative z-10 text-green-500">
          <LeftIcon size={iconSize} />
        </div>
      </div>

      <div
         className={`absolute transition-all duration-1000 ease-in-out transform -translate-x-1/2 -translate-y-1/2 ${
           animationState.connectionComplete ? 'scale-110' : ''
         }`}
         style={{
           left: `${animationState.rightIconPosition.x}%`,
           top: `${animationState.rightIconPosition.y}%`,
           width: `${iconBoundarySize}px`,
           height: `${iconBoundarySize}px`,
         }}
       >
         {/* Icon boundary - visible during connection */}
        <div 
          className={`absolute inset-0 border-2 rounded-lg transition-all duration-300 ${
            animationState.showConnection 
              ? (animationState.connectionComplete ? 'border-green-400 opacity-30' : 'border-blue-400 opacity-30')
              : 'opacity-0'
          }`}
        />
        <div className={`flex items-center justify-center w-full h-full relative z-10 transition-colors duration-500 ${
          animationState.connectionComplete ? 'text-green-500' : 'text-blue-500'
        }`}>
          <RightIcon size={iconSize} />
        </div>
      </div>

      {/* Connection Line */}
      {animationState.showConnection && containerDimensions.width > 0 && (
        <svg 
          className="absolute inset-0 pointer-events-none" 
          width={containerDimensions.width} 
          height={containerDimensions.height}
        >
          <line
            x1={connectionPoints.start.x}
            y1={connectionPoints.start.y}
            x2={connectionPoints.end.x}
            y2={connectionPoints.end.y}
            stroke={animationState.connectionComplete ? '#10b981' : '#3b82f6'}
            strokeWidth="3"
            className="transition-colors duration-500"
            style={{
              strokeDasharray: lineLength > 0 ? `${lineLength}` : '1000',
              strokeDashoffset: lineDrawn ? '0' : (lineLength > 0 ? `${lineLength}` : '1000'),
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>
      )}


    </div>
  );
} 