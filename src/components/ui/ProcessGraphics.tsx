// src/components/ui/ProcessGraphics.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, BarChart3, Zap, Search, Eye, Link2, CheckSquare, FileJson, BarChartHorizontal, Shuffle, BrainCircuit, Database, FileSpreadsheet } from 'lucide-react';

interface ProcessGraphicProps {
  activeIndex: number;
}

// Define color palette
const PALETTE = {
  BLUE_PRIMARY: "rgba(59, 130, 246, 1)",    // Stronger primary blue
  BLUE_MEDIUM: "rgba(96, 165, 250, 1)",   // Medium blue for accents
  BLUE_LIGHT: "rgba(191, 219, 254, 1)",  // Light blue for subtle elements
  GREEN_PRIMARY: "rgba(16, 185, 129, 1)",  // Stronger primary green
  GREEN_MEDIUM: "rgba(52, 211, 153, 1)",  // Medium green
  GREY_DARK: "rgba(107, 114, 128, 1)",    // Darker grey for text/nodes
  GREY_MEDIUM: "rgba(156, 163, 175, 1)",  // Medium grey
  GREY_LIGHT: "rgba(209, 213, 219, 1)",   // Light grey for lines/backgrounds
  WHITE_PURE: "rgba(255, 255, 255, 1)",
  WHITE_OFF: "rgba(243, 244, 246, 1)",    // Off-white
  BACKGROUND_GRADIENT_START: "rgba(23, 37, 84, 0.1)", // Dark blue, subtle for background
  BACKGROUND_GRADIENT_END: "rgba(17, 24, 39, 0.05)",   // Even darker blue, subtle
};

const iconContainerVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  visible: (delay = 0) => ({ 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 18, delay: delay + 0.2 } 
  }),
};

const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay: i * 0.1 + 0.4, type: 'spring', duration: 1.5, bounce: 0.1 },
      opacity: { delay: i * 0.1 + 0.4, duration: 0.3 },
    },
  }),
  flow: (isReversed = false) => ({
    strokeDasharray: "4 4", 
    strokeDashoffset: isReversed ? [-8, 0] : [0, -8], 
    transition: {
      strokeDashoffset: {
        duration: 1.5, 
        repeat: Infinity,
        ease: "linear"
      }
    }
  })
};

const CentralPlatformIcon: React.FC<{IconComponent: React.ElementType, color: string, baseColor?: string, delay?: number}> = ({IconComponent, color, baseColor = PALETTE.GREY_MEDIUM, delay=0.1}) => (
  <motion.g variants={iconContainerVariants} custom={delay} initial="hidden" animate="visible">
    <motion.circle 
        cx="100" cy="75" r="28" 
        fill={baseColor} stroke={color} strokeWidth="2.5"
        initial={{r:0, opacity:0}} animate={{r:28, opacity:1}} transition={{type:'spring', stiffness:150, damping:15, delay: delay+0.1}}
    />
    <motion.g 
        transform="translate(84, 59)" // Centered 32x32 icon
        initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:delay+0.4, type:'spring'}}
    >
        <IconComponent size={32} color={PALETTE.WHITE_PURE}/>
    </motion.g>
    {/* Pulsating outer glow */}
    <motion.circle
        cx="100" cy="75" r="28"
        fill="transparent"
        stroke={color}
        strokeWidth="3"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: [0, 0.4, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 }}
    />
  </motion.g>
);

const NodeIcon: React.FC<{cx:number, cy:number, IconComponent: React.ElementType, color:string, baseColor?:string, label?:string, delay?:number}> = ({cx,cy,IconComponent,color, baseColor = PALETTE.GREY_DARK, label,delay=0}) => (
    <React.Fragment>
        <motion.g variants={iconContainerVariants} custom={delay} initial="hidden" animate="visible">
            <motion.circle 
                cx={cx} cy={cy} r="20" 
                fill={baseColor} opacity="0.9" stroke={color} strokeWidth="2"
                initial={{r:0, opacity:0}} animate={{r:20, opacity:0.9}} transition={{type:'spring', stiffness:150, damping:15, delay: delay+0.2}}
            />
            <motion.g 
                transform={`translate(${cx - 13}, ${cy - 13})`} // Centered 26x26 icon
                initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}} transition={{delay:delay+0.5, type:'spring'}}
            >
                <IconComponent size={26} color={PALETTE.WHITE_PURE}/>
            </motion.g>
            {/* Pulsating effect on node */}
            <motion.circle
                cx={cx} cy={cy} r="20"
                fill="transparent"
                stroke={color}
                strokeWidth="2.5"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 0.3, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: delay + Math.random() }} // Randomize delay for variety
            />
        </motion.g>
        {label && (
            <motion.text x={cx} y={cy + 32} textAnchor="middle" fontSize="10" 
                className="fill-gray-300"
                initial={{opacity:0, y:cy+22}} animate={{opacity:1, y:cy+32}} transition={{delay:delay+0.6}}
            >
              {label}
            </motion.text>
          )}
    </React.Fragment>
);

const AnimatedLine: React.FC<{x1:number,y1:number,x2:number,y2:number,color:string, delayIndex:number, isReversed?: boolean}> = ({x1,y1,x2,y2,color,delayIndex, isReversed = false}) => {
  const combinedVariants = {
    ...lineVariants.visible(delayIndex),
    ...lineVariants.flow(isReversed)
  };

  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth="2.5"
      initial="hidden"
      animate={combinedVariants}
    />
  );
};

