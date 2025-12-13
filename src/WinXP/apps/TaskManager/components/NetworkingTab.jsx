import HistoryGraph from './HistoryGraph';

const GRID_SPACING_PX = 10;
const VALUE_SPACING_PX = 2;

export default function NetworkingTab({
  adapters,
  historyByAdapter,
  perfTick,
  selectedAdapterId,
  onSelectAdapterId,
}) {
  const selectedAdapter =
    adapters.find((adapter) => adapter.id === selectedAdapterId) ?? adapters[0] ?? null;
  const selectedId = selectedAdapter?.id ?? '';
  const graphSeries = selectedAdapter ? historyByAdapter[selectedAdapter.id] ?? [] : [];

  const gridScrollOffsetPx = (perfTick * VALUE_SPACING_PX) % GRID_SPACING_PX;

  return (
    <div className="tm-panel tm-networking">
      <div className="tm-network-title">{selectedAdapter?.name ?? 'Network Utilization'}</div>

      <div className="tm-network-graph-frame" role="group" aria-label="Network Utilization History">
        <div className="tm-network-axis" aria-hidden="true">
          <div>100%</div>
          <div>50%</div>
          <div>0%</div>
        </div>
        <HistoryGraph
          ariaLabel="Network Utilization History"
          series={[{ data: graphSeries, color: '#00ff00' }]}
          height={260}
          gridSpacing={GRID_SPACING_PX}
          valueSpacing={VALUE_SPACING_PX}
          gridScrollOffset={gridScrollOffsetPx}
        />
      </div>

      <div className="tm-list tm-network-table" role="group" aria-label="Network Adapters">
        <table className="tm-table">
          <thead>
            <tr>
              <th scope="col" className="tm-th">
                Adapter Name
              </th>
              <th scope="col" className="tm-th">
                Network Utilization
              </th>
              <th scope="col" className="tm-th">
                Link Speed
              </th>
              <th scope="col" className="tm-th">
                State
              </th>
            </tr>
          </thead>
          <tbody>
            {adapters.map((adapter) => (
              <tr
                key={adapter.id}
                className={`tm-row ${adapter.id === selectedId ? 'tm-row-selected' : ''}`}
                onClick={() => onSelectAdapterId(adapter.id)}
              >
                <td className="tm-td">{adapter.name}</td>
                <td className="tm-td tm-td-right">{adapter.utilizationPercent}%</td>
                <td className="tm-td tm-td-right">{adapter.linkSpeed}</td>
                <td className="tm-td">{adapter.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
