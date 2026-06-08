import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const pullDistance = useMotionValue(0);
  
  const opacity = useTransform(pullDistance, [0, 80], [0, 1]);
  const scale = useTransform(pullDistance, [0, 80], [0.5, 1]);
  const rotate = useTransform(pullDistance, [0, 80], [0, 360]);

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      pullDistance.set(Math.min(distance * 0.5, 100));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance.get() >= 80 && !isRefreshing) {
      setIsRefreshing(true);
      animate(pullDistance, 80, { duration: 0.2 });
      
      try {
        await onRefresh();
      } finally {
        animate(pullDistance, 0, { duration: 0.3 });
        setTimeout(() => setIsRefreshing(false), 300);
      }
    } else {
      animate(pullDistance, 0, { duration: 0.3 });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing]);

  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      <motion.div
        style={{ 
          opacity, 
          y: pullDistance,
          position: 'absolute',
          top: 0,
          left: '50%',
          x: '-50%',
          zIndex: 50
        }}
        className="pointer-events-none"
      >
        <motion.div 
          style={{ scale, rotate }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg"
        >
          <Loader2 className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>
      
      <motion.div style={{ y: pullDistance }}>
        {children}
      </motion.div>
    </div>
  );
}