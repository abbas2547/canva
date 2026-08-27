// components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px";
    
    const variants = {
      default: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200/70 hover:shadow-indigo-300/70",
      ghost: "bg-transparent hover:bg-indigo-50 text-slate-700",
      outline: "border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-800 shadow-sm",
      destructive: "bg-red-600 hover:bg-red-700 text-white",
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2",
    };
    
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;