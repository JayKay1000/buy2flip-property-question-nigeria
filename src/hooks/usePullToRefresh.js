import { useState, useEffect, useRef } from "react";

/**
 * Pull-to-refresh hook for touch devices (Android WebView compatible).
 * Attaches passive touch listeners to the window and invokes `onRefresh`
 * when the user pulls down past `threshold` while scrolled to the top.
 *
 * @param {() => Promise<void>} onRefresh  Async callback invoked on refresh
 * @param {{ threshold?: number, maxPull?: number }} opts
 * @returns {{ pullDistance: number, refreshing: boolean }}
 */
export function usePullToRefresh(onRefresh, { threshold = 70, maxPull = 120 } = {}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const startY = useRef(0);
  const pulling = useRef(false);
  const currentPull = useRef(0);
  const refreshFn = useRef(onRefresh);
  const isRefreshing = useRef(false);

  useEffect(() => {
    refreshFn.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    isRefreshing.current = refreshing;
  }, [refreshing]);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY <= 0 && !isRefreshing.current) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
        currentPull.current = 0;
      } else {
        pulling.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling.current || isRefreshing.current) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 0 && window.scrollY <= 0) {
        const distance = Math.min(diff * 0.5, maxPull);
        currentPull.current = distance;
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (currentPull.current >= threshold) {
        setRefreshing(true);
        setPullDistance(threshold);
        try {
          await refreshFn.current();
        } finally {
          setRefreshing(false);
          setPullDistance(0);
          currentPull.current = 0;
        }
      } else {
        setPullDistance(0);
        currentPull.current = 0;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [threshold, maxPull]);

  return { pullDistance, refreshing };
}