import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ElementPositions } from "@/hooks/useElementPositions";

interface DynamicNeonPathsProps {
  positions: ElementPositions;
  isTriggered: boolean;
  scrollProgress: number; // For bottom connector scroll-linked animation
  phaseDelays: Record<string, number>;
  hoveredNode: string | null;
  className?: string;
}

const PHASE_DURATION = 500; // 0.5s per phase animation

export function DynamicNeonPaths({
  positions,
  isTriggered,
  scrollProgress,
  phaseDelays,
  hoveredNode,
  className,
}: DynamicNeonPathsProps) {
  // Calculate all path data
  const pathData = useMemo(() => {
    const { hub, cards, container } = positions;
    
    if (!hub || !container || cards.length < 3 || cards.some(c => !c)) {
      return null;
    }

    const validCards = cards as NonNullable<typeof cards[0]>[];
    
    const leftCard = validCards[0];
    const centerCard = validCards[1];
    const rightCard = validCards[2];
    
    const leftX = leftCard.x;
    const centerX = centerCard.x;
    const rightX = rightCard.x;
    
    const cardTopY = Math.min(...validCards.map(c => c.y));
    const cardBottomY = Math.max(...validCards.map(c => c.bottom));
    
    // Junction point - where horizontal bar sits (35% from hub to cards)
    const junctionY = hub.y + (cardTopY - hub.y) * 0.35;
    
    // Phase 2: Vertical from hub down to junction
    const hubToJunction = `M ${centerX} ${hub.y} L ${centerX} ${junctionY}`;
    
    // Phase 3: Horizontal paths from center outward
    const horizontalLeft = `M ${centerX} ${junctionY} L ${leftX} ${junctionY}`;
    const horizontalRight = `M ${centerX} ${junctionY} L ${rightX} ${junctionY}`;
    
    // Phase 4: Vertical paths through card centers
    const leftPath = `M ${leftX} ${junctionY} L ${leftX} ${cardBottomY}`;
    const centerPath = `M ${centerX} ${junctionY} L ${centerX} ${cardBottomY}`;
    const rightPath = `M ${rightX} ${junctionY} L ${rightX} ${cardBottomY}`;
    
    // Merge point - below the cards
    const mergeY = cardBottomY + 40;
    const mergeX = container.width / 2;
    
    // Phase 5: Merge paths from bottom of each card to merge point
    const leftMerge = `M ${leftX} ${cardBottomY} L ${mergeX} ${mergeY}`;
    const centerMerge = `M ${centerX} ${cardBottomY} L ${mergeX} ${mergeY}`;
    const rightMerge = `M ${rightX} ${cardBottomY} L ${mergeX} ${mergeY}`;
    
    // Phase 6: Bottom connector - extends down to next section
    const connectorEnd = container.height;
    const bottomConnector = `M ${mergeX} ${mergeY} L ${mergeX} ${connectorEnd}`;

    return {
      hubToJunction,
      horizontalLeft,
      horizontalRight,
      leftPath,
      centerPath,
      rightPath,
      leftMerge,
      centerMerge,
      rightMerge,
      bottomConnector,
      // Key positions
      hubY: hub.y,
      centerX,
      junctionY,
      leftX,
      rightX,
      cardTopY,
      cardBottomY,
      mergeX,
      mergeY,
      connectorEnd,
    };
  }, [positions]);

  // Calculate segment lengths for stroke-dasharray
  const segmentLengths = useMemo(() => {
    if (!pathData) return null;
    
    const hubToJunctionLen = pathData.junctionY - pathData.hubY;
    const halfHorizontalLeftLen = pathData.centerX - pathData.leftX;
    const halfHorizontalRightLen = pathData.rightX - pathData.centerX;
    const throughCardLen = pathData.cardBottomY - pathData.junctionY;
    
    const leftMergeLen = Math.hypot(
      pathData.mergeX - pathData.leftX,
      pathData.mergeY - pathData.cardBottomY
    );
    const centerMergeLen = pathData.mergeY - pathData.cardBottomY;
    const rightMergeLen = Math.hypot(
      pathData.mergeX - pathData.rightX,
      pathData.mergeY - pathData.cardBottomY
    );
    
    const connectorLen = pathData.connectorEnd - pathData.mergeY;
    
    return {
      hubToJunctionLen,
      halfHorizontalLeftLen,
      halfHorizontalRightLen,
      throughCardLen,
      leftMergeLen,
      centerMergeLen,
      rightMergeLen,
      connectorLen,
    };
  }, [pathData]);

  if (!pathData || !positions.container || !segmentLengths) {
    return null;
  }

  const { container } = positions;
  const { 
    hubToJunctionLen,
    halfHorizontalLeftLen, 
    halfHorizontalRightLen, 
    throughCardLen,
    leftMergeLen, 
    centerMergeLen, 
    rightMergeLen, 
    connectorLen 
  } = segmentLengths;

  // When triggered, all offsets become 0 (fully drawn) with CSS transition + delay
  const hubToJunctionOffset = isTriggered ? 0 : hubToJunctionLen;
  const horizontalLeftOffset = isTriggered ? 0 : halfHorizontalLeftLen;
  const horizontalRightOffset = isTriggered ? 0 : halfHorizontalRightLen;
  const throughCardOffset = isTriggered ? 0 : throughCardLen;
  const leftMergeOffset = isTriggered ? 0 : leftMergeLen;
  const centerMergeOffset = isTriggered ? 0 : centerMergeLen;
  const rightMergeOffset = isTriggered ? 0 : rightMergeLen;
  
  // Phase 6: Bottom connector - scroll-linked after other phases complete
  // Only starts animating when scroll progress is past 75%
  const connectorStart = scrollProgress >= 0.75 ? (scrollProgress - 0.75) / 0.25 : 0;
  const connectorOffset = isTriggered ? connectorLen * (1 - connectorStart) : connectorLen;

  // Guide opacity - fades in during Phase 1
  const guideOpacity = isTriggered ? 0.15 : 0;
  
  // Glow intensity - builds up as animation progresses
  const glowIntensity = isTriggered ? 1 : 0;
  
  // Colors for each branch
  const colors = {
    left: "#00F0FF",    // Cyan
    center: "#A855F7",  // Purple
    right: "#10B981",   // Green
  };

  return (
    <svg
      className={cn("absolute inset-0 pointer-events-none z-0", className)}
      viewBox={`0 0 ${container.width} ${container.height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <filter id="neon-glow-dynamic" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur1" />
          <feGaussianBlur stdDeviation="8" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        <filter id="static-glow-dynamic" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Breathing glow filter - enhanced version */}
        <filter id="breathing-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur1">
            <animate
              attributeName="stdDeviation"
              values="3;6;3"
              dur="3s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            />
          </feGaussianBlur>
          <feGaussianBlur stdDeviation="6" result="blur2">
            <animate
              attributeName="stdDeviation"
              values="6;12;6"
              dur="3s"
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
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes breathe {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          @keyframes pulseGlow {
            0%, 100% { filter: url(#neon-glow-dynamic); }
            50% { filter: url(#breathing-glow); }
          }
          .breathing-path {
            animation: breathe 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Layer 1: Grey static guide paths - Phase 1 */}
      <g 
        style={{ 
          opacity: guideOpacity,
          transition: `opacity ${PHASE_DURATION}ms ease-out ${phaseDelays.guides}ms`
        }}
      >
        <path d={pathData.hubToJunction} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
        <path d={pathData.horizontalLeft} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
        <path d={pathData.horizontalRight} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
        <path d={pathData.leftPath} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
        <path d={pathData.centerPath} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
        <path d={pathData.rightPath} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
        <path d={pathData.leftMerge} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
        <path d={pathData.centerMerge} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
        <path d={pathData.rightMerge} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
        <path d={pathData.bottomConnector} fill="none" stroke="white" strokeWidth={0.5} strokeLinecap="round" />
      </g>

      {/* Layer 2: Neon animated paths with sequential delays + breathing effect */}
      <g 
        filter={isTriggered ? "url(#breathing-glow)" : "url(#neon-glow-dynamic)"}
        className={isTriggered ? "breathing-path" : ""}
        style={{ 
          opacity: glowIntensity,
          transition: `opacity ${PHASE_DURATION}ms ease-out ${phaseDelays.hubToJunction}ms`
        }}
      >
        {/* Phase 2: Hub to junction vertical */}
        <path
          d={pathData.hubToJunction}
          fill="none"
          stroke={colors.center}
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray={hubToJunctionLen}
          strokeDashoffset={hubToJunctionOffset}
          style={{ 
            transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.hubToJunction}ms`
          }}
        />

        {/* Phase 3: Horizontal paths from center outward */}
        <path
          d={pathData.horizontalLeft}
          fill="none"
          stroke={colors.left}
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray={halfHorizontalLeftLen}
          strokeDashoffset={horizontalLeftOffset}
          style={{ 
            transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.horizontal}ms`
          }}
        />
        <path
          d={pathData.horizontalRight}
          fill="none"
          stroke={colors.right}
          strokeWidth={1}
          strokeLinecap="round"
          strokeDasharray={halfHorizontalRightLen}
          strokeDashoffset={horizontalRightOffset}
          style={{ 
            transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.horizontal}ms`
          }}
        />
        
        {/* Phase 4: Vertical paths through cards */}
        <path 
          d={pathData.leftPath} 
          fill="none" 
          stroke={colors.left} 
          strokeWidth={1} 
          strokeLinecap="round"
          strokeDasharray={throughCardLen} 
          strokeDashoffset={throughCardOffset}
          style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.vertical}ms` }} 
        />
        <path 
          d={pathData.centerPath} 
          fill="none" 
          stroke={colors.center} 
          strokeWidth={1} 
          strokeLinecap="round"
          strokeDasharray={throughCardLen} 
          strokeDashoffset={throughCardOffset}
          style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.vertical}ms` }} 
        />
        <path 
          d={pathData.rightPath} 
          fill="none" 
          stroke={colors.right} 
          strokeWidth={1} 
          strokeLinecap="round"
          strokeDasharray={throughCardLen} 
          strokeDashoffset={throughCardOffset}
          style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.vertical}ms` }} 
        />
        
        {/* Phase 5: Merge paths */}
        <path 
          d={pathData.leftMerge} 
          fill="none" 
          stroke={colors.left} 
          strokeWidth={1} 
          strokeLinecap="round"
          strokeDasharray={leftMergeLen} 
          strokeDashoffset={leftMergeOffset}
          style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.merge}ms` }} 
        />
        <path 
          d={pathData.centerMerge} 
          fill="none" 
          stroke={colors.center} 
          strokeWidth={1} 
          strokeLinecap="round"
          strokeDasharray={centerMergeLen} 
          strokeDashoffset={centerMergeOffset}
          style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.merge}ms` }} 
        />
        <path 
          d={pathData.rightMerge} 
          fill="none" 
          stroke={colors.right} 
          strokeWidth={1} 
          strokeLinecap="round"
          strokeDasharray={rightMergeLen} 
          strokeDashoffset={rightMergeOffset}
          style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.merge}ms` }} 
        />
        
        {/* Phase 6: Bottom connector - scroll-linked */}
        <path 
          d={pathData.bottomConnector} 
          fill="none" 
          stroke={colors.center} 
          strokeWidth={1} 
          strokeLinecap="round"
          strokeDasharray={connectorLen} 
          strokeDashoffset={connectorOffset}
          style={{ 
            transition: scrollProgress >= 0.75 
              ? `stroke-dashoffset 100ms ease-out` 
              : `stroke-dashoffset ${PHASE_DURATION}ms ease-out ${phaseDelays.connector}ms` 
          }} 
        />
      </g>

      {/* Junction dots - appear after Phase 3 horizontal completes */}
      {isTriggered && (
        <g 
          style={{ 
            opacity: 0,
            animation: `fadeIn 300ms ease-out ${phaseDelays.vertical}ms forwards`
          }}
        >
          <circle cx={pathData.leftX} cy={pathData.junctionY} r={3} fill={colors.left} filter="url(#neon-glow-dynamic)" />
          <circle cx={pathData.centerX} cy={pathData.junctionY} r={3} fill={colors.center} filter="url(#neon-glow-dynamic)" />
          <circle cx={pathData.rightX} cy={pathData.junctionY} r={3} fill={colors.right} filter="url(#neon-glow-dynamic)" />
        </g>
      )}
      
      {/* Merge point dot - appears after Phase 5 merge completes */}
      {isTriggered && (
        <g 
          style={{ 
            opacity: 0,
            animation: `fadeIn 300ms ease-out ${phaseDelays.connector}ms forwards`
          }}
        >
          <circle cx={pathData.mergeX} cy={pathData.mergeY} r={4} fill={colors.center} filter="url(#neon-glow-dynamic)" />
          <circle cx={pathData.mergeX} cy={pathData.mergeY} r={2} fill="white" opacity={0.8} />
        </g>
      )}
    </svg>
  );
}
