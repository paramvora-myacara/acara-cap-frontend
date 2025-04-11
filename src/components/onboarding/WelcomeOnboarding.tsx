// src/components/onboarding/WelcomeOnboarding.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { X, ChevronRight, ChevronLeft, Building, Users, FileText, CheckCircle } from 'lucide-react';

interface WelcomeOnboardingProps {
  onComplete: () => void;
}

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Define onboarding steps
  const steps = [
    {
      title: "Welcome to ACARA-Cap",
      description: "Your AI-powered platform to connect with the perfect lenders for your commercial real estate projects.",
      icon: <Building className="h-12 w-12 text-blue-600" />,
    },
    {
      title: "Connect with Capital Advisors",
      description: "Work directly with experienced capital advisors who will help you find the right financing for your project.",
      icon: <Users className="h-12 w-12 text-blue-600" />,
    },
    {
      title: "Submit Your Project",
      description: "Complete your project details to help us match you with lenders that specialize in your property type and financing needs.",
      icon: <FileText className="h-12 w-12 text-blue-600" />,
    },
    {
      title: "Ready to Start",
      description: "We've created your first project to help you get started. Click 'Get Started' to begin your journey.",
      icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    setDismissed(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <button
              onClick={handleComplete}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-6 flex justify-center">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-16 mx-1 rounded-full ${
                    index === step ? 'bg-blue-600' : 
                    index < step ? 'bg-blue-300' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                {steps[step].icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {steps[step].title}
              </h2>
              <p className="text-gray-600">
                {steps[step].description}
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 0}
                leftIcon={<ChevronLeft size={16} />}
              >
                Back
              </Button>
              
              <Button
                variant="primary"
                onClick={nextStep}
                rightIcon={<ChevronRight size={16} />}
              >
                {step === steps.length - 1 ? 'Get Started' : 'Next'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};