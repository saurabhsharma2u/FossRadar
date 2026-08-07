import { useMemo } from 'react';

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
        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Not enough history data for a star graph yet.</p>
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
        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Star Growth</h3>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>
          +{ (maxStars - minStars).toLocaleString() } stars
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
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* Labels */}
        <text
          x={padding}
          y={height - padding + 18}
          fill="var(--text-muted)"
          fontSize="10"
          fontFamily="var(--font-mono)"
          textAnchor="start"
        >
          {formatDate(minDate)}
        </text>
        <text
          x={width - padding}
          y={height - padding + 18}
          fill="var(--text-muted)"
          fontSize="10"
          fontFamily="var(--font-mono)"
          textAnchor="end"
        >
          {formatDate(maxDate)}
        </text>

        <text
          x={padding - 8}
          y={padding}
          fill="var(--text-muted)"
          fontSize="10"
          fontFamily="var(--font-mono)"
          textAnchor="end"
          alignmentBaseline="middle"
        >
          {maxStars.toLocaleString()}
        </text>
        <text
          x={padding - 8}
          y={height - padding}
          fill="var(--text-muted)"
          fontSize="10"
          fontFamily="var(--font-mono)"
          textAnchor="end"
          alignmentBaseline="middle"
        >
          {minStars.toLocaleString()}
        </text>

        {/* The Line */}
        <polyline
          className="chart-polyline-animated"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        
        {/* Shadow/Fill Area */}
        <path
          className="chart-path-animated"
          d={`M ${points} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
          fill="var(--accent)"
        />
      </svg>
    </div>
  );
}
