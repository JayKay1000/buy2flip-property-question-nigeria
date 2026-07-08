import React from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format";

export default function CommitmentAmountSlider({ value, onChange, minimum = 1000000 }) {
  const sliderValue = Math.round(value / 1000000);
  const minSlider = Math.round(minimum / 1000000);
  const maxSlider = 1000;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Slide to select commitment amount</span>
        <span className="font-numeric font-bold text-lg text-brand">{formatNaira(value)}</span>
      </div>
      <Slider
        value={[Math.min(sliderValue, maxSlider)]}
        onValueChange={(vals) => onChange(vals[0] * 1000000)}
        min={minSlider}
        max={maxSlider}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatNaira(minimum)}</span>
        <span>₦1B+</span>
      </div>
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Or enter a custom amount (multiples of ₦1,000,000)</span>
        <Input
          type="number"
          placeholder="1000000"
          value={value || ""}
          onChange={(e) => onChange(Math.round(parseFloat(e.target.value) || 0))}
          className="h-11"
          min={minimum}
          step={1000000}
        />
      </div>
      <p className="text-xs text-muted-foreground">No maximum — enter any amount in multiples of ₦1,000,000</p>
    </div>
  );
}