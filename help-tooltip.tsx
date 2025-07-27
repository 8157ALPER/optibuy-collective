import { HelpCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HelpTooltipProps {
  content: string;
  title?: string;
  variant?: "info" | "help";
  side?: "top" | "bottom" | "left" | "right";
}

export function HelpTooltip({ 
  content, 
  title, 
  variant = "help",
  side = "top" 
}: HelpTooltipProps) {
  const Icon = variant === "info" ? Info : HelpCircle;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-4 h-4 ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {title && (
            <div className="font-semibold text-sm mb-1">{title}</div>
          )}
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface FormFieldWithHelpProps {
  label: string;
  helpContent: string;
  helpTitle?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormFieldWithHelp({ 
  label, 
  helpContent, 
  helpTitle, 
  children, 
  required 
}: FormFieldWithHelpProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <HelpTooltip 
          content={helpContent} 
          title={helpTitle}
        />
      </div>
      {children}
    </div>
  );
}
