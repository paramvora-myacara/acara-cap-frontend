// components/graph/LenderGraph.tsx
'use client';

import type React from "react";
import { useRef, useEffect, useState } from "react";
import type { LenderProfile } from "../../types/lender";
import LenderDetailCard from "../lender-detail-card";

const filterKeys = ['asset_types', 'deal_types', 'capital_types', 'debt_ranges', 'locations'];

function computeSelectedFilters(formData: any): number {
  return filterKeys.filter(
    (key) =>
      formData &&
      formData[key] &&
      (Array.isArray(formData[key])
        ? formData[key].length > 0
        : true)
  ).length;
}

function computeLenderScore(lender: LenderProfile, formData: any): number {
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
  return matchCount / selectedCount;
}

function getLenderColor(lender: LenderProfile, formData: any, isActive: boolean) {
  if (computeSelectedFilters(formData) === 0) return "hsl(220, 10%, 70%)";
  if (!isActive) return "hsl(220, 10%, 70%)";
  const score = computeLenderScore(lender, formData);
  return score === 1 ? "red" : "hsl(220, 10%, 70%)";
}

// In components/graph/LenderGraph.tsx
interface LenderGraphProps {
  lenders: LenderProfile[];
  formData?: any;
  filtersApplied?: boolean;
  onLenderClick?: (lender: LenderProfile | null) => void;
}

