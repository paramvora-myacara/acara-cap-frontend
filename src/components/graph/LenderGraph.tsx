// src/components/graph/LenderGraph.tsx
// THIS IS THE CODE YOU PROVIDED AS THE "WORKING OLDER VERSION"
// I will use this directly, assuming it has the desired baseline functionality.
// The key is that `page.tsx` passes the correct props to it.

'use client';

import type React from "react";
import { useRef, useEffect, useState } from "react";
import type { LenderProfile } from "../../types/lender";
import LenderDetailCard from "../lender-detail-card";
import { X, Check } from 'lucide-react';

const filterKeys = ['asset_types', 'deal_types', 'capital_types', 'debt_ranges', 'locations'];

function computeSelectedFilters(formData: any): number {
  if (!formData) return 0;
  return filterKeys.filter(
    (key) =>
      formData[key] &&
      (Array.isArray(formData[key])
        ? formData[key].length > 0
        : true)
  ).length;
}

// This function is used by the graph to calculate a score based on its *current formData* view.
// It's separate from the lender.match_score which comes from LenderContext and is the source of truth.
function computeLenderScoreForGraphDisplay(lender: LenderProfile, formData: any): number {
  const selectedCount = computeSelectedFilters(formData);
  if (selectedCount === 0) return 0;

  let matchCount = 0;
  for (const key of filterKeys) {
    if (
      formData &&
      formData[key] &&
      (Array.isArray(formData[key]) ? formData[key].length > 0 : true)
    ) {
      if (key === "locations") {
        if (
          lender.locations.includes("nationwide") ||
          lender.locations.some((loc) =>
            Array.isArray(formData[key])
              ? formData[key].includes(loc)
              : formData[key] === loc
          )
        ) {
          matchCount++;
        }
      } else if (key === "debt_ranges") {
        if (
          lender.debt_ranges &&
          lender.debt_ranges.some((dr) =>
            Array.isArray(formData[key])
              ? formData[key].includes(dr)
              : formData[key] === dr
          )
        ) {
          matchCount++;
        }
      } else {
        const lenderVals = lender[key as keyof LenderProfile] as string[] | undefined;
        if (
          lenderVals &&
          lenderVals.some((item: string) =>
            Array.isArray(formData[key])
              ? formData[key].includes(item)
              : formData[key] === item
          )
        ) {
          matchCount++;
        }
      }
    }
  }
  return selectedCount > 0 ? matchCount / selectedCount : 0;
}


function getLenderColor(lenderFromContext: LenderProfile, graphFormData: any, isNodeActiveForGraph: boolean): string {
  const scoreFromContext = lenderFromContext.match_score || 0;

  // If the graph has no active UI filters selected by the user (computeSelectedFilters(graphFormData) === 0)
  // OR if this specific node is deemed inactive by the graph's logic, render it as default gray.
  if (computeSelectedFilters(graphFormData) === 0 || !isNodeActiveForGraph) {
    return "hsl(220, 10%, 70%)";
  }
  
  // Otherwise, color is based on the authoritative match_score from the context.
  if (scoreFromContext === 1) return "hsl(0, 100%, 50%)"; 
  if (scoreFromContext > 0.8) return "hsl(0, 90%, 60%)";  
  if (scoreFromContext > 0.6) return "hsl(20, 80%, 65%)"; 
  if (scoreFromContext > 0.4) return "hsl(30, 70%, 70%)"; 
  if (scoreFromContext > 0.2) return "hsl(40, 60%, 70%)"; 
  
  return "hsl(220, 10%, 70%)"; // Default gray for very low context scores
}

interface LenderGraphProps {
  lenders: LenderProfile[]; // These lenders WILL have match_score from context
  formData?: any;           // Current filter values from UI, used for graph's internal logic
  filtersApplied: boolean; // True if ANY filter category is selected by the user (from page.tsx)
  allFiltersSelected?: boolean; // Are ALL categories selected (for card display)
  onLenderClick?: (lender: LenderProfile | null) => void;
}

