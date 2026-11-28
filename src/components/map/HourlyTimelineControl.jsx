import React, { useEffect, useState, useCallback } from 'react';

const PRESETS = [
  { id: 'all', label: 'All Day (24h)', hour: null, window: null },
  { id: 'morning', label: 'Morning Peak (08:00–10:00)', hour: null, window: [8, 10] },
  { id: 'evening', label: 'Evening Peak (17:00–20:00)', hour: null, window: [17, 20] },
];

function formatHour(hour) {
  if (hour === null || hour === undefined) return 'All Day (00:00–23:59)';
  return `${String(hour).padStart(2, '0')}:00`;
}

export default function HourlyTimelineControl({
  selectedHour = null,
  activeWindow = null,
  onTimeChange,
  hourlyTotals = null, // optional array of length 24 for mini sparkline/readout
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x or 2x

  const stepNextHour = useCallback(() => {
    onTimeChange?.((prev) => {
      const currentHour = typeof prev?.hour === 'number' ? prev.hour : -1;
      const nextHour = (currentHour + 1) % 24;
      return { preset: 'custom', hour: nextHour, window: null };
    });
  }, [onTimeChange]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const intervalMs = speed === 2 ? 400 : 800;
    const timerId = window.setInterval(stepNextHour, intervalMs);

    return () => window.clearInterval(timerId);
  }, [isPlaying, speed, stepNextHour]);

  const handleScrub = (e) => {
    setIsPlaying(false);
    const nextHour = Number(e.target.value);
    onTimeChange?.({ preset: 'custom', hour: nextHour, window: null });
  };

  const handlePresetClick = (preset) => {
    setIsPlaying(false);
    onTimeChange?.({
      preset: preset.id,
      hour: preset.hour,
      window: preset.window,
    });
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => {
      const nextPlaying = !prev;
      if (nextPlaying && typeof selectedHour !== 'number') {
        onTimeChange?.({ preset: 'custom', hour: 0, window: null });
      }
      return nextPlaying;
    });
  };

  const sliderValue = typeof selectedHour === 'number' ? selectedHour : 0;
  const activeCount =
    typeof selectedHour === 'number' && Array.isArray(hourlyTotals)
      ? hourlyTotals[selectedHour] ?? 0
      : null;

  return (
    <div className="hourly-timeline-control" role="region" aria-label="24-Hour Mobility Timeline">
      <div className="timeline-header">
        <div>
          <strong>24-Hour Footfall Timeline</strong>
          <span className="timeline-readout">
            {activeWindow
              ? `Window: ${formatHour(activeWindow[0])} – ${formatHour(activeWindow[1])}`
              : formatHour(selectedHour)}
          </span>
        </div>
        {activeCount !== null && (
          <span className="timeline-metric">{activeCount.toLocaleString()} pings</span>
        )}
      </div>

      <div className="timeline-scrubber-row">
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-pressed={isPlaying}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <input
          type="range"
          min={0}
          max={23}
          step={1}
          value={sliderValue}
          onChange={handleScrub}
          aria-label="Hour of day scrubber from 00:00 to 23:00"
        />

        <button
          type="button"
          onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
          title="Toggle playback speed"
        >
          {speed}x
        </button>
      </div>

      <div className="timeline-ticks" aria-hidden="true">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>

      <div className="timeline-presets">
        {PRESETS.map((preset) => {
          const isSelected =
            (preset.id === 'all' && selectedHour === null && !activeWindow) ||
            (preset.window &&
              Array.isArray(activeWindow) &&
              activeWindow[0] === preset.window[0] &&
              activeWindow[1] === preset.window[1]);

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset)}
              aria-pressed={isSelected}
              className={isSelected ? 'is-active' : ''}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}