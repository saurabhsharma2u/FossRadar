import React, { useMemo } from 'react';

interface StarHistory {
  date: string;
  stars: number;
}

interface StarChartProps {
  history: StarHistory[];
}

export function StarChart({ history }: StarChartProps) {
  if (!history || history.length < 2) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
        <p style={{ fontWeight: 800 }}>Not enough history data for a star graph yet.</p>
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const padding = 40;

  const { points, minStars, maxStars, minDate, maxDate } = useMemo(() => {
    const stars = history.map((h) => h.stars);
    const dates = history.map((h) => new Date(h.date).getTime());
    
    const minS = Math.min(...stars);
    const maxS = Math.max(...stars);
    const minD = Math.min(...dates);
    const maxD = Math.max(...dates);

    const rangeS = maxS - minS || 1;
    const rangeD = maxD - minD || 1;

    const pts = history.map((h) => {
      const x = padding + ((new Date(h.date).getTime() - minD) / rangeD) * (width - 2 * padding);
      const y = height - padding - ((h.stars - minS) / rangeS) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return { points: pts, minStars: minS, maxStars: maxS, minDate: minD, maxDate: maxD };
  }, [history]);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Star Growth</h3>
        <span className="badge" style={{ background: 'var(--accent)', color: '#000' }}>
          +{maxStars - minStars} stars
        </span>
      </div>
      
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        {/* Grid lines */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="var(--border)"
          strokeWidth="3"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="var(--border)"
          strokeWidth="3"
        />

        {/* Labels */}
        <text
          x={padding}
          y={height - padding + 20}
          fill="currentColor"
          fontSize="12"
          fontWeight="900"
          textAnchor="start"
        >
          {formatDate(minDate)}
        </text>
        <text
          x={width - padding}
          y={height - padding + 20}
          fill="currentColor"
          fontSize="12"
          fontWeight="900"
          textAnchor="end"
        >
          {formatDate(maxDate)}
        </text>

        <text
          x={padding - 10}
          y={padding}
          fill="currentColor"
          fontSize="12"
          fontWeight="900"
          textAnchor="end"
          alignmentBaseline="middle"
        >
          {maxStars.toLocaleString()}
        </text>
        <text
          x={padding - 10}
          y={height - padding}
          fill="currentColor"
          fontSize="12"
          fontWeight="900"
          textAnchor="end"
          alignmentBaseline="middle"
        >
          {minStars.toLocaleString()}
        </text>

        {/* The Line */}
        <polyline
          fill="none"
          stroke="var(--primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          style={{ filter: 'drop-shadow(3px 3px 0px var(--border))' }}
        />
        
        {/* Shadow/Fill Area */}
        <path
          d={`M ${points} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
          fill="var(--primary)"
          style={{ opacity: 0.1 }}
        />
      </svg>
    </div>
  );
}
