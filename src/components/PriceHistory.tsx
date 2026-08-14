import type { ApexAxisChartSeries, ApexOptions } from 'apexcharts';
import { motion, useReducedMotion } from 'framer-motion';
import { lazy, Suspense, useMemo } from 'react';

import type { PricePoint, PriceRange } from '../hooks/usePriceHistory';

const Chart = lazy(() => import('react-apexcharts'));

type PriceHistoryProps = {
  id: string;
  data: PricePoint[];
  loading: boolean;
  error: boolean;
  range: PriceRange;
  onRangeChange: (range: PriceRange) => void;
};

const ranges: { value: PriceRange; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '1y', label: '1Y' },
];

const rangeDescriptions: Record<PriceRange, string> = {
  '24h': '24 hour history',
  '7d': '7 day history',
  '30d': '30 day history',
  '1y': '1 year history',
};

function Message({ children, error = false, role }: { children: React.ReactNode; error?: boolean; role?: 'status' }) {
  return <div className={`grid h-full place-items-center text-[0.82rem] ${error ? 'text-[#ffb6a1]' : 'text-muted'}`} role={role}>{children}</div>;
}

export function PriceHistory({ id, data, loading, error, range, onRangeChange }: PriceHistoryProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      className="overflow-hidden px-[22px] pb-[18px]"
      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={reduceMotion ? { duration: 0 } : undefined}
    >
      <div className="flex items-center justify-between border-t border-white/10 pt-[22px]">
        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] tracking-[0.1em] text-muted uppercase">{rangeDescriptions[range]}</span>
          <strong className="text-sm">Price movement</strong>
        </div>
        <div className="flex rounded-lg border border-white/10 bg-black/10 p-0.5" aria-label="Price history range">
          {ranges.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onRangeChange(option.value)}
              className={`rounded-md px-1.5 py-1 text-[0.6rem] font-bold tracking-[0.04em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-lime ${range === option.value ? 'bg-lime text-ink' : 'text-muted hover:text-white'}`}
              aria-pressed={range === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[220px] overflow-hidden">
        {loading && <Message role="status">Loading price history…</Message>}
        {error && <Message error>Price history is unavailable right now.</Message>}
        {!loading && !error && data.length === 0 && <Message>No price changes recorded in this period.</Message>}
        {data.length > 0 && <PriceChart data={data} range={range} />}
      </div>
    </motion.div>
  );
}

function PriceChart({ data, range }: { data: PricePoint[]; range: PriceRange }) {
  const options = useMemo<ApexOptions>(() => ({
    chart: {
      type: 'area',
      background: 'transparent',
      fontFamily: 'DM Sans, system-ui, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 450 },
    },
    colors: ['#d9ff4f'],
    dataLabels: { enabled: false },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.32, opacityTo: 0.02, stops: [0, 100] } },
    grid: { borderColor: 'rgba(255,255,255,0.08)', strokeDashArray: 4 },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      type: 'datetime',
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#91a198' }, datetimeUTC: false },
    },
    yaxis: {
      min: Math.floor(Math.min(...data.map((point) => point.price))),
      tickAmount: 4,
      labels: { style: { colors: '#91a198' }, formatter: (value) => `£${value.toFixed(2)}` },
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: range === '1y'
          ? 'dd MMM yyyy'
          : range === '24h'
            ? 'HH:mm'
            : 'dd MMM HH:mm',
      },
      y: { formatter: (value) => `£${value.toFixed(2)}` },
    },
  }), [data, range]);

  const series = useMemo<ApexAxisChartSeries>(() => [{
    name: 'Price',
    data: data.map((point) => [point.time, point.price] as [number, number]).sort((a, b) => a[0] - b[0]),
  }], [data]);

  return (
    <Suspense fallback={<Message>Preparing chart…</Message>}>
      <Chart options={options} series={series} type="area" height={220} />
    </Suspense>
  );
}
