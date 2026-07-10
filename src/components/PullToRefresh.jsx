import React from "react";
import { RefreshCw } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

/**
 * Wraps page content with pull-to-refresh functionality.
 * Shows a spinner indicator that grows as the user pulls down,
 * then animates while the refresh callback is in flight.
 */
export default function PullToRefresh({ onRefresh, children }) {
  const { pullDistance, refreshing } = usePullToRefresh(onRefresh);
  const showIndicator = pullDistance > 0 || refreshing;
  const progress = Math.min(pullDistance / 70, 1);

  return (
    <>
      {showIndicator && (
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{
            height: `${pullDistance}px`,
            transition: refreshing ? "none" : "height 0.2s ease-out",
          }}
        >
          <RefreshCw
            className={`w-5 h-5 text-brand ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: `rotate(${progress * 360}deg)`, opacity: progress }}
          />
        </div>
      )}
      {children}
    </>
  );
}