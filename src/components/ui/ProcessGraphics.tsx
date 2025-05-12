// src/components/ui/ProcessGraphics.tsx
'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Users, FileText, BarChart3, Zap, Search, Eye, Link2, CheckSquare, FileJson, BarChartHorizontal, Shuffle, BrainCircuit, Database, FileSpreadsheet } from 'lucide-react';

// Define expanded color palette with opacity variations
const PALETTE = {
  BLUE_PRIMARY: "rgba(59, 130, 246, 1)",
  BLUE_MEDIUM: "rgba(96, 165, 250, 1)",
  BLUE_LIGHT: "rgba(191, 219, 254, 0.8)",
  BLUE_LIGHTER: "rgba(219, 234, 254, 0.4)",
  GREEN_PRIMARY: "rgba(16, 185, 129, 1)",
  GREEN_MEDIUM: "rgba(52, 211, 153, 1)",
  GREEN_LIGHT: "rgba(167, 243, 208, 0.8)",
  GREY_DARK: "rgba(75, 85, 99, 1)", 
  GREY_MEDIUM: "rgba(156, 163, 175, 1)",
  GREY_LIGHT: "rgba(209, 213, 219, 0.6)",
  WHITE_PURE: "rgba(255, 255, 255, 1)",
  WHITE_SOFT: "rgba(255, 255, 255, 0.9)",
  BACKGROUND_GRADIENT_START: "rgba(23, 37, 84, 0.1)", 
  BACKGROUND_GRADIENT_END: "rgba(17, 24, 39, 0.05)",
  GLOW_BLUE: "rgba(59, 130, 246, 0.3)",
  GLOW_GREEN: "rgba(16, 185, 129, 0.25)",
};

// Enhanced variants for smoother animations
const iconContainerVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: (delay = 0) => ({ 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: 'spring', 
      stiffness: 220, 
      damping: 20, 
      delay: delay + 0.2,
      duration: 0.8
    } 
  }),
};

