import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  isPositive?: boolean;
  showGradient?: boolean;
  strokeWidth?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 36,
  isPositive = true,
  showGradient = true,
  strokeWidth = 2,
  className = '',
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-slate-100 dark:bg-slate-800 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 3;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathData = `M ${points.join(' L ')}`;
  const strokeColor = isPositive ? '#089981' : '#F23645';
  const gradientId = `spark-grad-${Math.random().toString(36).substr(2, 9)}`;

  // Area fill points
  const firstX = padding;
  const lastX = width - padding;
  const areaData = `${pathData} L ${lastX},${height} L ${firstX},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      {showGradient && (
        <path d={areaData} fill={`url(#${gradientId})`} />
      )}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
