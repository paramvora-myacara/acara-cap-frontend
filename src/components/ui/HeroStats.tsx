// src/components/ui/HeroStats.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Building, CheckCircle, DollarSign } from 'lucide-react';
import { useInView } from 'framer-motion';

interface StatProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
  inView: boolean;
}

const Stat: React.FC<StatProps> = ({ value, label, icon, color, delay = 0, inView }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Number counter animation
  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
      let start = 0;
      const duration = 2000; // 2 seconds
      const step = Math.ceil(value / (duration / 16)); // ~60fps

      const timer = setTimeout(() => {
        let animationFrame: number;
        
        const animate = () => {
          start += step;
          setCount(prev => Math.min(start, value));
          
          if (start < value) {
            animationFrame = requestAnimationFrame(animate);
          }
        };
        
        animationFrame = requestAnimationFrame(animate);
        
        return () => cancelAnimationFrame(animationFrame);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [inView, value, delay, hasAnimated]);

  return (
    <div 
      className={`bg-white shadow-lg rounded-lg p-6 text-center ${color} transform transition-all duration-500`}
      style={{ 
        opacity: inView ? 1 : 0, 
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`
      }}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: `${color}30` }}>
        {icon}
      </div>
      <div className="text-4xl font-bold mb-2">{count.toLocaleString()}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
};

export const HeroStats: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  // Reduce threshold to make it appear earlier when scrolling
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -100px 0px" });
  
  const stats = [
    { 
      value: 500, 
      label: "Lenders", 
      icon: <Building size={30} className="text-blue-600" />, 
      color: "text-blue-600", 
      bgColor: "bg-blue-100",
      delay: 0 
    },
    { 
      value: 1250, 
      label: "Deals Closed", 
      icon: <CheckCircle size={30} className="text-green-600" />, 
      color: "text-green-600",
      bgColor: "bg-green-100",
      delay: 200 
    },
    { 
      value: 5, 
      label: "Billion in Revenue", 
      icon: <DollarSign size={30} className="text-amber-600" />, 
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      delay: 400 
    }
  ];

  return (
    <section className="py-16 bg-gray-50" id="stats" ref={ref}>
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 transition-all duration-500 italic"
           style={{ 
             opacity: isInView ? 1 : 0, 
             transform: isInView ? 'translateY(0)' : 'translateY(20px)'
           }}>
          Our Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <Stat
              key={index}
              value={stat.value}
              label={stat.label}
              icon={stat.icon}
              color={stat.color}
              delay={stat.delay}
              inView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};