// Animation for pulsing effect on center nodes
const pulsingCircleVariants = {
  pulse: {
    scale: [1, 1.15, 1],
    opacity: [0.7, 0.3, 0.7],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Animation for the initial appearance of the line
const lineAppearDefinition = (i: number = 0) => ({
  pathLength: 1,
  opacity: 1,
  transition: {
    pathLength: { delay: i * 0.1 + 0.4, type: 'spring', duration: 1.2, bounce: 0.1 },
    opacity: { delay: i * 0.1 + 0.4, duration: 0.2 },
  },
});

// Enhanced animation for the continuous flow animation
const lineFlowDefinition = (isReversed = false) => ({
  strokeDasharray: "5 4",
  strokeDashoffset: isReversed ? [-18, 0] : [0, -18],
  opacity: [0.8, 0.6, 0.8],
  transition: {
    strokeDashoffset: {
      duration: 2.5, 
      repeat: Infinity,
      ease: "linear"
    },
    opacity: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
});

// New particle system animation
const particleVariants = {
  animate: (customDelay = 0) => ({
    x: [0, 20, -10, 30, 0],
    y: [0, -15, 10, -20, 0],
    opacity: [0, 0.8, 1, 0.5, 0],
    scale: [0.4, 1, 0.8, 0.6, 0],
    transition: {
      duration: Math.random() * 2 + 3,
      delay: customDelay,
      repeat: Infinity,
      ease: "easeInOut"
    }
  })
};

// Central icon component with enhanced styling and animations
const CentralPlatformIcon: React.FC<{
  IconComponent: React.ElementType, 
  color: string, 
  glowColor: string,
  label?: string, 
  delay?: number
}> = ({IconComponent, color, glowColor, label, delay=0.1}) => (
  <motion.g variants={iconContainerVariants} custom={delay} initial="hidden" animate="visible">
    {/* Outer glow effect */}
    <motion.circle 
      cx="120" cy="85" r="46" 
      fill={glowColor}
      initial={{r:0, opacity:0}} 
      animate={{r:46, opacity:0.15}} 
      transition={{type:'spring', stiffness:120, damping:15, delay: delay}}
    />
    
    {/* Main circle */}
    <motion.circle 
      cx="120" cy="85" r="36" 
      fill={color}
      initial={{r:0, opacity:0}} 
      animate={{r:36, opacity:1}} 
      transition={{type:'spring', stiffness:150, damping:15, delay: delay+0.1}}
    />
    
    {/* Icon */}
    <motion.g 
      transform="translate(102, 67)" 
      initial={{scale:0, opacity:0}} 
      animate={{scale:1, opacity:1}} 
      transition={{delay:delay+0.4, type:'spring'}}
    >
      <IconComponent size={36} color={PALETTE.WHITE_PURE}/>
    </motion.g>
    
    {/* Label */}
    {label && (
      <motion.text 
        x={120} y={85 + 36 + 22} 
        textAnchor="middle" 
        fontSize="13" 
        fontWeight="semibold" 
        className="fill-gray-200"
        initial={{opacity:0, y:85+36+12}} 
        animate={{opacity:1, y:85+36+22}} 
        transition={{delay:delay+0.6}}
      >
        {label}
      </motion.text>
    )}
    
    {/* Pulsing effect */}
    <motion.circle
      cx="120" cy="85" r="36"
      fill="transparent"
      stroke={color}
      strokeWidth="3"
      initial={{ opacity: 0.2 }}
      animate={{ 
        opacity: [0.2, 0.4, 0.2], 
        scale: [1, 1.18, 1] 
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut", 
        delay: delay + 0.5 
      }}
    />
  </motion.g>
);

// Enhanced node icon with improved hover effects
const NodeIcon: React.FC<{
  cx: number, 
  cy: number, 
  IconComponent: React.ElementType, 
  color: string, 
  glowColor: string,
  label?: string, 
  delay?: number
}> = ({cx, cy, IconComponent, color, glowColor, label, delay=0}) => (
  <React.Fragment>
    <motion.g 
      variants={iconContainerVariants} 
      custom={delay} 
      initial="hidden" 
      animate="visible"
      whileHover={{ scale: 1.1 }}
    >
      {/* Soft glow effect */}
      <motion.circle 
        cx={cx} cy={cy} r="26" 
        fill={glowColor}
        initial={{r:0, opacity:0}} 
        animate={{r:26, opacity:0.2}} 
        transition={{type:'spring', stiffness:120, damping:15, delay: delay}}
      />
      
      {/* Main circle */}
      <motion.circle 
        cx={cx} cy={cy} r="20" 
        fill={color} 
        initial={{r:0, opacity:0}} 
        animate={{r:20, opacity:1}} 
        transition={{type:'spring', stiffness:150, damping:15, delay: delay+0.2}}
      />
      
      {/* Icon */}
      <motion.g 
        transform={`translate(${cx - 10}, ${cy - 10})`} 
        initial={{scale:0, opacity:0}} 
        animate={{scale:1, opacity:1}} 
        transition={{delay:delay+0.5, type:'spring'}}
      >
        <IconComponent size={20} color={PALETTE.WHITE_SOFT}/>
      </motion.g>
      
      {/* Pulsing effect */}
      <motion.circle
        cx={cx} cy={cy} r="20"
        fill="transparent"
        stroke={color}
        strokeWidth="2"
        variants={pulsingCircleVariants}
        initial={{ opacity: 0 }}
        animate="pulse"
      />
    </motion.g>
    
    {/* Label */}
    {label && (
      <motion.text 
        x={cx} y={cy + 32} 
        textAnchor="middle" 
        fontSize="11" 
        fontWeight="medium"
        className="fill-gray-300"
        initial={{opacity:0, y:cy+18}} 
        animate={{opacity:1, y:cy+32}} 
        transition={{delay:delay+0.6}}
      >
        {label}
      </motion.text>
    )}
  </React.Fragment>
);

// Enhanced animated line with improved flow effect
const AnimatedLineRevised: React.FC<{
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string, 
  delayIndex: number, 
  isReversed?: boolean
}> = ({x1, y1, x2, y2, color, delayIndex, isReversed = false}) => {
  const controls = useAnimation();

  React.useEffect(() => {
    const sequence = async () => {
      // Start with appear animation
      await controls.start(lineAppearDefinition(delayIndex));
      
      // Then transition to continuous flow animation
      await controls.start(lineFlowDefinition(isReversed));
    };
    
    sequence();
  }, [controls, delayIndex, isReversed]);

  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth="2"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={controls}
    />
  );
};

// Particles component to add dynamic movement
const ParticleEffect: React.FC<{cx: number, cy: number, color: string}> = ({cx, cy, color}) => {
  // Generate random particles
  const particles = Array.from({ length: 5 }, (_, i) => ({
    id: `particle-${cx}-${cy}-${i}`,
    delay: Math.random() * 2,
    size: Math.random() * 2 + 1,
  }));

  return (
    <>
      {particles.map((particle) => (
        <motion.circle
          key={particle.id}
          cx={cx}
          cy={cy}
          r={particle.size}
          fill={color}
          variants={particleVariants}
          custom={particle.delay}
          animate="animate"
        />
      ))}
    </>
  );
};

// Enhanced container with improved sizing and backdrop
const GraphicContainer: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div className="w-full h-full flex items-center justify-center p-2 relative">
    <svg 
      viewBox="0 0 240 180" 
      className="w-full h-full max-h-[450px] md:max-h-[500px] xl:max-h-[550px]" 
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="bgGradProcess" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor={PALETTE.BACKGROUND_GRADIENT_START} />
          <stop offset="100%" stopColor={PALETTE.BACKGROUND_GRADIENT_END} />
        </radialGradient>
        
        {/* Add filters for glow effects */}
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Background with subtle pattern */}
      <rect width="240" height="180" fill="url(#bgGradProcess)" />
      
      {/* Grid lines for visual interest */}
      <g opacity="0.07">
        {Array.from({ length: 12 }).map((_, i) => (
          <line 
            key={`grid-h-${i}`} 
            x1="0" 
            y1={i * 15} 
            x2="240" 
            y2={i * 15} 
            stroke={PALETTE.GREY_LIGHT} 
            strokeWidth="0.5" 
          />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line 
            key={`grid-v-${i}`} 
            x1={i * 15} 
            y1="0" 
            x2={i * 15} 
            y2="180" 
            stroke={PALETTE.GREY_LIGHT} 
            strokeWidth="0.5" 
          />
        ))}
      </g>
      
      {children}
    </svg>
  </div>
);

