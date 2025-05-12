// src/components/ui/ProcessSection.tsx
'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Search, BrainCircuit, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ProcessGraphics } from './ProcessGraphics';

interface ProcessStepData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  graphicIndex: number;
  layout: 'textLeft' | 'textRight';
}

const processStepsContent: ProcessStepData[] = [
  {
    id: 'lender-matching',
    title: 'Intelligent Lender Matching',
    description: "Our AI-powered LenderLine™ instantly connects you with compatible lenders. Utilize our interactive interface to refine criteria and visualize your ideal capital partners in real-time.",
    icon: <Search size={28} className="text-blue-300 group-hover:text-blue-400 transition-colors" />,
    graphicIndex: 0,
    layout: 'textLeft',
  },
  {
    id: 'project-resume',
    title: 'AI-Assisted Project Resume',
    description: "Effortlessly build a comprehensive project and borrower resume. Our AI tools assist with information validation, document parsing, and offer real-time advice to ensure your submission is lender-ready.",
    icon: <BrainCircuit size={28} className="text-blue-300 group-hover:text-blue-400 transition-colors" />,
    graphicIndex: 1,
    layout: 'textRight',
  },
  {
    id: 'offering-memorandum',
    title: 'Live Offering Memorandum',
    description: "Generate a dynamic, professional Offering Memorandum with a single click. This live dashboard, hosted for each project, provides lenders with all necessary information in an accessible format.",
    icon: <FileSpreadsheet size={28} className="text-blue-300 group-hover:text-blue-400 transition-colors" />,
    graphicIndex: 2,
    layout: 'textLeft',
  },
];

const StepComponent: React.FC<{ step: ProcessStepData; index: number }> = ({ step, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: "some", margin: "-20% 0px -20% 0px" }); 

  // Corrected easing function
  const commonTransition = { duration: 0.8, ease: "circOut" }; // Using "circOut" for smooth deceleration

  const textVariants = {
    hidden: { opacity: 0, x: step.layout === 'textLeft' ? -60 : 60, scale:0.95 },
    visible: { opacity: 1, x: 0, scale:1, transition: { ...commonTransition, delay: index * 0.1 } },
  };

  const graphicVariants = {
    hidden: { opacity: 0, scale: 0.85, x: step.layout === 'textLeft' ? 60 : -60 },
    visible: { opacity: 1, scale: 1, x: 0, transition: { ...commonTransition, delay: index * 0.1 + 0.15 } },
  };

  const TextContent = () => (
    <motion.div 
      className={cn(
        "w-full lg:w-2/5 flex flex-col justify-center py-8 lg:py-0",
        step.layout === 'textLeft' ? "lg:pr-10 xl:pr-16" : "lg:pl-10 xl:pl-16" 
      )}
      variants={textVariants}
    >
      <div className="mb-5 inline-flex items-center justify-center p-3 bg-blue-600/25 rounded-full border-2 border-blue-500 w-16 h-16 shadow-lg">
        {step.icon}
      </div>
      <h3 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">{step.title}</h3>
      <p className="text-lg md:text-xl text-gray-300 leading-relaxed">{step.description}</p>
    </motion.div>
  );

  const GraphicContent = () => (
    <motion.div 
      className="w-full lg:w-3/5 h-[26rem] sm:h-[28rem] md:h-[32rem] lg:h-[30rem] xl:h-[34rem]"
      variants={graphicVariants}
    >
      <ProcessGraphics activeIndex={step.graphicIndex} />
    </motion.div>
  );

  return (
    <motion.section 
      ref={ref}
      className={cn(
        "min-h-[65vh] md:min-h-[70vh] py-12 md:py-16 flex items-center container mx-auto px-6 md:px-10", 
      )}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className={cn(
          "flex flex-col lg:gap-12 xl:gap-20 w-full items-center", 
          step.layout === 'textRight' ? "lg:flex-row-reverse" : "lg:flex-row"
        )}
      >
        <TextContent />
        <GraphicContent />
      </div>
    </motion.section>
  );
};


export const ProcessSection: React.FC = () => {
  const sectionRef = useRef(null);
  const titleInView = useInView(sectionRef, { once: true, amount: 0.1 }); 

  return (
    <div ref={sectionRef} id="process-section" className="bg-gray-900 text-gray-100 overflow-x-hidden">
      <motion.div 
        className="text-center pt-16 pb-10 md:pt-24 md:pb-14"
        initial={{ opacity: 0, y: 30 }}
        animate={titleInView ? { opacity: 1, y: 0, transition: {delay: 0.1, duration: 0.6, ease:"easeOut"} } : {}}
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Funding, from <span className="text-blue-400">Months</span> to <span className="text-green-400">Minutes</span>.
        </h2>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
          ACARA-Cap's intelligent platform automates and accelerates every step of your commercial real estate financing.
        </p>
      </motion.div>

      {processStepsContent.map((step, index) => (
        <StepComponent key={step.id} step={step} index={index} />
      ))}
    </div>
  );
};