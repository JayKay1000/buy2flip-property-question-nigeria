import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Password input with an inline show/hide eye toggle.
// Optional `leftIcon` renders an icon at the left of the field.
export default function PasswordInput({ className, leftIcon, ...props }) {
  const [visible, setVisible] = useState(false);
  const leftPad = leftIcon ? "pl-10 pr-10" : "pr-10";
  return (
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {leftIcon}
        </span>
      )}
      <Input
        type={visible ? "text" : "password"}
        className={cn(leftPad, className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}