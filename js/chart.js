/**
 * Lightweight Interactive SVG Hourly Forecast Chart
 * Draws smooth temperature curves with area gradients, precipitation bars, and hover tooltips.
 */

export class HourlyChart {
  constructor(containerElement) {
    this.container = containerElement;
    this.hourlyData = null;
    this.unit = 'metric';
  }

  render(hourly, unit = 'metric') {
    if (!this.container || !hourly || !hourly.time) return;

    this.hourlyData = hourly;
    this.unit = unit;

    // Take first 24 hours
    const times = hourly.time.slice(0, 24);
    const temps = hourly.temperature_2m.slice(0, 24);
    const precipProbs = (hourly.precipitation_probability || []).slice(0, 24);

    if (temps.length === 0) return;

    const width = 800;
    const height = 180;
    const padding = { top: 35, bottom: 45, left: 30, right: 30 };

    const minTemp = Math.floor(Math.min(...temps)) - 2;
    const maxTemp = Math.ceil(Math.max(...temps)) + 2;
    const tempRange = Math.max(1, maxTemp - minTemp);

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = temps.map((t, idx) => {
      const x = padding.left + (idx / (temps.length - 1)) * chartW;
      const y = padding.top + chartH - ((t - minTemp) / tempRange) * chartH;
      return { x, y, temp: t, time: times[idx], prob: precipProbs[idx] || 0 };
    });

    // Generate smooth SVG bezier path
    const pathD = this.generateSmoothPath(points);
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

    const svg = `
      <svg class="hourly-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Hourly temperature chart for the next 24 hours">
        <defs>
          <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--chart-line)" stop-opacity="0.32" />
            <stop offset="100%" stop-color="var(--chart-line)" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Zero / guide lines -->
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="var(--border-subtle)" stroke-width="1" />

        <!-- Area fill under line -->
        <path d="${areaD}" fill="url(#tempAreaGrad)" />

        <!-- Curve path -->
        <path d="${pathD}" fill="none" stroke="var(--chart-line)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data points and time labels -->
        ${points.map((p, idx) => {
          // Show every 2nd or 3rd time label to avoid crowding
          const date = new Date(p.time);
          const hourStr = idx === 0 ? 'Now' : date.toLocaleTimeString([], { hour: 'numeric' });
          const showLabel = idx % 2 === 0;

          return `
            <g class="chart-point-group" data-index="${idx}">
              <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="var(--chart-dot)" stroke="var(--surface-card)" stroke-width="2" />
              
              <!-- Temperature label above dot -->
              <text x="${p.x.toFixed(1)}" y="${(p.y - 10).toFixed(1)}" text-anchor="middle" class="chart-temp-label">${Math.round(p.temp)}°</text>
              
              <!-- Time label at bottom -->
              ${showLabel ? `
                <text x="${p.x.toFixed(1)}" y="${height - 15}" text-anchor="middle" class="chart-time-label">${hourStr}</text>
              ` : ''}

              <!-- Rain probability badge if > 0 -->
              ${p.prob >= 20 ? `
                <rect x="${(p.x - 14).toFixed(1)}" y="${height - 38}" width="28" height="15" rx="4" fill="rgba(2, 132, 199, 0.15)" />
                <text x="${p.x.toFixed(1)}" y="${height - 27}" text-anchor="middle" class="chart-precip-label">${p.prob}%</text>
              ` : ''}
            </g>
          `;
        }).join('')}
      </svg>
    `;

    this.container.innerHTML = svg;
  }

  generateSmoothPath(points) {
    if (points.length === 0) return '';
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    return d;
  }
}
