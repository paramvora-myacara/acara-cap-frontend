// src/components/ui/ProcessGraphics.tsx
'use client';

import React from 'react'; // Removed useEffect from here, useAnimation controls this.
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Users, FileText, BarChart3, Zap, Search, Eye, Link2, CheckSquare, FileJson, BarChartHorizontal, Shuffle, BrainCircuit, Database, FileSpreadsheet } from 'lucide-react';

// Define color palette
const PALETTE = {
  BLUE_PRIMARY: "rgba(59, 130, 246, 1)",
  BLUE_MEDIUM: "rgba(96, 165, 250, 1)",
  BLUE_LIGHT: "rgba(191, 219, 254, 1)",
  GREEN_PRIMARY: "rgba(16, 185, 129, 1)",
  GREEN_MEDIUM: "rgba(52, 211, 153, 1)",
  GREY_DARK: "rgba(75, 85, 99, 1)", 
  GREY_MEDIUM: "rgba(156, 163, 175, 1)",
  GREY_LIGHT: "rgba(209, 213, 219, 1)",
  WHITE_PURE: "rgba(255, 255, 255, 1)",
  BACKGROUND_GRADIENT_START: "rgba(23, 37, 84, 0.1)", 
  BACKGROUND_GRADIENT_END: "rgba(17, 24, 39, 0.05)",
};

const iconContainerVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: (delay = 0) => ({ 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 18, delay: delay + 0.2 } 
  }),
};

// Variant for the initial appearance of the line
const lineAppearDefinition = (i: number = 0) => ({
  pathLength: 1,
  opacity: 1,
  transition: {
    pathLength: { delay: i * 0.1 + 0.4, type: 'spring', duration: 1.2, bounce: 0.1 },
    opacity: { delay: i * 0.1 + 0.4, duration: 0.2 },
  },
});

// Variant for the continuous flow animation
const lineFlowDefinition = (isReversed = false) => ({
  strokeDasharray: "4 4",
  strokeDashoffset: isReversed ? [-8, 0] : [0, -8],
  transition: {
    strokeDashoffset: {
      duration: 1.2, 
      repeat: Infinity,
      ease: "linear"
    }
  }
});


const CentralPlatformIcon: React.FC<{IconComponent: React.ElementType, color: string, label?: string, delay?: number}> = ({IconComponent, color, label, delay=0.1}) => (
  <motion.g variants={iconContainerVariants} custom={delay} initial="hidden" animate="visible">
    <motion.circle 
        cx="120" cy="85" r="30" 
        fill={color}
        initial={{r:0, opacity:0}} animate={{r:30, opacity:1}} transition={{type:'spring', stiffness:150, damping:15, delay: delay+0.1}}
    />
    <motion.g 
        transform="translate(104, 69)" 
        initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:delay+0.4, type:'spring'}}
    >
        <IconComponent size={32} color={PALETTE.WHITE_PURE}/>
    </motion.g>
    {label && (
      <motion.text x={120} y={85 + 30 + 18} textAnchor="middle" fontSize="11" fontWeight="bold" 
          className="fill-gray-200"
          initial={{opacity:0, y:85+30+8}} animate={{opacity:1, y:85+30+18}} transition={{delay:delay+0.6}}
      >
        {label}
      </motion.text>
    )}
    <motion.circle
        cx="120" cy="85" r="30"
        fill="transparent"
        stroke={color}
        strokeWidth="3"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: [0, 0.35, 0], scale: [1, 1.18, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 }}
    />
  </motion.g>
);

const NodeIcon: React.FC<{cx:number, cy:number, IconComponent: React.ElementType, color:string, label?:string, delay?:number}> = ({cx,cy,IconComponent,color,label,delay=0}) => (
    <React.Fragment>
        <motion.g variants={iconContainerVariants} custom={delay} initial="hidden" animate="visible">
            <motion.circle 
                cx={cx} cy={cy} r="18" 
                fill={color} 
                initial={{r:0, opacity:0}} animate={{r:18, opacity:1}} transition={{type:'spring', stiffness:150, damping:15, delay: delay+0.2}}
            />
            <motion.g 
                transform={`translate(${cx - 9}, ${cy - 9})`} 
                initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:delay+0.5, type:'spring'}}
            >
                <IconComponent size={18} color={PALETTE.WHITE_PURE}/>
            </motion.g>
            <motion.circle
                cx={cx} cy={cy} r="18"
                fill="transparent"
                stroke={color}
                strokeWidth="2"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 0.3, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: delay + Math.random() }}
            />
        </motion.g>
        {label && (
            <motion.text x={cx} y={cy + 28} textAnchor="middle" fontSize="9" 
                className="fill-gray-300"
                initial={{opacity:0, y:cy+18}} animate={{opacity:1, y:cy+28}} transition={{delay:delay+0.6}}
            >
              {label}
            </motion.text>
          )}
    </React.Fragment>
);

