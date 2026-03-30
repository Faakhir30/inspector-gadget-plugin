import { Icon } from '@iconify/react';
import { DateLabel, Loader, Table } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import K8s from '@kinvolk/headlamp-plugin/lib/K8s';
import { getCluster } from '@kinvolk/headlamp-plugin/lib/Utils';
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getVisibleFieldNames, HEADLAMP_KEY, HEADLAMP_METRIC_UNIT, HEADLAMP_VALUE, IS_METRIC } from '../common/helpers';
import { IGNotFound } from '../common/NotFound';
import { useGadgetConn, isIGInstalled } from './conn';
import { enrichBpfstatsRowWithGadgetInstances, isIGPod } from './helper';
import { processGadgetData } from './utility';

/** Official bpfstats gadget image (see https://inspektor-gadget.io/docs/latest/gadgets/bpfstats) */
export const BPFSTATS_GADGET_IMAGE = 'ghcr.io/inspektor-gadget/gadget/bpfstats';

const noopSetGadgetData: Dispatch<SetStateAction<Record<string, unknown>>> = () => {};

function BpfStatsTable({
  dataSourceID,
  dataColumns,
  gadgetData,
  loading,
}: {
  dataSourceID: string | number;
  dataColumns: Record<string, string[]>;
  gadgetData: Record<string, unknown[]>;
  loading: boolean;
}) {
  const fields = useMemo(() => {
    const cols = dataColumns?.[dataSourceID] || [];
    return cols.map(column => ({
      header: column,
      accessorFn: (row: Record<string, unknown>) =>
        column === 'timestamp' ? <DateLabel date={row[column] as string} /> : row[column],
    }));
  }, [dataSourceID, dataColumns]);

  if (!fields.length) {
    return null;
  }

  const rows = gadgetData[dataSourceID] || [];
  if (!loading && rows.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={2}>
        <Icon icon="mdi:chart-line-variant" width="2em" height="2em" />
        <Typography variant="body2" color="text.secondary">
          No rows yet. Stats appear as the gadget streams data from the node.
        </Typography>
      </Box>
    );
  }

  return (
    <Table
      columns={fields}
      data={rows}
      loading={loading}
      emptyMessage={
        <Typography variant="body2" color="text.secondary">
          Waiting for bpfstats data…
        </Typography>
      }
    />
  );
}

/**
 * Live eBPF / gadget resource view using the bpfstats gadget (RFE #15).
 * Uses the Inspektor Gadget pod on the selected node (WASM + port-forward, same as other gadgets).
 */
