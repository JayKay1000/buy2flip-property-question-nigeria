import React from "react";
import { Slider } from "@/components/ui/slider";
import { formatNaira } from "@/lib/format";

export default function CommitmentAmountSlider({ value, onChange, minimum = 1000000, max = 1000000000 }) {
  const sliderValue = Math.round(value / 1000000);
  const minSlider = Math.round(minimum / 1000000);
  const maxSlider = Math.round(max / 1000000);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Slide to select commitment amount</span>
        <span className="font-numeric font-bold text-lg text-brand">{formatNaira(value)}</span>
      </div>
      <Slider
        value={[sliderValue]}
        onValueChange={(vals) => onChange(vals[0] * 1000000)}
        min={minSlider}
        max={maxSlider}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatNaira(minimum)}</span>
        <span>{formatNaira(max)}</span>
      </div>
      <p className="text-xs text-muted-foreground">Multiples of ₦1,000,000 only</p>
    </div>
  );
}