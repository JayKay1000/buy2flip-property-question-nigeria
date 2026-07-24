import React from "react";
import { Minus, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatNaira } from "@/lib/format";

const STEP = 1000000;

export default function CommitmentAmountSlider({ value, onChange, minimum = 1000000, max = 1000000000 }) {
  const sliderValue = Math.round(value / 1000000);
  const minSlider = Math.round(minimum / 1000000);
  const maxSlider = Math.round(max / 1000000);

  const decrement = () => onChange(Math.max(minimum, value - STEP));
  const increment = () => onChange(Math.min(max, value + STEP));
  const atMin = value <= minimum;
  const atMax = value >= max;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Slide to select commitment amount</span>
        <span className="font-numeric font-bold text-lg text-brand">{formatNaira(value)}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Decrease by one million naira"
          onClick={decrement}
          disabled={atMin}
          className="shrink-0 grid place-items-center w-10 h-10 rounded-full border border-border bg-card text-brand transition-colors hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
        >
          <Minus className="w-5 h-5" />
        </button>
        <Slider
          value={[sliderValue]}
          onValueChange={(vals) => onChange(vals[0] * 1000000)}
          min={minSlider}
          max={maxSlider}
          step={1}
          className="flex-1"
        />
        <button
          type="button"
          aria-label="Increase by one million naira"
          onClick={increment}
          disabled={atMax}
          className="shrink-0 grid place-items-center w-10 h-10 rounded-full border border-border bg-card text-brand transition-colors hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatNaira(minimum)}</span>
        <span>{formatNaira(max)}</span>
      </div>
      <p className="text-xs text-muted-foreground">Multiples of ₦1,000,000 only</p>
    </div>
  );
}