export default function BpfStatsPage() {
  const cluster = getCluster();
  const [pods] = K8s.ResourceClasses.Pod.useList();
  const [nodes] = K8s.ResourceClasses.Node.useList();
  const [selectedNode, setSelectedNode] = useState('');
  const [dataColumns, setDataColumns] = useState<Record<string, string[]>>({});
  const [dataSources, setDataSources] = useState<Array<{ id?: string; name?: string }>>([]);
  const [, setGadgetConfig] = useState<unknown>(null);
  const [bufferedGadgetData, setBufferedGadgetData] = useState<Record<string, unknown[]>>({});
  const [isGadgetInfoFetched, setIsGadgetInfoFetched] = useState(false);
  const dataColumnsRef = useRef(dataColumns);
  /** Same pool as Gadgets table (BackgroundRunning): localStorage + listGadgetInstances */
  const gadgetInstancesRef = useRef<
    Array<{
      id?: string;
      name?: string;
      imageName?: string;
      gadgetConfig?: { imageName?: string };
      cluster?: string;
    }>
  >([]);

  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    dataColumnsRef.current = dataColumns;
  }, [dataColumns]);

  const nodesWithIg = useMemo(() => {
    if (!nodes || !pods) return [] as string[];
    return nodes
      .filter(n =>
        pods.some(
          p => p.spec?.nodeName === n.metadata?.name && isIGPod(p.jsonData)
        )
      )
      .map(n => n.metadata.name);
  }, [nodes, pods]);

  useEffect(() => {
    if (nodesWithIg.length === 0) return;
    setSelectedNode(prev => (prev && nodesWithIg.includes(prev) ? prev : nodesWithIg[0]));
  }, [nodesWithIg]);

  const ig = useGadgetConn(selectedNode, pods);

  useEffect(() => {
    if (!ig) return;

    const local = JSON.parse(localStorage.getItem('headlamp_embeded_resources') || '[]');

    ig.listGadgetInstances(
      (remote: any[]) => {
        let filtered = (remote || []).filter(
          (rit: any) => !local.some((l: any) => l.id === rit.id)
        );
        filtered = filtered.map((fI: any) => ({
          id: fI.id,
          name: fI.name || fI.gadgetConfig?.imageName || 'Unnamed Gadget',
          imageName: fI.gadgetConfig?.imageName,
          gadgetConfig: fI.gadgetConfig,
          cluster: getCluster(),
        }));
        gadgetInstancesRef.current = [...local, ...filtered];
      },
      () => {
        gadgetInstancesRef.current = local;
      }
    );
  }, [ig]);

  const prepareGadgetInfo = useCallback((info: any) => {
    setIsGadgetInfoFetched(true);
    const fields: Record<string, string[]> = {};
    const imageName = BPFSTATS_GADGET_IMAGE;
    const getVisibilityOverrides =
      typeof window !== 'undefined'
        ? (key: string) => {
            try {
              const c = JSON.parse(window.localStorage.getItem('ig-configuration') || '{}');
              const v = c[key];
              return Array.isArray(v) ? v : undefined;
            } catch {
              return undefined;
            }
          }
        : undefined;

    const sources = info?.dataSources ?? [];
    sources.forEach((dataSource: any, index: number) => {
      const ds = {
        ...dataSource,
        name: dataSource.name ?? `datasource-${index}`,
      };
      const annotations = ds.annotations;
      const isMetricAnnotationAvailable =
        annotations &&
        Object.keys(annotations).find(
          (k: string) => k === 'metrics.print' && annotations[k] === 'true'
        );

      if (isMetricAnnotationAvailable) {
        const fieldsFromDataSource = [...getVisibleFieldNames(ds, { imageName, getVisibilityOverrides })];
        const key = ds.fields?.find((f: any) => f.tags?.includes('role:key'))?.fullName;
        const value = ds.fields?.find((f: any) => !f.tags?.includes('role:key'));
        const metricUnit = value?.annotations?.['metrics.unit'];
        fieldsFromDataSource.push(`${HEADLAMP_KEY}_${key}`);
        fieldsFromDataSource.push(`${HEADLAMP_VALUE}_${value?.fullName}`);
        fieldsFromDataSource.push(`${HEADLAMP_METRIC_UNIT}_${metricUnit}`);
        fieldsFromDataSource.push(IS_METRIC);
        fields[ds.id ?? index] = fieldsFromDataSource;
      } else {
        fields[ds.id ?? index] = getVisibleFieldNames(ds, {
          imageName,
          getVisibilityOverrides,
        });
      }
    });

    setGadgetConfig(info);
    setDataSources(sources as Array<{ id?: string; name?: string }>);
    setDataColumns({ ...fields });
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let stopHandle: { stop?: () => void } | null = null;

    if (!ig || !selectedNode) {
      return () => {
        mounted = false;
      };
    }

    setBufferedGadgetData({});
    setDataColumns({});
    setDataSources([]);
    setIsGadgetInfoFetched(false);
    setError(null);

    timeoutId = setTimeout(() => {
      if (!mounted || !ig) return;

      stopHandle = ig.runGadget(
        {
          imageName: BPFSTATS_GADGET_IMAGE,
          version: 1,
          paramValues: {},
        },
        {
          onGadgetInfo: info => {
            if (mounted) prepareGadgetInfo(info);
          },
          onData: (dsID, dataFromGadget) => {
            if (!mounted) return;
            const batch = Array.isArray(dataFromGadget) ? dataFromGadget : [dataFromGadget];
            batch.forEach(data => {
              const row =
                data && typeof data === 'object'
                  ? (data as Record<string, unknown>)
                  : {};
              const enriched = enrichBpfstatsRowWithGadgetInstances(row, gadgetInstancesRef.current, cluster);
              processGadgetData(
                enriched,
                dsID,
                dataColumnsRef.current[dsID] || [],
                'bpfstats',
                noopSetGadgetData,
                setBufferedGadgetData
              );
            });
          },
          onReady: () => {},
          onDone: () => {},
          onError: (runErr: Error) => {
            if (mounted) setError(runErr);
          },
        },
        err => {
          if (mounted) setError(err instanceof Error ? err : new Error(String(err)));
        }
      ) as unknown as { stop?: () => void };
    }, 1000);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (stopHandle?.stop) stopHandle.stop();
    };
  }, [ig, selectedNode, prepareGadgetInfo]);

  if (pods === null || nodes === null) {
    return <Loader title="" />;
  }

  const igOk = isIGInstalled(pods);
  if (igOk === false) {
    return <IGNotFound />;
  }

  if (nodesWithIg.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            eBPF resource usage (bpfstats)
          </Typography>
          <Typography color="text.secondary">
            No Inspektor Gadget pods were found on any node. Deploy Inspektor Gadget as a DaemonSet so each node runs a
            gadget pod.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        eBPF resource usage
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Streams the{' '}
        <strong>bpfstats</strong> gadget ({BPFSTATS_GADGET_IMAGE}) for the selected node: CPU, run counts, map memory,
        and related fields. Same data as{' '}
        <code>kubectl gadget run bpfstats</code>; see{' '}
        <a href="https://inspektor-gadget.io/docs/latest/gadgets/bpfstats" target="_blank" rel="noreferrer">
          documentation
        </a>
        .
      </Typography>

      <FormControl sx={{ minWidth: 280, mb: 2 }} size="small">
        <InputLabel id="bpfstats-node-label">Node (gadget pod)</InputLabel>
        <Select
          labelId="bpfstats-node-label"
          value={selectedNode}
          label="Node (gadget pod)"
          onChange={e => setSelectedNode(e.target.value)}
        >
          {nodesWithIg.map(name => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!ig && selectedNode && (
        <Typography variant="body2" color="warning.main" paragraph>
          Connecting to Inspektor Gadget on this node… If this persists, check port-forward permissions and that the
          gadget pod is running.
        </Typography>
      )}

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.dark', color: 'error.contrastText' }}>
          <Typography variant="subtitle2">Gadget error</Typography>
          <Typography variant="body2">{error.message}</Typography>
        </Paper>
      )}

      {ig && selectedNode && !isGadgetInfoFetched && !error && (
        <Box sx={{ py: 2 }}>
          <Loader title="Starting bpfstats" />
        </Box>
      )}

      {dataSources.map((ds, index) => {
        const id = ds?.id ?? index;
        return (
          <Box key={`bpfstats-${id}`} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {ds.name || `Data source ${String(id)}`}
            </Typography>
            <BpfStatsTable
              dataSourceID={id}
              dataColumns={dataColumns}
              gadgetData={bufferedGadgetData}
              loading={!isGadgetInfoFetched}
            />
          </Box>
        );
      })}

      {isGadgetInfoFetched && dataSources.length === 0 && !error && (
        <Typography variant="body2" color="text.secondary">
          No data sources reported by the gadget.
        </Typography>
      )}
    </Box>
  );
}