export default function LenderGraph({
  lenders,
  formData,
  filtersApplied, // This prop tells the graph if any filter is active in the UI
  allFiltersSelected = false, 
  onLenderClick,
}: LenderGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLender, setSelectedLender] = useState<LenderProfile | null>(null);
  const [hoveredLenderId, setHoveredLenderId] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [centerPoint, setCenterPoint] = useState({ x: 0, y: 0 });
  const [showIncompleteFiltersCard, setShowIncompleteFiltersCard] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const animationRef = useRef<number>(0);
  const lenderPositionsRef = useRef<Map<number, {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    radius: number;
    color: string;
    isActiveForGraphDisplay: boolean; // Node's visual active state in the graph
    scoreFromContext: number; // Authoritative score
  }>>(new Map());
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    life: number;
    maxLife: number;
  }>>([]);
  const cardPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Robust canvas size update
    let rafId: number;
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        if (width > 0 && height > 0) {
          if (canvasSize.width !== width || canvasSize.height !== height) {
            setCanvasSize({ width, height });
            setCenterPoint({ x: width / 2, y: height / 2 });
          }
        } else {
          rafId = requestAnimationFrame(updateSize); // Retry if size is 0
        }
      } else {
        rafId = requestAnimationFrame(updateSize); // Retry if ref not ready
      }
    };
    rafId = requestAnimationFrame(updateSize); // Initial call
    
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(rafId);
    };
  }, [canvasSize.width, canvasSize.height]); // Depend on size to re-run if needed after first set


  useEffect(() => {
    if (!canvasSize.width || !canvasSize.height) return;
    const newPositions = new Map();
    const center = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
    const maxDistance = Math.min(canvasSize.width, canvasSize.height) * 0.45;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    lenders.forEach((lender, index) => {
      const scoreFromContext = lender.match_score || 0;
      
      // A node is considered "active" for graph display if the `filtersApplied` prop is true
      // AND the graph's internal scoring based on `formData` yields a positive score.
      // This allows nodes to be "dimmed" if they don't match the *current UI selection*,
      // even if their overall `match_score` from context is high due to other potential filter combos.
      const graphInternalScore = computeLenderScoreForGraphDisplay(lender, formData);
      const isActiveForGraphDisplay = filtersApplied && graphInternalScore > 0;
      
      const baseRadius = isActiveForGraphDisplay ? 8 + scoreFromContext * 8 : 6; // Radius scales with context score
      const color = getLenderColor(lender, formData, isActiveForGraphDisplay);
      
      const angle = index * goldenAngle;
      let distanceFactor;
      
      if (isActiveForGraphDisplay) {
        distanceFactor = 0.3 + (1 - scoreFromContext) * 0.6; // Position by context score
      } else {
        // If not active for graph display, push to periphery.
        // Still use scoreFromContext slightly to keep better overall matches a bit closer.
        distanceFactor = 0.75 + (1 - scoreFromContext * 0.5) * 0.20; 
      }
      
      const distance = maxDistance * distanceFactor;
      const targetX = center.x + Math.cos(angle) * distance;
      const targetY = center.y + Math.sin(angle) * distance;

      const currentPosData = lenderPositionsRef.current.get(lender.lender_id);
      newPositions.set(lender.lender_id, {
        x: currentPosData?.x ?? targetX, 
        y: currentPosData?.y ?? targetY, 
        targetX, targetY, radius: baseRadius, color, isActiveForGraphDisplay, scoreFromContext,
      });
    });
    lenderPositionsRef.current = newPositions;
  }, [lenders, canvasSize, filtersApplied, formData]);


  function addParticles(x: number, y: number, color: string, count = 3, sizeMultiplier = 0.8) {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y, size: (Math.random() * 1.8 + 0.8) * sizeMultiplier, 
        color, speed: Math.random() * 1.2 + 0.25, life: 0, maxLife: Math.random() * 30 + 22,
      });
    }
  }

  useEffect(() => {
    if (!canvasRef.current || !canvasSize.width || !canvasSize.height) {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) ctx.clearRect(0,0, canvasSize.width || 0, canvasSize.height || 0);
        return;
    }
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      ctx.strokeStyle = "rgba(200, 200, 230, 0.1)";
      ctx.lineWidth = 0.4;
      for (let i = 1; i <= 4; i++) {
        const radius = i * (Math.min(canvasSize.width, canvasSize.height) * 0.15);
        ctx.beginPath();
        ctx.arc(centerPoint.x, centerPoint.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(centerPoint.x, centerPoint.y, 14, 0, Math.PI * 2); 
      ctx.fillStyle = "rgba(90, 120, 240, 0.4)"; 
      ctx.fill();
      const centerGlow = ctx.createRadialGradient(
        centerPoint.x, centerPoint.y, 0, centerPoint.x, centerPoint.y, 28
      );
      centerGlow.addColorStop(0, "rgba(90, 120, 240, 0.12)");
      centerGlow.addColorStop(1, "rgba(90, 120, 240, 0)");
      ctx.beginPath();
      ctx.arc(centerPoint.x, centerPoint.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = centerGlow;
      ctx.fill();

      particlesRef.current.forEach((particle, index) => {
        particle.life++;
        if (particle.life >= particle.maxLife) { particlesRef.current.splice(index, 1); return; }
        const lifeRatio = particle.life / particle.maxLife;
        const alpha = lifeRatio < 0.5 ? lifeRatio * 2 : 2 - lifeRatio * 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 - lifeRatio), 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(")", `, ${alpha * 0.55})`);
        ctx.fill();
      });

      lenderPositionsRef.current.forEach((pos, lender_id) => {
        if (!pos) return;
        const { isActiveForGraphDisplay, scoreFromContext } = pos;

        if (isActiveForGraphDisplay) { // Only draw lines if node is active for graph display
          let gradient;
          if (scoreFromContext === 1) { gradient = ctx.createLinearGradient(centerPoint.x, centerPoint.y, pos.x, pos.y); gradient.addColorStop(0, "rgba(255, 0, 0, 0.45)"); gradient.addColorStop(1, "rgba(255, 0, 0, 0.2)");
          } else if (scoreFromContext > 0.8) { gradient = ctx.createLinearGradient(centerPoint.x, centerPoint.y, pos.x, pos.y); gradient.addColorStop(0, "rgba(255, 60, 60, 0.35)"); gradient.addColorStop(1, "rgba(255, 60, 60, 0.12)");
          } else if (scoreFromContext > 0.6) { gradient = ctx.createLinearGradient(centerPoint.x, centerPoint.y, pos.x, pos.y); gradient.addColorStop(0, "rgba(255, 120, 60, 0.25)"); gradient.addColorStop(1, "rgba(255, 120, 60, 0.08)");
          } else { gradient = ctx.createLinearGradient(centerPoint.x, centerPoint.y, pos.x, pos.y); gradient.addColorStop(0, "rgba(180, 190, 210, 0.12)"); gradient.addColorStop(1, "rgba(180, 190, 210, 0.04)");
          }
          ctx.beginPath();
          ctx.moveTo(centerPoint.x, centerPoint.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.4 + scoreFromContext * 1.3; 
          ctx.stroke();

          if (scoreFromContext > 0.65 && Math.random() < 0.018 * scoreFromContext) {
            const t = Math.random();
            addParticles(centerPoint.x + (pos.x - centerPoint.x) * t, centerPoint.y + (pos.y - centerPoint.y) * t, pos.color, 1, 0.7);
          }
        }
        
        const moveSpeed = 0.075; 
        pos.x += (pos.targetX - pos.x) * moveSpeed;
        pos.y += (pos.targetY - pos.y) * moveSpeed;
        
        if (isActiveForGraphDisplay && scoreFromContext > 0.55 && Math.random() < 0.012 * scoreFromContext) {
          addParticles(pos.x, pos.y, pos.color, 1, 0.6);
        }

        const pulseStrength = isActiveForGraphDisplay ? 0.07 + (scoreFromContext * 0.065) : 0.02; 
        const pulseSpeed = 0.0011 + (scoreFromContext * 0.00065); 
        const pulse = Math.sin(time * pulseSpeed + lender_id * 0.1) * pulseStrength + (1 - pulseStrength / 2);
        const radius = pos.radius * pulse;

        const isHighlighted = hoveredLenderId === lender_id || (selectedLender?.lender_id === lender_id);
        if (isActiveForGraphDisplay || isHighlighted) {
          const glowRadius = radius * (1.18 + scoreFromContext * 0.22); 
          const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
          const glowOpacity = isActiveForGraphDisplay ? 0.065 + scoreFromContext * 0.18 : 0.045; 
          glow.addColorStop(0, pos.color.replace(")", `, ${glowOpacity})`));
          glow.addColorStop(1, pos.color.replace(")", ", 0)"));
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, Math.max(2, radius), 0, Math.PI * 2); // Ensure min radius
        const nodeGradient = ctx.createRadialGradient(pos.x - radius * 0.3, pos.y - radius * 0.3, 0, pos.x, pos.y, radius);
        nodeGradient.addColorStop(0, pos.color.replace(")", ", 1)"));
        nodeGradient.addColorStop(1, pos.color.replace("hsl", "hsla").replace(")", ", 0.62)"));
        ctx.fillStyle = nodeGradient;
        ctx.fill();

        if (selectedLender?.lender_id === lender_id) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.82)"; 
          ctx.lineWidth = 1.9; ctx.stroke();
        } else if (hoveredLenderId === lender_id) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.52)";
          ctx.lineWidth = 1.3; ctx.stroke();
        }

        if (radius > 9 && scoreFromContext > 0.22) { 
          const lenderDetails = lenders.find(l => l.lender_id === lender_id);
          const initial = lenderDetails?.name.charAt(0).toUpperCase() || "L";
          ctx.fillStyle = "rgba(255, 255, 255, 0.78)"; 
          ctx.font = `bold ${Math.floor(radius * 0.78)}px Arial, sans-serif`; 
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(initial, pos.x, pos.y + 0.5); 
        }
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animationRef.current); };
  }, [lenders, canvasSize, selectedLender, hoveredLenderId, centerPoint, filtersApplied, formData]); // formData needed by getLenderColor

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !canvasSize.width || !canvasSize.height) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let foundLender: LenderProfile | null = null;

    // Iterate to find the topmost lender node under cursor
    const sortedLenders = [...lenders].sort((a,b) => (lenderPositionsRef.current.get(a.lender_id)?.radius || 0) - (lenderPositionsRef.current.get(b.lender_id)?.radius || 0));

    for (const lender of sortedLenders) { // Check smaller nodes first (effectively topmost)
        const pos = lenderPositionsRef.current.get(lender.lender_id);
        if (!pos) continue;
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance <= pos.radius + 3) { // Increased hover radius slightly
            foundLender = lender;
            break; 
        }
    }
    
    canvas.style.cursor = foundLender ? "pointer" : "default";
    setHoveredLenderId(foundLender ? foundLender.lender_id : null);

    if (foundLender) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const relativeX = e.clientX - containerRect.left;
        const relativeY = e.clientY - containerRect.top;
        const cardWidth = 320; const cardHeight = 380; // Adjusted card height estimate
        let cardX = relativeX + 20; let cardY = relativeY - 20; // Position slightly offset and above

        if (cardX + cardWidth > canvasSize.width -10) cardX = relativeX - cardWidth - 20;
        if (cardY + cardHeight > canvasSize.height -10) cardY = canvasSize.height - cardHeight -10;
        if (cardY < 10) cardY = 10; // Don't let it go off top
        
        cardX = Math.max(5, Math.min(cardX, canvasSize.width - cardWidth - 5));
        cardY = Math.max(5, Math.min(cardY, canvasSize.height - cardHeight - 5));
        cardPositionRef.current = { x: cardX, y: cardY };
        
        if (allFiltersSelected && foundLender.match_score > 0) { 
          setSelectedLender(foundLender);
          if (onLenderClick) onLenderClick(foundLender);
        } else if (foundLender.match_score > 0) { 
          setShowIncompleteFiltersCard(true);
          setSelectedLender(null); 
        } else { 
          setShowIncompleteFiltersCard(false);
          setSelectedLender(null);
        }
      }
    } else {
      setShowIncompleteFiltersCard(false);
      // Only clear selection if mouse is not down (i.e., not dragging)
      if (!isMouseDown) {
        // Check if the mouse is outside the currently selected lender card before clearing
        const card = document.getElementById(`lender-card-${selectedLender?.lender_id}`);
        if (card && e.target !== card && !card.contains(e.target as Node)) {
            // setSelectedLender(null); // Potentially too aggressive
        } else if (!card) {
             // setSelectedLender(null); // If no card was shown
        }
      }
    }
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLCanvasElement>) {
    // Check if mouse is leaving to outside the canvas and not onto the lender card
    if (selectedLender && containerRef.current) {
        const cardElement = document.querySelector(`[id^="lender-card-"]`); // More generic selector
        if (cardElement && cardElement.contains(e.relatedTarget as Node)) {
            // Mouse is over the card, do nothing
            return;
        }
    }
    setHoveredLenderId(null);
    setShowIncompleteFiltersCard(false);
    if (!isMouseDown) {
      // setSelectedLender(null); // Commented out: don't clear selection on mouse leave from canvas
      // if (onLenderClick) onLenderClick(null);
    }
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  }

  function handleMouseDown() { setIsMouseDown(true); }
  function handleMouseUp() { setIsMouseDown(false); }

  function handleLenderClick(e: React.MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let clickedLender: LenderProfile | null = null;

    const sortedLenders = [...lenders].sort((a,b) => (lenderPositionsRef.current.get(a.lender_id)?.radius || 0) - (lenderPositionsRef.current.get(b.lender_id)?.radius || 0));
    for (const lender of sortedLenders) {
        const pos = lenderPositionsRef.current.get(lender.lender_id);
        if (!pos) continue;
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance <= pos.radius + 3) { clickedLender = lender; break; }
    }
    
    if (clickedLender) {
        if (allFiltersSelected && clickedLender.match_score > 0) {
            setSelectedLender(prev => {
                const newSelection = prev?.lender_id === clickedLender?.lender_id ? null : clickedLender;
                if (onLenderClick) onLenderClick(newSelection);
                setShowIncompleteFiltersCard(false); // Hide tooltip if card is shown
                return newSelection;
            });
        } else if (clickedLender.match_score > 0) {
            setShowIncompleteFiltersCard(true);
            setSelectedLender(null); // Ensure card isn't shown if filters incomplete
        } else { 
            setSelectedLender(null); 
            setShowIncompleteFiltersCard(false);
            if (onLenderClick) onLenderClick(null);
        }
    } else { 
        setSelectedLender(null);
        setShowIncompleteFiltersCard(false);
        if (onLenderClick) onLenderClick(null);
    }
  }

  const incompleteFiltersTooltip = (
    <div
      className="absolute z-20 p-3 bg-gray-700 text-white text-xs rounded-md shadow-xl pointer-events-none ring-1 ring-gray-600"
      style={{
        top: cardPositionRef.current.y - 10, 
        left: cardPositionRef.current.x + 10,
        maxWidth: '230px',
        transform: 'translateY(-100%)', 
      }}
    >
      Please select criteria in all filter categories to view lender details and connect.
    </div>
  );

  return (
    <div className="h-full w-full flex" ref={containerRef}>
      <div className="relative w-full h-full"> {/* This div will define canvas bounds */}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleLenderClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{ display: 'block' }}  // Important for layout
        />

        {selectedLender && allFiltersSelected && selectedLender.match_score > 0 && (
          <div
            id={`lender-card-${selectedLender.lender_id}`} // Add ID for mouseleave check
            className="absolute z-10"
            style={{
              top: cardPositionRef.current.y,
              left: cardPositionRef.current.x,
            }}
            onMouseLeave={(e) => {
                // If mouse leaves card to an element not canvas, clear selection
                 if (canvasRef.current && e.relatedTarget !== canvasRef.current && !canvasRef.current.contains(e.relatedTarget as Node)) {
                    // setSelectedLender(null);
                    // if (onLenderClick) onLenderClick(null);
                 }
            }}
          >
            <LenderDetailCard
              lender={selectedLender}
              formData={formData}
              onClose={() => {setSelectedLender(null); if (onLenderClick) onLenderClick(null);}}
              color={getLenderColor(selectedLender, formData, true)} // Node is active because it's selected
            />
          </div>
        )}

        {showIncompleteFiltersCard && !allFiltersSelected && hoveredLenderId !== null && 
         (lenders.find(l => l.lender_id === hoveredLenderId)?.match_score ?? 0) > 0 &&
         incompleteFiltersTooltip}
      </div>
    </div>
  );
}