export default function LenderGraph({
  lenders,
  formData,
  filtersApplied,
  onLenderClick,
}: LenderGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLender, setSelectedLender] = useState<LenderProfile | null>(null);
  const [hoveredLenderId, setHoveredLenderId] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [centerPoint, setCenterPoint] = useState({ x: 0, y: 0 });
  const [showIncompleteFiltersCard, setShowIncompleteFiltersCard] = useState(false);
  const animationRef = useRef<number>(0);
  const lenderPositionsRef = useRef<Map<number, {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    radius: number;
    color: string;
    isActive: boolean;
    velocity: { x: number; y: number };
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
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight - 60;
      setCanvasSize({ width, height });
      setCenterPoint({ x: width / 2, y: height / 2 });
    };
    updateCanvasSize();
    const timeoutId = setTimeout(updateCanvasSize, 100);
    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!canvasSize.width || !canvasSize.height) return;
    const newPositions = new Map();
    const center = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
    const maxDistance = Math.min(canvasSize.width, canvasSize.height) * 0.45;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    lenders.forEach((lender, index) => {
      const existingPos = lenderPositionsRef.current.get(lender.lender_id);
      const score = computeLenderScore(lender, formData);
      const isActive = filtersApplied === true && score > 0;
      const baseRadius = isActive ? 12 : 8;
      const bonus = isActive ? score * 8 : 0;
      const radius = baseRadius + bonus;
      const color = getLenderColor(lender, formData, isActive);
      const angle = index * goldenAngle;
      const distanceFactor = 0.3 + (index / lenders.length) * 0.7;
      const distance = maxDistance * distanceFactor;
      const targetX = center.x + Math.cos(angle) * distance;
      const targetY = center.y + Math.sin(angle) * distance;

      if (existingPos) {
        newPositions.set(lender.lender_id, {
          ...existingPos,
          radius,
          color,
          isActive,
          targetX: isActive ? existingPos.targetX : targetX,
          targetY: isActive ? existingPos.targetY : targetY,
        });
      } else {
        const randomOffset = 50;
        const startX = center.x + Math.random() * randomOffset * 2 - randomOffset;
        const startY = center.y + Math.random() * randomOffset * 2 - randomOffset;
        newPositions.set(lender.lender_id, {
          x: startX,
          y: startY,
          targetX,
          targetY,
          radius,
          color,
          isActive,
          velocity: { x: 0, y: 0 },
        });
      }
    });

    lenderPositionsRef.current = newPositions;
  }, [lenders, canvasSize, filtersApplied, formData]);

  function addParticles(x: number, y: number, color: string, count = 5) {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        size: Math.random() * 3 + 1,
        color,
        speed: Math.random() * 2 + 0.5,
        life: 0,
        maxLife: Math.random() * 30 + 20,
      });
    }
  }

  useEffect(() => {
    if (!canvasRef.current || !canvasSize.width || !canvasSize.height) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const createBackground = () => {
      const gradient = ctx.createRadialGradient(
        centerPoint.x,
        centerPoint.y,
        0,
        centerPoint.x,
        centerPoint.y,
        canvasSize.width * 0.7
      );
      gradient.addColorStop(0, "rgba(240, 240, 255, 0.2)");
      gradient.addColorStop(1, "rgba(240, 240, 255, 0)");
      return gradient;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.fillStyle = createBackground();
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      ctx.strokeStyle = "rgba(200, 200, 230, 0.2)";
      ctx.lineWidth = 1;
      for (let i = 1; i <= 6; i++) {
        const radius = i * (Math.min(canvasSize.width, canvasSize.height) * 0.1);
        ctx.beginPath();
        ctx.arc(centerPoint.x, centerPoint.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(centerPoint.x, centerPoint.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(100, 100, 255, 0.8)";
      ctx.fill();
      const centerGlow = ctx.createRadialGradient(
        centerPoint.x,
        centerPoint.y,
        0,
        centerPoint.x,
        centerPoint.y,
        40
      );
      centerGlow.addColorStop(0, "rgba(100, 100, 255, 0.3)");
      centerGlow.addColorStop(1, "rgba(100, 100, 255, 0)");
      ctx.beginPath();
      ctx.arc(centerPoint.x, centerPoint.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = centerGlow;
      ctx.fill();

      particlesRef.current.forEach((particle, index) => {
        particle.life++;
        if (particle.life >= particle.maxLife) {
          particlesRef.current.splice(index, 1);
          return;
        }
        const lifeRatio = particle.life / particle.maxLife;
        const alpha = lifeRatio < 0.5 ? lifeRatio * 2 : 2 - lifeRatio * 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(")", `, ${alpha})`);
        ctx.fill();
      });

      lenders.forEach((lender) => {
        const pos = lenderPositionsRef.current.get(lender.lender_id);
        if (!pos || !pos.isActive) return;
        if (filtersApplied) {
          const score = computeLenderScore(lender, formData);
          let gradient;
          if (score === 1) {
            gradient = ctx.createLinearGradient(centerPoint.x, centerPoint.y, pos.x, pos.y);
            gradient.addColorStop(0, "rgba(255, 0, 0, 0.7)");
            gradient.addColorStop(1, "rgba(255, 0, 0, 0.7)");
          } else {
            gradient = ctx.createLinearGradient(centerPoint.x, centerPoint.y, pos.x, pos.y);
            gradient.addColorStop(0, "rgba(200, 200, 200, 0.7)");
            gradient.addColorStop(1, "rgba(200, 200, 200, 0.7)");
          }
          ctx.beginPath();
          ctx.moveTo(centerPoint.x, centerPoint.y);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1 + score * 3;
          ctx.stroke();

          if (score === 1 && Math.random() < 0.05 * score) {
            const t = Math.random();
            const particleX = centerPoint.x + (pos.x - centerPoint.x) * t;
            const particleY = centerPoint.y + (pos.y - centerPoint.y) * t;
            addParticles(particleX, particleY, pos.color, 1);
          }
        }
      });

      lenders.forEach((lender) => {
        const pos = lenderPositionsRef.current.get(lender.lender_id);
        if (!pos) return;
        const dx = (pos.targetX - pos.x) * 0.008;
        const dy = (pos.targetY - pos.y) * 0.008;
        pos.velocity.x = pos.velocity.x * 0.9 + dx;
        pos.velocity.y = pos.velocity.y * 0.9 + dy;
        pos.x += pos.velocity.x;
        pos.y += pos.velocity.y;

        if (pos.isActive) {
          const speed = Math.sqrt(pos.velocity.x ** 2 + pos.velocity.y ** 2);
          if (speed > 0.5 && Math.random() < 0.1) {
            addParticles(pos.x, pos.y, pos.color, 1);
          }
        }

        const pulseStrength = pos.isActive ? 0.15 : 0.05;
        const pulse = Math.sin(time * 0.002 + lender.lender_id * 0.1) * pulseStrength + 0.85;
        const radius = pos.radius * pulse;

        if (pos.isActive || hoveredLenderId === lender.lender_id || (selectedLender && selectedLender.lender_id === lender.lender_id)) {
          const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius * 1.5);
          const score = computeLenderScore(lender, formData);
          const glowOpacity = pos.isActive ? 0.1 + score * 0.3 : 0.1;
          glow.addColorStop(0, pos.color.replace(")", `, ${glowOpacity})`));
          glow.addColorStop(1, pos.color.replace(")", ", 0)"));
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(pos.x - radius * 0.3, pos.y - radius * 0.3, 0, pos.x, pos.y, radius);
        gradient.addColorStop(0, pos.color.replace(")", ", 1)"));
        gradient.addColorStop(1, pos.color.replace("hsl", "hsla").replace(")", ", 0.8)"));
        ctx.fillStyle = gradient;
        ctx.fill();

        if (selectedLender && selectedLender.lender_id === lender.lender_id) {
          ctx.strokeStyle = "white";
          ctx.lineWidth = 3;
          ctx.stroke();
          if (Math.random() < 0.2) {
            addParticles(pos.x, pos.y, pos.color, 2);
          }
        } else if (hoveredLenderId === lender.lender_id) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if (radius > 15) {
          const initial = lender.name.charAt(0).toUpperCase();
          ctx.fillStyle = "white";
          ctx.font = `${Math.floor(radius * 0.8)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(initial, pos.x, pos.y);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animationRef.current); };
  }, [lenders, canvasSize, selectedLender, hoveredLenderId, centerPoint, filtersApplied, formData]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let foundLender: LenderProfile | null = null;
    for (const lender of lenders) {
      const pos = lenderPositionsRef.current.get(lender.lender_id);
      if (!pos) continue;
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (distance <= pos.radius) {
        foundLender = lender;
        canvas.style.cursor = "pointer";
        break;
      }
    }
    if (foundLender) {
      setHoveredLenderId(foundLender.lender_id);
    } else {
      setHoveredLenderId(null);
      canvas.style.cursor = "default";
    }
  }

  function handleMouseLeave() {
    setHoveredLenderId(null);
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  }

  const activeLenderCount = lenders.filter(
    (lender) => filtersApplied && computeLenderScore(lender, formData) > 0
  ).length;

  function handleLenderClick(e: React.MouseEvent) {
    if (!canvasRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - containerRect.left;
    const relativeY = e.clientY - containerRect.top;
    const cardWidth = 300, cardHeight = 300;
    const adjustedX = Math.min(relativeX, containerRect.width - cardWidth);
    const adjustedY = Math.min(relativeY, containerRect.height - cardHeight);
    cardPositionRef.current = { x: adjustedX, y: adjustedY };

    const selectedCount = computeSelectedFilters(formData);
    if (selectedCount < filterKeys.length) {
      setShowIncompleteFiltersCard(true);
      setSelectedLender(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    let clickedLender: LenderProfile | null = null;
    for (const lender of lenders) {
      const pos = lenderPositionsRef.current.get(lender.lender_id);
      if (!pos) continue;
      const distance = Math.sqrt((canvasX - pos.x) ** 2 + (canvasY - pos.y) ** 2);
      if (distance <= pos.radius) {
        clickedLender = lender;
        break;
      }
    }
    if (clickedLender && filtersApplied && activeLenderCount > 0) {
      const pos = lenderPositionsRef.current.get(clickedLender.lender_id);
      if (pos && pos.isActive) {
        setSelectedLender(clickedLender === selectedLender ? null : clickedLender);
      } else {
        setSelectedLender(null);
      }
    } else {
      setSelectedLender(null);
    }
  }

  return (
    <div className="h-full flex" ref={containerRef}>
      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="absolute inset-0"
          onClick={handleLenderClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {selectedLender && filtersApplied && activeLenderCount > 0 && (
          <div
            className="absolute z-10"
            style={{
              top: cardPositionRef.current.y,
              left: cardPositionRef.current.x,
              maxWidth: '300px',
            }}
          >
            <LenderDetailCard
              lender={selectedLender}
              formData={formData}
              onClose={() => setSelectedLender(null)}
              color={getLenderColor(selectedLender, formData, true)}
            />
          </div>
        )}

        {showIncompleteFiltersCard && (
          <div
            className="absolute z-10"
            style={{
              top: cardPositionRef.current.y,
              left: cardPositionRef.current.x,
              maxWidth: '300px',
            }}
          >
            <div className="bg-white shadow-lg rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Incomplete Filters</h3>
                <button
                  onClick={() => setShowIncompleteFiltersCard(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div>Please fill out all filters to see detailed lender information.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
