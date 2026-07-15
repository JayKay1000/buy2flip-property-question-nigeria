import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_LAYOUT_MAX = 1023;

function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_LAYOUT_MAX}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export default function AdaptiveSelect({
  value,
  onValueChange,
  placeholder,
  options,
  className,
  triggerClassName,
}) {
  const isMobile = useIsMobileLayout();
  const [open, setOpen] = useState(false);

  const opts = (options || []).map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("h-11", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {opts.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const selectedLabel = opts.find((o) => o.value === value)?.label;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
          triggerClassName
        )}
      >
        <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[75vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>{placeholder || "Select an option"}</DrawerTitle>
            <DrawerDescription className="sr-only">
              Choose an option from the list below.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-3 pb-6 max-h-[55vh]">
            {opts.map((o) => {
              const selected = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onValueChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-3 rounded-lg text-sm text-left transition-colors active:bg-accent",
                    selected
                      ? "bg-brand/5 text-brand font-medium"
                      : "text-foreground hover:bg-accent/60"
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {selected && <Check className="w-4 h-4 flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}