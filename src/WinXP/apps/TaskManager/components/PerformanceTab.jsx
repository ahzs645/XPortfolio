import HistoryGraph from './HistoryGraph';
import UsageGauge from './UsageGauge';

const TOTAL_PHYSICAL_MEMORY_KB = 1048048;
const SYSTEM_CACHE_KB = 341228;

const KERNEL_TOTAL_KB = 80664;
const KERNEL_PAGED_KB = 63272;
const KERNEL_NONPAGED_KB = 17392;

const GRID_SPACING_PX = 10;
const VALUE_SPACING_PX = 2;

export default function PerformanceTab({
  cpuUsagePercent,
  cpuTotalHistoryByCore,
  cpuKernelHistoryByCore,
  perfTick,
  pageFileUsageMb,
  pageFileHistory,
  physicalMemoryPercent,
  upTime,
  processCount,
  commitChargeTotalMb,
  commitChargeLimitMb,
}) {
  const coreCount = cpuTotalHistoryByCore.length;
  const cpuHistoryColumns = coreCount <= 4 ? coreCount : 4;
  const cpuGridStyle =
    cpuHistoryColumns > 0
      ? { gridTemplateColumns: `repeat(${cpuHistoryColumns}, minmax(0, 1fr))` }
      : {};

  const gridScrollOffsetPx = (perfTick * VALUE_SPACING_PX) % GRID_SPACING_PX;

  // Dynamic heights based on core count - smaller for better fit
  const cpuHistoryHeightPx = coreCount <= 1 ? 80 : 60;
  const gaugeHeightPx = cpuHistoryHeightPx;

  const availablePhysicalMemoryKb = Math.max(
    0,
    Math.round(TOTAL_PHYSICAL_MEMORY_KB * (1 - physicalMemoryPercent / 100)),
  );

  const commitChargeTotalKb = commitChargeTotalMb * 1024;
  const commitChargeLimitKb = commitChargeLimitMb * 1024;
  const commitChargePeakKb = Math.max(commitChargeTotalKb, Math.round(commitChargeTotalKb * 1.1));

  return (
    <div className="tm-panel tm-performance">
      <div className="tm-performance-layout">
        <div className="tm-perf-cell">
          <div className="tm-perf-label">CPU Usage</div>
          <div className="tm-gauge-wrap">
            <UsageGauge
              ariaLabel="CPU Usage"
              percent={cpuUsagePercent}
              width={50}
              height={gaugeHeightPx}
            />
          </div>
        </div>

        <div className="tm-perf-cell">
          <div className="tm-perf-label">CPU Usage History</div>
          {coreCount <= 1 ? (
            <HistoryGraph
              ariaLabel="CPU Usage History"
              series={[
                { data: cpuTotalHistoryByCore[0] ?? [], color: '#00ff00' },
                { data: cpuKernelHistoryByCore[0] ?? [], color: '#ff0000' },
              ]}
              height={cpuHistoryHeightPx}
              gridSpacing={GRID_SPACING_PX}
              valueSpacing={VALUE_SPACING_PX}
              gridScrollOffset={gridScrollOffsetPx}
            />
          ) : (
            <div className="tm-core-grid" style={cpuGridStyle}>
              {cpuTotalHistoryByCore.map((series, index) => (
                <HistoryGraph
                  key={index}
                  ariaLabel={`CPU ${index} Usage History`}
                    series={[
                      { data: series, color: '#00ff00' },
                      {
                        data: cpuKernelHistoryByCore[index] ?? [],
                        color: '#ff0000',
                      },
                    ]}
                    height={cpuHistoryHeightPx}
                    gridSpacing={GRID_SPACING_PX}
                    valueSpacing={VALUE_SPACING_PX}
                    gridScrollOffset={gridScrollOffsetPx}
                  />
                ))}
            </div>
          )}
        </div>

        <div className="tm-perf-cell">
          <div className="tm-perf-label">PF Usage</div>
          <div className="tm-gauge-wrap">
            <UsageGauge
              ariaLabel="PF Usage"
              percent={pageFileHistory[pageFileHistory.length - 1] ?? 0}
              label={`${pageFileUsageMb} MB`}
              width={50}
              height={gaugeHeightPx}
            />
          </div>
        </div>

        <div className="tm-perf-cell">
          <div className="tm-perf-label">Page File Usage History</div>
          <HistoryGraph
            ariaLabel="Page File Usage History"
            series={[{ data: pageFileHistory, color: '#00ff00' }]}
            height={cpuHistoryHeightPx}
            gridSpacing={GRID_SPACING_PX}
            valueSpacing={VALUE_SPACING_PX}
            gridScrollOffset={gridScrollOffsetPx}
          />
        </div>
      </div>

      <div className="tm-performance-stats">
        <fieldset className="tm-group">
          <legend>Totals</legend>
          <div className="tm-kv">
            <div className="tm-kv-row">
              <div className="tm-kv-key">Handles</div>
              <div className="tm-kv-value">27976</div>
            </div>
            <div className="tm-kv-row">
              <div className="tm-kv-key">Threads</div>
              <div className="tm-kv-value">734</div>
            </div>
            <div className="tm-kv-row">
              <div className="tm-kv-key">Processes</div>
              <div className="tm-kv-value">{processCount}</div>
            </div>
          </div>
        </fieldset>

        <fieldset className="tm-group">
          <legend>Commit Charge (K)</legend>
          <div className="tm-kv">
            <div className="tm-kv-row">
              <div className="tm-kv-key">Total</div>
              <div className="tm-kv-value">{commitChargeTotalKb.toLocaleString('en-US')}</div>
            </div>
            <div className="tm-kv-row">
              <div className="tm-kv-key">Limit</div>
              <div className="tm-kv-value">{commitChargeLimitKb.toLocaleString('en-US')}</div>
            </div>
            <div className="tm-kv-row">
              <div className="tm-kv-key">Peak</div>
              <div className="tm-kv-value">{commitChargePeakKb.toLocaleString('en-US')}</div>
            </div>
          </div>
        </fieldset>

        <fieldset className="tm-group">
          <legend>Physical Memory (K)</legend>
          <div className="tm-kv">
            <div className="tm-kv-row">
              <div className="tm-kv-key">Total</div>
              <div className="tm-kv-value">{TOTAL_PHYSICAL_MEMORY_KB.toLocaleString('en-US')}</div>
            </div>
            <div className="tm-kv-row">
              <div className="tm-kv-key">Available</div>
              <div className="tm-kv-value">
                {availablePhysicalMemoryKb.toLocaleString('en-US')}
              </div>
            </div>
            <div className="tm-kv-row">
              <div className="tm-kv-key">System Cache</div>
              <div className="tm-kv-value">{SYSTEM_CACHE_KB.toLocaleString('en-US')}</div>
            </div>
          </div>
        </fieldset>

        <fieldset className="tm-group">
          <legend>Kernel Memory (K)</legend>
          <div className="tm-kv">
            <div className="tm-kv-row">
              <div className="tm-kv-key">Total</div>
              <div className="tm-kv-value">{KERNEL_TOTAL_KB.toLocaleString('en-US')}</div>
            </div>
            <div className="tm-kv-row">
              <div className="tm-kv-key">Paged</div>
              <div className="tm-kv-value">{KERNEL_PAGED_KB.toLocaleString('en-US')}</div>
            </div>
            <div className="tm-kv-row">
              <div className="tm-kv-key">Nonpaged</div>
              <div className="tm-kv-value">{KERNEL_NONPAGED_KB.toLocaleString('en-US')}</div>
            </div>
          </div>
        </fieldset>
      </div>

      <div className="tm-performance-footer">
        <div>
          <span className="tm-muted">Up Time:</span> {upTime}
        </div>
      </div>
    </div>
  );
}
