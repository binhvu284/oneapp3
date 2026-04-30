import { useState, useEffect, useRef, useCallback } from "react";

export interface SpringConfig {
  /** Spring stiffness (0-1). Lower = slower, smoother. Default: 0.08 */
  stiffness?: number;
  /** Damping factor (0-1). Higher = less oscillation. Default: 0.75 */
  damping?: number;
  /** Mass of the spring. Higher = more inertia. Default: 1 */
  mass?: number;
  /** Precision threshold for stopping animation. Default: 0.001 */
  precision?: number;
}

interface SpringState {
  position: number;
  velocity: number;
}

/**
 * useSpringValue - Animates a value using spring physics
 * 
 * Creates smooth, natural animations that work consistently
 * regardless of scroll speed, inspired by iOS spring animations.
 * 
 * @param target - Target value to animate towards (0 or 1 typically)
 * @param config - Spring configuration parameters
 * @returns Current animated value
 */
export function useSpringValue(
  target: number,
  config: SpringConfig = {}
): number {
  const {
    stiffness = 0.08,
    damping = 0.75,
    mass = 1,
    precision = 0.001,
  } = config;

  const [currentValue, setCurrentValue] = useState(target);
  
  // Use refs to avoid recreating the animation loop
  const stateRef = useRef<SpringState>({
    position: target,
    velocity: 0,
  });
  const targetRef = useRef(target);
  const animationFrameRef = useRef<number>();
  const isAnimatingRef = useRef(false);

  // Spring physics simulation
  const animate = useCallback(() => {
    const state = stateRef.current;
    const targetValue = targetRef.current;
    
    // Calculate spring force: F = -k * displacement
    const displacement = state.position - targetValue;
    const springForce = -stiffness * displacement;
    
    // Apply force to velocity (F = ma, so a = F/m)
    const acceleration = springForce / mass;
    
    // Update velocity with damping
    state.velocity += acceleration;
    state.velocity *= (1 - damping);
    
    // Update position
    state.position += state.velocity;
    
    // Check if we've essentially reached the target
    const isAtRest = 
      Math.abs(state.velocity) < precision && 
      Math.abs(displacement) < precision;
    
    if (isAtRest) {
      // Snap to target and stop animating
      state.position = targetValue;
      state.velocity = 0;
      setCurrentValue(targetValue);
      isAnimatingRef.current = false;
      return;
    }
    
    // Update state and continue animation
    setCurrentValue(state.position);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [stiffness, damping, mass, precision]);

  // Start animation when target changes
  const startAnimation = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  // Handle target changes
  useEffect(() => {
    targetRef.current = target;
    
    // Only start animation if target actually changed
    const currentTarget = stateRef.current.position;
    if (Math.abs(target - currentTarget) > precision) {
      startAnimation();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [target, precision, startAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return currentValue;
}

/**
 * useSpringTransform - Returns both opacity and translateY values
 * Useful for section fade-in with vertical movement
 */
export function useSpringTransform(
  isVisible: boolean,
  config: SpringConfig = {},
  translateDistance: number = 30
): { opacity: number; translateY: number } {
  const opacity = useSpringValue(isVisible ? 1 : 0, config);
  
  return {
    opacity,
    translateY: (1 - opacity) * translateDistance,
  };
}
