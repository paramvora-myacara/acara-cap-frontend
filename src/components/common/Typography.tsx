// components/common/Typography.tsx
import React, { ReactNode } from 'react';
import { cn } from '../../../lib/utils'; // Assuming you have utils.ts

type HTMLTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
type TypographyVariant = HTMLTag | 'lead' | 'muted' | 'small';

interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement | HTMLSpanElement> {
  variant?: TypographyVariant;
  className?: string;
  children?: ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'p',
  className,
  children,
  ...props
}) => {
  // Map variants to actual HTML elements
  const getElement = (variant: TypographyVariant): HTMLTag => {
    switch (variant) {
      case 'lead':
      case 'muted':
      case 'small':
        return 'p';
      default:
        return variant;
    }
  };

  const Element = getElement(variant);
  const baseClasses = "text-foreground"; // Default text color

  let variantClasses = "";
  switch (variant) {
    case 'h1':
      variantClasses = "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl";
      break;
    case 'h2':
      variantClasses = "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0";
      break;
    case 'h3':
      variantClasses = "scroll-m-20 text-2xl font-semibold tracking-tight";
      break;
    case 'h4':
      variantClasses = "scroll-m-20 text-xl font-semibold tracking-tight";
      break;
    case 'p':
      variantClasses = "text-sm text-gray-500 dark:text-gray-400";
      break;
    case 'span':
      variantClasses = "text-sm";
      break;
    case 'lead':
      variantClasses = "text-lg text-gray-700 dark:text-gray-300";
      break;
    case 'muted':
      variantClasses = "text-sm text-muted-foreground";
      break;
    case 'small':
      variantClasses = "text-xs text-gray-500 dark:text-gray-400";
      break;
    default:
      variantClasses = "";
  }


  return (
    <Element
      className={cn(baseClasses, variantClasses, className)}
      {...props}
    >
      {children}
    </Element>
  );
};

export default Typography;