import { useRef, useEffect } from "react";
import { animate } from "animejs";

interface MobileNeonPathProps {
  color: string;
  delay: number;
  isTriggered: boolean;
  height?: number;
}

/**
 * MobileNeonPath - SVG vertical neon path with anime.js stroke animation
 * Used in mobile layout for CoreValuesSection
 */
export function MobileNeonPath({ 
  color, 
  delay, 
  isTriggered,
  height = 32
}: MobileNeonPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isTriggered || hasAnimated.current) return;
    if (!pathRef.current || !glowRef.current || !dotRef.current) return;
    
    hasAnimated.current = true;
    
    const pathLength = pathRef.current.getTotalLength();
    
    // Set initial state
    pathRef.current.style.strokeDasharray = `${pathLength}`;
    pathRef.current.style.strokeDashoffset = `${pathLength}`;
    glowRef.current.style.strokeDasharray = `${pathLength}`;
    glowRef.current.style.strokeDashoffset = `${pathLength}`;

    // Animate main path
    animate(pathRef.current, {
      strokeDashoffset: [pathLength, 0],
      duration: 600,
      delay: delay,
      ease: "inOutQuart",
    });

    // Animate glow path (slightly delayed for layered effect)
    animate(glowRef.current, {
      strokeDashoffset: [pathLength, 0],
      duration: 700,
      delay: delay + 100,
      ease: "inOutQuart",
    });

    // Animate dot at end of path
    animate(dotRef.current, {
      opacity: [0, 1],
      scale: [0, 1],
      duration: 400,
      delay: delay + 500,
      ease: "outBack",
    });
  }, [isTriggered, delay]);

  const viewBoxHeight = height + 16; // Extra space for dot

  return (
    <svg
      width="20"
      height={viewBoxHeight}
      viewBox={`0 0 20 ${viewBoxHeight}`}
      className="mx-auto overflow-visible"
    >
      <defs>
        <filter id={`mobile-glow-${color.replace("#", "")}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur1">
            <animate
              attributeName="stdDeviation"
              values="2;4;2"
              dur="2.5s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </feGaussianBlur>
          <feGaussianBlur stdDeviation="6" result="blur2">
            <animate
              attributeName="stdDeviation"
              values="4;8;4"
              dur="2.5s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </feGaussianBlur>
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow layer - behind main path */}
      <path
        ref={glowRef}
        d={`M 10 0 L 10 ${height}`}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.4}
        filter={`url(#mobile-glow-${color.replace("#", "")})`}
      />

      {/* Main neon path */}
      <path
        ref={pathRef}
        d={`M 10 0 L 10 ${height}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        filter={`url(#mobile-glow-${color.replace("#", "")})`}
      />

      {/* End dot with glow */}
      <circle
        ref={dotRef}
        cx={10}
        cy={height}
        r={4}
        fill={color}
        opacity={0}
        filter={`url(#mobile-glow-${color.replace("#", "")})`}
        style={{ transformOrigin: "10px " + height + "px" }}
      />
      <circle
        cx={10}
        cy={height}
        r={2}
        fill="white"
        opacity={0.8}
        style={{ 
          opacity: isTriggered ? 0.8 : 0,
          transition: `opacity 300ms ease-out ${delay + 600}ms`
        }}
      />
    </svg>
  );
}
