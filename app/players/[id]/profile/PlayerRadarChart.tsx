"use client";

import * as React from "react";

export type PlayerRadarScores = {
  techniek: number;
  visie: number;
  fysiek: number;
  mentaliteit: number;
  karakter: number;
};

type PlayerRadarChartProps = {
  /**
   * Scores tussen 0 en 5.
   * In de toekomst kun je dit direct uit de database vullen.
   */
  scores?: PlayerRadarScores;
};

const LABELS: (keyof PlayerRadarScores)[] = [
  "techniek",
  "visie",
  "fysiek",
  "mentaliteit",
  "karakter",
];

const MAX_VALUE = 5;

export function PlayerRadarChart({ scores }: PlayerRadarChartProps) {
  // Fictieve demo‑data zolang er nog geen echte scores zijn
  const values = React.useMemo(() => {
    const base: PlayerRadarScores =
      scores ?? {
        techniek: 4,
        visie: 3,
        fysiek: 5,
        mentaliteit: 4,
        karakter: 3,
      };

    // Zorg dat alles binnen 0–5 valt
    return LABELS.map((key) => {
      const v = base[key] ?? 0;
      return Math.min(Math.max(v, 0), MAX_VALUE);
    });
  }, [scores]);

  const size = 340;
  const center = size / 2;
  const radius = 130;
  const levels = 5; // aantal ringen (1–5)
  const angleStep = (2 * Math.PI) / LABELS.length;

  const polarToCartesian = (value: number, index: number) => {
    const angle = -Math.PI / 2 + index * angleStep; // start boven
    const r = (value / MAX_VALUE) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Ringen (grid)
  const gridPolygons = Array.from({ length: levels }, (_, levelIndex) => {
    const levelValue = MAX_VALUE * ((levelIndex + 1) / levels);
    const points = LABELS.map((_, i) => {
      const { x, y } = polarToCartesian(levelValue, i);
      return `${x},${y}`;
    }).join(" ");

    return (
      <polygon
        key={levelIndex}
        points={points}
        fill="none"
        stroke="rgba(148, 163, 184, 0.25)"
        strokeWidth={0.5}
      />
    );
  });

  // Assen (van centrum naar elke categorie)
  const axes = LABELS.map((_, i) => {
    const { x, y } = polarToCartesian(MAX_VALUE, i);
    return (
      <line
        key={i}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="rgba(148, 163, 184, 0.35)"
        strokeWidth={0.5}
      />
    );
  });

  // Waarden naar punten
  const valuePoints = values.map((v, i) => polarToCartesian(v, i));
  const valuePolygonPoints = valuePoints.map((p) => `${p.x},${p.y}`).join(" ");
  const valueNumberLabels = valuePoints.map((p, i) => (
    <text
      key={i}
      x={p.x}
      y={p.y - 10}
      fill="#e5e7eb"
      fontSize={10}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {values[i]}
    </text>
  ));

  // Label‑tekst buiten de buitenste ring
  const labelElements = LABELS.map((key, i) => {
    const displayLabel =
      key.charAt(0).toUpperCase() + key.slice(1); // hoofdletter aan begin
    const { x, y } = polarToCartesian(MAX_VALUE + 0.7, i); // iets buiten ring

    return (
      <text
        key={key}
        x={x}
        y={y}
        fill="#e5e7eb"
        fontSize={10}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {displayLabel}
      </text>
    );
  });

  // Puntjes op de uiteinden
  const pointElements = valuePoints.map((p, i) => (
    <circle
      key={i}
      cx={p.x}
      cy={p.y}
      r={3}
      fill="var(--primary-color, #FF6A00)"
      stroke="#000000"
      strokeWidth={1}
    />
  ));

  return (
    <div className="w-full minh-80 flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ opacity: 0.4 }}
      >
        <g>
          {gridPolygons[gridPolygons.length - 1]}
          <polygon
            points={valuePolygonPoints}
            fill="rgba(var(--primary-rgb, 255, 106, 0), 0.08)"
            stroke="var(--primary-color, #FF6A00)"
            strokeOpacity={0.6}
            strokeWidth={1.5}
          />
          {pointElements}
          {valueNumberLabels}
          {labelElements}
        </g>
      </svg>
    </div>
  );
}