const GraphicContainer: React.FC<{children: React.ReactNode}> = ({children}) => (
    <div className="w-full h-full flex items-center justify-center p-1 relative">
        <svg viewBox="0 0 200 150" className="w-full h-full max-h-[400px] md:max-h-[450px]" preserveAspectRatio="xMidYMid meet"> {/* Added max-h */}
            {/* Subtle background gradient for depth */}
            <defs>
                <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor={PALETTE.BACKGROUND_GRADIENT_START} />
                    <stop offset="100%" stopColor={PALETTE.BACKGROUND_GRADIENT_END} />
                </radialGradient>
            </defs>
            <rect width="200" height="150" fill="url(#bgGrad)" />
            {children}
        </svg>
    </div>
);

const LenderMatchingGraphic: React.FC = () => (
  <GraphicContainer>
      <CentralPlatformIcon IconComponent={Search} color={PALETTE.BLUE_PRIMARY} baseColor={PALETTE.BLUE_MEDIUM}/>
      {[
        { cx: 30, cy: 20, IconComponent: Users, label: 'Borrowers', color: PALETTE.GREEN_PRIMARY, baseColor: PALETTE.GREEN_MEDIUM },
        { cx: 170, cy: 20, IconComponent: Database, label: 'Lender Data', color: PALETTE.BLUE_LIGHT, baseColor: PALETTE.GREY_DARK },
        { cx: 30, cy: 130, IconComponent: FileText, label: 'Projects', color: PALETTE.GREEN_MEDIUM, baseColor: PALETTE.GREY_DARK },
        { cx: 170, cy: 130, IconComponent: Shuffle, label: 'AI Match', color: PALETTE.WHITE_PURE, baseColor: PALETTE.GREY_MEDIUM },
        { cx: 100, cy: 0, IconComponent: Zap, label: 'Analysis', color: PALETTE.GREY_LIGHT, baseColor: PALETTE.GREY_DARK },
      ].map((node, index) => (
        <React.Fragment key={`lm-${index}`}>
          <NodeIcon {...node} delay={index * 0.06} />
          <AnimatedLine x1={node.cx} y1={node.cy} x2={100} y2={75} color={PALETTE.BLUE_PRIMARY} delayIndex={index} isReversed={index % 2 !== 0} />
        </React.Fragment>
      ))}
  </GraphicContainer>
);

const ProjectResumeGraphic: React.FC = () => (
  <GraphicContainer>
      <CentralPlatformIcon IconComponent={BrainCircuit} color={PALETTE.GREEN_PRIMARY} baseColor={PALETTE.GREEN_MEDIUM} />
      {[
        { x: 25, y: 25, IconComponent: FileText, label: 'Raw Data', color: PALETTE.GREY_MEDIUM, baseColor: PALETTE.GREY_DARK },
        { x: 175, y: 25, IconComponent: CheckSquare, label: 'Validated', color: PALETTE.BLUE_PRIMARY, baseColor: PALETTE.BLUE_MEDIUM },
        { x: 25, y: 125, IconComponent: FileJson, label: 'Parsed Docs', color: PALETTE.GREY_LIGHT, baseColor: PALETTE.GREY_DARK },
        { x: 175, y: 125, IconComponent: BarChart3, label: 'Completeness', color: PALETTE.BLUE_MEDIUM, baseColor: PALETTE.BLUE_LIGHT },
      ].map((node, index) => (
        <React.Fragment key={`pr-${index}`}>
          <NodeIcon cx={node.x} cy={node.y} {...node} delay={index * 0.06} />
          <AnimatedLine x1={node.x} y1={node.y} x2={100} y2={75} color={PALETTE.GREEN_PRIMARY} delayIndex={index} isReversed={index % 2 !== 0} />
        </React.Fragment>
      ))}
  </GraphicContainer>
);

const OfferingMemorandumGraphic: React.FC = () => (
  <GraphicContainer>
      <CentralPlatformIcon IconComponent={FileSpreadsheet} color={PALETTE.WHITE_PURE} baseColor={PALETTE.GREY_MEDIUM} />
      {[
        { x: 30, y: 10, IconComponent: FileText, label: 'Project Data', color: PALETTE.GREY_DARK, baseColor: PALETTE.GREY_LIGHT },
        { x: 170, y: 10, IconComponent: Users, label: 'Sponsor Info', color: PALETTE.GREY_MEDIUM, baseColor: PALETTE.GREY_DARK },
        { x: 30, y: 140, IconComponent: BarChartHorizontal, label: 'Financials', color: PALETTE.BLUE_PRIMARY, baseColor: PALETTE.BLUE_MEDIUM },
        { x: 170, y: 140, IconComponent: Eye, label: 'Market Data', color: PALETTE.BLUE_MEDIUM, baseColor: PALETTE.BLUE_LIGHT },
        { x: 100, y: -10, IconComponent: Link2, label: 'Live OM Link', color: PALETTE.GREEN_PRIMARY, baseColor: PALETTE.GREEN_MEDIUM },
      ].map((node, index) => (
        <React.Fragment key={`om-${index}`}>
          <NodeIcon 
            cx={node.x} 
            cy={node.y} 
            IconComponent={node.IconComponent} 
            color={node.color} 
            baseColor={node.baseColor} 
            label={node.label} 
            delay={index * 0.06} 
          />
          <AnimatedLine 
            x1={node.x} 
            y1={node.y} 
            x2={100} 
            y2={75} 
            color={PALETTE.GREY_LIGHT} 
            delayIndex={index} 
            isReversed={index % 2 !== 0} 
          />
        </React.Fragment>
      ))}
  </GraphicContainer>
);


export const ProcessGraphics: React.FC<ProcessGraphicProps> = ({ activeIndex }) => {
  const graphics = [
    <LenderMatchingGraphic key="graphic-lender-matching" />,
    <ProjectResumeGraphic key="graphic-project-resume" />,
    <OfferingMemorandumGraphic key="graphic-om" />,
  ];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      {graphics[activeIndex] ? graphics[activeIndex] : null}
    </div>
  );
};