const AnimatedLineRevised: React.FC<{x1:number,y1:number,x2:number,y2:number,color:string, delayIndex:number, isReversed?: boolean}> = ({x1,y1,x2,y2,color,delayIndex, isReversed = false}) => {
    const controls = useAnimation();

    React.useEffect(() => {
        controls.start(lineAppearDefinition(delayIndex)); // Start appear animation
        
        // Calculate when the appear animation should roughly finish
        const appearDuration = (lineAppearDefinition(delayIndex).transition.pathLength.duration || 1.2) * 1000; // in ms
        const appearDelay = (lineAppearDefinition(delayIndex).transition.pathLength.delay || 0) * 1000; // in ms
        const totalAppearTime = appearDelay + appearDuration;

        const timer = setTimeout(() => {
            controls.start(lineFlowDefinition(isReversed)); // Start flow animation
        }, totalAppearTime + 50); // Add a small buffer (50ms)

        return () => clearTimeout(timer); // Cleanup timer
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

const GraphicContainer: React.FC<{children: React.ReactNode}> = ({children}) => (
    <div className="w-full h-full flex items-center justify-center p-1 relative">
        <svg viewBox="0 0 240 170" className="w-full h-full max-h-[400px] md:max-h-[450px]" preserveAspectRatio="xMidYMid meet">
            <defs>
                <radialGradient id="bgGradProcess" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor={PALETTE.BACKGROUND_GRADIENT_START} />
                    <stop offset="100%" stopColor={PALETTE.BACKGROUND_GRADIENT_END} />
                </radialGradient>
            </defs>
            <rect width="240" height="170" fill="url(#bgGradProcess)" />
            {children}
        </svg>
    </div>
);

const LenderMatchingGraphic: React.FC = () => (
  <GraphicContainer>
      <CentralPlatformIcon IconComponent={BrainCircuit} color={PALETTE.BLUE_PRIMARY} label="AI Analysis" />
      {[
        { cx: 45, cy: 35, IconComponent: Users, label: 'Borrowers', color: PALETTE.GREEN_PRIMARY },
        { cx: 195, cy: 35, IconComponent: Database, label: 'Lender Data', color: PALETTE.BLUE_MEDIUM },
        { cx: 45, cy: 135, IconComponent: FileText, label: 'Projects', color: PALETTE.GREEN_MEDIUM },
        { cx: 195, cy: 135, IconComponent: Shuffle, label: 'Matching Algo', color: PALETTE.GREY_DARK },
        { cx: 120, cy: 20, IconComponent: Zap, label: 'Real-time', color: PALETTE.GREY_MEDIUM },
      ].map((node, index) => (
        <React.Fragment key={`lm-${index}`}>
          <NodeIcon {...node} delay={index * 0.08} />
          <AnimatedLineRevised x1={node.cx} y1={node.cy} x2={120} y2={85} color={PALETTE.GREY_LIGHT} delayIndex={index} isReversed={index % 2 !== 0} />
        </React.Fragment>
      ))}
  </GraphicContainer>
);

const ProjectResumeGraphic: React.FC = () => (
  <GraphicContainer>
      <CentralPlatformIcon IconComponent={Search} color={PALETTE.GREEN_PRIMARY} label="Validation Engine"/>
      {[
        { cx: 40, cy: 40, IconComponent: FileText, label: 'Raw Data', color: PALETTE.GREY_MEDIUM },
        { cx: 200, cy: 40, IconComponent: CheckSquare, label: 'Validation', color: PALETTE.BLUE_PRIMARY },
        { cx: 40, cy: 130, IconComponent: FileJson, label: 'Parsed Docs', color: PALETTE.GREY_LIGHT },
        { cx: 200, cy: 130, IconComponent: BarChart3, label: 'Completeness', color: PALETTE.BLUE_MEDIUM },
      ].map((node, index) => (
        <React.Fragment key={`pr-${index}`}>
          <NodeIcon {...node} delay={index * 0.08} />
          <AnimatedLineRevised x1={node.cx} y1={node.cy} x2={120} y2={85} color={PALETTE.GREY_LIGHT} delayIndex={index} isReversed={index % 2 !== 0} />
        </React.Fragment>
      ))}
  </GraphicContainer>
);

const OfferingMemorandumGraphic: React.FC = () => (
  <GraphicContainer>
      <CentralPlatformIcon IconComponent={FileSpreadsheet} color={PALETTE.BLUE_MEDIUM} label="OM Generator"/>
      {[
        { cx: 45, cy: 25, IconComponent: FileText, label: 'Project Data', color: PALETTE.GREY_DARK },
        { cx: 195, cy: 25, IconComponent: Users, label: 'Sponsor Info', color: PALETTE.GREY_MEDIUM },
        { cx: 45, cy: 145, IconComponent: BarChartHorizontal, label: 'Financials', color: PALETTE.BLUE_PRIMARY },
        { cx: 195, cy: 145, IconComponent: Eye, label: 'Market Data', color: PALETTE.GREEN_PRIMARY },
        { cx: 120, cy: 20, IconComponent: Link2, label: 'Live OM Link', color: PALETTE.GREEN_MEDIUM },
      ].map((node, index) => (
        <React.Fragment key={`om-${index}`}>
          <NodeIcon {...node} delay={index * 0.08} />
          <AnimatedLineRevised x1={node.cx} y1={node.cy} x2={120} y2={85} color={PALETTE.GREY_LIGHT} delayIndex={index} isReversed={index % 2 !== 0} />
        </React.Fragment>
      ))}
  </GraphicContainer>
);


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
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full h-full"
        >
          {graphics[activeIndex] ? graphics[activeIndex] : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};