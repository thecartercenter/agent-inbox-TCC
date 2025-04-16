import * as React from "react";

/**
 * Custom hook to save and restore scroll position when navigating between views
 * @returns Object containing scroll position and methods to save/restore it
 */
export function useScrollPosition() {
  // Use ref to persist scroll position value between renders
  const scrollPositionRef = React.useRef<number>(0);
  
  // Track which element was scrolled
  const scrollElementRef = React.useRef<'window' | 'element'>('window');
  
  // Debug flag to help with troubleshooting
  const debug = true;

  // Save the current scroll position
  const saveScrollPosition = React.useCallback((element?: HTMLElement | null) => {
    if (typeof window === "undefined") return;
    
    // If element is provided, use its scrollTop, otherwise use window.scrollY
    if (element && element.scrollTop > 0) {
      scrollPositionRef.current = element.scrollTop;
      scrollElementRef.current = 'element';
      
      if (debug) {
        console.log(`Saved element scroll position: ${element.scrollTop}px (ID: ${element.id || 'unknown'})`);
      }
    } else {
      scrollPositionRef.current = window.scrollY;
      scrollElementRef.current = 'window';
      
      if (debug) {
        console.log(`Saved window scroll position: ${window.scrollY}px`);
      }
    }
  }, []);

  // Restore the saved scroll position
  const restoreScrollPosition = React.useCallback((element?: HTMLElement | null) => {
    if (typeof window === "undefined") return;
    
    const position = scrollPositionRef.current;
    const elementType = scrollElementRef.current;
    
    if (debug) {
      console.log(`Attempting to restore scroll position to: ${position}px (type: ${elementType})`);
    }
    
    if (position <= 0) {
      console.log("Warning: Saved scroll position is 0 or negative, skipping restoration");
      return;
    }
    
    // Use requestAnimationFrame to ensure DOM updates have completed
    window.requestAnimationFrame(() => {
      // Try the provided element first
      if (element && elementType === 'element') {
        element.scrollTop = position;
        
        if (debug) {
          console.log(`Set element.scrollTop to ${position}px, actual: ${element.scrollTop}px`);
          
          // If the restoration failed, log a warning
          if (Math.abs(element.scrollTop - position) > 5) {
            console.warn("Scroll restoration didn't work as expected on the element");
          }
        }
      } else {
        // Fall back to window scroll
        window.scrollTo(0, position);
        
        if (debug) {
          console.log(`Set window.scrollTo(0, ${position}), actual: ${window.scrollY}px`);
          
          // If the restoration failed, log a warning
          if (Math.abs(window.scrollY - position) > 5) {
            console.warn("Scroll restoration didn't work as expected on window");
          }
        }
      }
    });
  }, []);

  return {
    scrollPosition: scrollPositionRef.current,
    saveScrollPosition,
    restoreScrollPosition
  };
} 