// LenderMatchingGraphic with improved node placement and animations
const LenderMatchingGraphic: React.FC = () => (
  <GraphicContainer>
    {/* Center Platform */}
    <CentralPlatformIcon 
      IconComponent={BrainCircuit} 
      color={PALETTE.BLUE_PRIMARY} 
      glowColor={PALETTE.GLOW_BLUE}
      label="AI Analysis" 
    />
    
    {/* Particle effects near center for added dynamism */}
    <ParticleEffect cx={130} cy={75} color={PALETTE.BLUE_LIGHT} />
    <ParticleEffect cx={110} cy={95} color={PALETTE.BLUE_LIGHT} />
    
    {/* Surrounding nodes with better spacing */}
    {[
      { cx: 45, cy: 45, IconComponent: Users, label: 'Borrowers', color: PALETTE.GREEN_PRIMARY, glowColor: PALETTE.GLOW_GREEN },
      { cx: 195, cy: 45, IconComponent: Database, label: 'Lender Data', color: PALETTE.BLUE_MEDIUM, glowColor: PALETTE.GLOW_BLUE },
      { cx: 45, cy: 135, IconComponent: FileText, label: 'Projects', color: PALETTE.GREEN_MEDIUM, glowColor: PALETTE.GLOW_GREEN },
      { cx: 195, cy: 135, IconComponent: Shuffle, label: 'Matching Algo', color: PALETTE.GREY_DARK, glowColor: PALETTE.GREY_LIGHT },
      { cx: 120, cy: 25, IconComponent: Zap, label: 'Real-time', color: PALETTE.GREY_MEDIUM, glowColor: PALETTE.GREY_LIGHT },
    ].map((node, index) => (
      <React.Fragment key={`lm-${index}`}>
        <NodeIcon {...node} delay={index * 0.1} />
        <AnimatedLineRevised 
          x1={node.cx} 
          y1={node.cy} 
          x2={120} 
          y2={85} 
          color={index < 2 ? PALETTE.BLUE_LIGHT : PALETTE.GREY_LIGHT} 
          delayIndex={index} 
          isReversed={index % 2 !== 0} 
        />
      </React.Fragment>
    ))}
  </GraphicContainer>
);

