// src/components/ui/FormWizard.tsx
import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { Button } from './Button';

export interface Step {
  id: string;
  title: string;
  component: React.ReactNode;
  isOptional?: boolean;
  isCompleted?: boolean;
}

interface FormWizardProps {
  steps: Step[];
  onComplete?: () => void;
  className?: string;
  allowSkip?: boolean;
  showProgressBar?: boolean;
  showStepIndicators?: boolean;
  initialStep?: number;
}

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  onComplete,
  className,
  allowSkip = false,
  showProgressBar = true,
  showStepIndicators = true,
  initialStep = 0,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  
  // Reset completed steps when steps change
  useEffect(() => {
    const initialCompleted: Record<string, boolean> = {};
    steps.forEach(step => {
      if (step.isCompleted) {
        initialCompleted[step.id] = true;
      }
    });
    setCompletedSteps(initialCompleted);
  }, [steps]);
  
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  
  const goNext = () => {
    if (isLastStep) {
      // Mark the current step as completed
      setCompletedSteps(prev => ({ ...prev, [currentStep.id]: true }));
      onComplete?.();
    } else {
      // Mark the current step as completed and go to next step
      setCompletedSteps(prev => ({ ...prev, [currentStep.id]: true }));
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const goPrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const goToStep = (index: number) => {
    // Only allow navigating to completed steps or the next incomplete step
    const previousStepsCompleted = steps.slice(0, index).every(step => 
      step.isOptional || completedSteps[step.id]
    );
    
    if (previousStepsCompleted || allowSkip) {
      setCurrentStepIndex(index);
    }
  };
  
  const progressPercent = Math.round(
    (Object.keys(completedSteps).length / steps.length) * 100
  );
  
  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      {showProgressBar && (
        <div className="mb-6">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-1 text-right text-sm text-gray-500">
            {progressPercent}% complete
          </div>
        </div>
      )}
      
      {/* Step indicators */}
      {showStepIndicators && (
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step circle */}
                <div 
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all",
                    currentStepIndex === index ? "bg-blue-600 text-white" : 
                    completedSteps[step.id] ? "bg-green-100 text-green-600 border border-green-200" : 
                    "bg-gray-100 text-gray-400 border border-gray-200"
                  )}
                  onClick={() => goToStep(index)}
                >
                  {completedSteps[step.id] ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                
                {/* Step title - visible only for current step */}
                <div className={cn(
                  "absolute mt-10 text-sm font-medium transition-all",
                  currentStepIndex === index ? "opacity-100" : "opacity-0"
                )}>
                  {step.title}
                </div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-16 h-1 mx-1",
                    completedSteps[step.id] ? "bg-green-200" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      
      {/* Step content */}
      <div className="mb-6">
        {currentStep.component}
      </div>
      
      {/* Navigation buttons */}
      <div className={cn(
        "flex justify-between mt-8",
        isFirstStep ? "justify-end" : "justify-between"
      )}>
        {!isFirstStep && (
          <Button
            variant="outline"
            leftIcon={<ChevronLeft size={16} />}
            onClick={goPrevious}
          >
            Previous
          </Button>
        )}
        
        <Button
          variant="primary"
          rightIcon={<ChevronRight size={16} />}
          onClick={goNext}
        >
          {isLastStep ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};