// ProjectResumeGraphic with improved layout
const ProjectResumeGraphic: React.FC = () => (
  <GraphicContainer>
    {/* Center Platform */}
    <CentralPlatformIcon 
      IconComponent={Search} 
      color={PALETTE.GREEN_PRIMARY} 
      glowColor={PALETTE.GLOW_GREEN}
      label="Validation Engine"
    />
    
    {/* Particle effects */}
    <ParticleEffect cx={135} cy={75} color={PALETTE.GREEN_LIGHT} />
    <ParticleEffect cx={105} cy={95} color={PALETTE.GREEN_LIGHT} />
    
    {/* Surrounding nodes */}
    {[
      { cx: 40, cy: 40, IconComponent: FileText, label: 'Raw Data', color: PALETTE.GREY_MEDIUM, glowColor: PALETTE.GREY_LIGHT },
      { cx: 200, cy: 40, IconComponent: CheckSquare, label: 'Validation', color: PALETTE.BLUE_PRIMARY, glowColor: PALETTE.GLOW_BLUE },
      { cx: 40, cy: 130, IconComponent: FileJson, label: 'Parsed Docs', color: PALETTE.GREY_MEDIUM, glowColor: PALETTE.GREY_LIGHT },
      { cx: 200, cy: 130, IconComponent: BarChart3, label: 'Completeness', color: PALETTE.BLUE_MEDIUM, glowColor: PALETTE.GLOW_BLUE },
    ].map((node, index) => (
      <React.Fragment key={`pr-${index}`}>
        <NodeIcon {...node} delay={index * 0.1} />
        <AnimatedLineRevised 
          x1={node.cx} 
          y1={node.cy} 
          x2={120} 
          y2={85} 
          color={index % 2 ? PALETTE.BLUE_LIGHT : PALETTE.GREEN_LIGHT} 
          delayIndex={index} 
          isReversed={index % 2 !== 0} 
        />
      </React.Fragment>
    ))}
  </GraphicContainer>
);

// OfferingMemorandumGraphic with improved node placement
const OfferingMemorandumGraphic: React.FC = () => (
  <GraphicContainer>
    {/* Center Platform */}
    <CentralPlatformIcon 
      IconComponent={FileSpreadsheet} 
      color={PALETTE.BLUE_MEDIUM} 
      glowColor={PALETTE.GLOW_BLUE}
      label="OM Generator"
    />
    
    {/* Particle effects */}
    <ParticleEffect cx={140} cy={85} color={PALETTE.BLUE_LIGHT} />
    <ParticleEffect cx={100} cy={85} color={PALETTE.BLUE_LIGHT} />
    
    {/* Surrounding nodes */}
    {[
      { cx: 45, cy: 30, IconComponent: FileText, label: 'Project Data', color: PALETTE.GREY_DARK, glowColor: PALETTE.GREY_LIGHT },
      { cx: 195, cy: 30, IconComponent: Users, label: 'Sponsor Info', color: PALETTE.GREY_MEDIUM, glowColor: PALETTE.GREY_LIGHT },
      { cx: 45, cy: 140, IconComponent: BarChartHorizontal, label: 'Financials', color: PALETTE.BLUE_PRIMARY, glowColor: PALETTE.GLOW_BLUE },
      { cx: 195, cy: 140, IconComponent: Eye, label: 'Market Data', color: PALETTE.GREEN_PRIMARY, glowColor: PALETTE.GLOW_GREEN },
      { cx: 120, cy: 20, IconComponent: Link2, label: 'Live OM Link', color: PALETTE.GREEN_MEDIUM, glowColor: PALETTE.GLOW_GREEN },
    ].map((node, index) => (
      <React.Fragment key={`om-${index}`}>
        <NodeIcon {...node} delay={index * 0.1} />
        <AnimatedLineRevised 
          x1={node.cx} 
          y1={node.cy} 
          x2={120} 
          y2={85} 
          color={index < 2 ? PALETTE.GREY_LIGHT : (index >= 2 && index < 4) ? PALETTE.BLUE_LIGHT : PALETTE.GREEN_LIGHT} 
          delayIndex={index} 
          isReversed={index % 2 !== 0} 
        />
      </React.Fragment>
    ))}
  </GraphicContainer>
);

// Main component with improved transition animations
export const ProcessGraphics: React.FC<{activeIndex: number}> = ({ activeIndex }) => {
  const graphics = [
    <LenderMatchingGraphic key="graphic-lender-matching" />,
    <ProjectResumeGraphic key="graphic-project-resume" />,
    <OfferingMemorandumGraphic key="graphic-om" />,
  ];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex} 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full h-full"
        >
          {graphics[activeIndex] ? graphics[activeIndex] : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};