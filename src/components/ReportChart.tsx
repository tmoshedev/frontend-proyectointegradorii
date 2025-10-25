import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';

Chart.register(FunnelController, TrapezoidElement);
Chart.register(ChartDataLabels);

export interface ReportChartProps {
  type: 'funnel' | 'bar' | 'pie' | 'line';
  data: any;
  options?: any;
  title?: string;
  height?: number;
  maxWidth?: number | string;
  fullWidth?: boolean;
  className?: string;
  wrapperStyle?: React.CSSProperties;
  contentPadding?: number;
  colors?: string[];
  plugins?: any[];
  showDataLabels?: boolean;
  dataLabelFormatter?: (value: number, context: any) => string;
  enableDownload?: boolean;
  downloadFilename?: string;
  downloadLabel?: string;
  footerTitle?: string;
  footerLines?: string[];
  showFooterInline?: boolean;
}

const defaultColors = [
  'rgba(54, 162, 235, 0.5)',
  'rgba(75, 192, 192, 0.5)',
  'rgba(255, 206, 86, 0.5)',
  'rgba(255, 99, 132, 0.5)',
  'rgba(153, 102, 255, 0.5)',
  'rgba(255, 159, 64, 0.5)',
];

export default function ReportChart({
  type,
  data,
  options = {},
  title = '',
  height = 240,
  maxWidth = 720,
  fullWidth = false,
  className,
  wrapperStyle,
  contentPadding = 20,
  colors = defaultColors,
  plugins = [],
  showDataLabels = false,
  dataLabelFormatter,
  enableDownload = false,
  downloadFilename,
  downloadLabel = 'Descargar',
  footerTitle,
  footerLines,
  showFooterInline = false,
}: ReportChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const sanitizedFooterLines = useMemo(
    () =>
      Array.isArray(footerLines)
        ? footerLines
            .map(line => (typeof line === 'string' ? line.trim() : ''))
            .filter(line => line.length > 0)
        : [],
    [footerLines],
  );
  const hasFooterContent = Boolean(footerTitle) || sanitizedFooterLines.length > 0;

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const canvas = chartRef.current;

    if (height) {
      canvas.height = height;
      canvas.style.height = `${height}px`;
    } else {
      canvas.style.removeProperty('height');
      canvas.removeAttribute('height');
    }
    canvas.style.width = '100%';
    canvas.style.maxWidth = '100%';

    // Asigna colores si no están definidos
    if (data.datasets) {
      data.datasets = data.datasets.map((ds: any, i: number) => ({
        ...ds,
        backgroundColor: ds.backgroundColor || colors[i % colors.length],
      }));
    }
    const { plugins: customPlugins, ...restOptions } = options ?? {};
    const {
      legend: customLegend,
      title: customTitle,
      datalabels: customDatalabels,
      ...otherPlugins
    } = customPlugins ?? {};

    const resolvedOptions = {
      responsive: true,
      ...restOptions,
    } as any;

    resolvedOptions.plugins = {
      legend: { position: 'top', ...(customLegend ?? {}) },
      title: { display: !!title, text: title, ...(customTitle ?? {}) },
      ...otherPlugins,
    };

    if (showDataLabels) {
      resolvedOptions.plugins.datalabels = {
        color: '#1f2937',
        anchor: type === 'pie' ? 'center' : 'end',
        align: type === 'pie' ? 'center' : 'end',
        offset: type === 'pie' ? 0 : 4,
        font: { weight: '600', size: 11 },
        display: (context: any) => {
          const rawValue = Array.isArray(context?.dataset?.data)
            ? context.dataset.data[context.dataIndex]
            : context?.raw;
          const numeric = Number(rawValue ?? 0);
          if (!Number.isFinite(numeric) || numeric <= 0) {
            return false;
          }
          return true;
        },
        formatter: (value: number, context: any) => {
          if (typeof dataLabelFormatter === 'function') {
            return dataLabelFormatter(value, context);
          }
          if (typeof value === 'number' && Number.isFinite(value)) {
            return value.toLocaleString('es-PE');
          }
          return value;
        },
        clamp: true,
        ...customDatalabels,
      };
    } else if (customDatalabels) {
      resolvedOptions.plugins.datalabels = customDatalabels;
    }

    if (type === 'funnel' && !resolvedOptions.indexAxis) {
      resolvedOptions.indexAxis = 'y';
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: type as any,
      data,
      options: resolvedOptions,
      plugins,
    });
    return () => {
      chartInstance.current?.destroy();
    };
  }, [type, data, options, title, colors, plugins, height, showDataLabels, dataLabelFormatter]);

  const handleDownload = useCallback(async () => {
    const container = containerRef.current;
    const canvas = chartRef.current;
    if (!enableDownload || !container || !canvas) {
      return;
    }

    const exportIgnoreNodes = Array.from(container.querySelectorAll<HTMLElement>('[data-export-ignore]'));
    const originalButtonDisplay = exportIgnoreNodes.map(node => node.style.display);
    const restoreExportIgnoreNodes = () => {
      exportIgnoreNodes.forEach((node, index) => {
        node.style.display = originalButtonDisplay[index];
      });
    };
    const chartWrapper = canvas.parentElement as HTMLElement | null;

    let cleanup: (() => void) | null = null;
    try {
      setExporting(true);

      exportIgnoreNodes.forEach(node => {
        node.style.display = 'none';
      });

      if (chartInstance.current) {
        chartInstance.current.stop();
        chartInstance.current.update('none');
      }

      const chartDataUrl =
        chartInstance.current?.toBase64Image('image/png', 1) ?? canvas.toDataURL('image/png', 1);
      if (!chartDataUrl) {
        throw new Error('No se pudo generar la imagen del gráfico');
      }

      const chartImage = new Image();
      chartImage.src = chartDataUrl;
      chartImage.draggable = false;
      const canvasWidth = canvas.clientWidth || canvas.width;
      const canvasHeight = canvas.clientHeight || canvas.height;
      chartImage.style.width = `${canvasWidth}px`;
      chartImage.style.height = `${canvasHeight}px`;
      chartImage.style.display = 'block';
      chartImage.style.position = 'absolute';
      chartImage.style.top = '0';
      chartImage.style.left = '0';
      chartImage.style.pointerEvents = 'none';

      if (chartWrapper) {
        const originalWrapperPosition = chartWrapper.style.position;
        const originalCanvasVisibility = canvas.style.visibility;

        if (!chartWrapper.style.position || chartWrapper.style.position === 'static') {
          chartWrapper.style.position = 'relative';
        }

        canvas.style.visibility = 'hidden';
        chartWrapper.appendChild(chartImage);

        cleanup = () => {
          chartImage.remove();
          canvas.style.visibility = originalCanvasVisibility;
          chartWrapper.style.position = originalWrapperPosition;
          restoreExportIgnoreNodes();
        };
      } else {
        cleanup = () => {
          chartImage.remove();
          restoreExportIgnoreNodes();
        };
      }

      const waitForImage =
        typeof chartImage.decode === 'function'
          ? chartImage.decode().catch(() => undefined)
          : new Promise<void>(resolve => {
              chartImage.onload = () => resolve();
              chartImage.onerror = () => resolve();
            });

      await waitForImage;

      if ('fonts' in document && 'ready' in (document as any).fonts) {
        await (document as any).fonts.ready.catch(() => undefined);
      }

      const dataUrl = await toPng(container, {
        pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
        cacheBust: true,
        quality: 0.95,
        backgroundColor: '#ffffff',
        filter: node => !(node instanceof HTMLElement && node.dataset?.exportIgnore != null),
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = downloadFilename ?? `chart-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Error al descargar el gráfico', error);
    } finally {
      cleanup?.();
      if (!cleanup) {
        restoreExportIgnoreNodes();
      }
      setExporting(false);
    }
  }, [downloadFilename, enableDownload]);

  const resolvedMaxWidth = fullWidth
    ? '100%'
    : typeof maxWidth === 'number'
      ? `${maxWidth}px`
      : maxWidth ?? '100%';

  const computedMinHeight = height ? height + contentPadding * 2 : undefined;

  const renderHeader = useMemo(() => {
    if (!title && !enableDownload) {
      return null;
    }

    return (
      <div className="d-flex justify-content-between align-items-center" style={{ gap: 12 }}>
        {title ? <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3> : <span />}
        {enableDownload && (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
            onClick={handleDownload}
            disabled={exporting}
            data-export-ignore
          >
            {!exporting && <Download size={16} />}
            {exporting ? 'Generando…' : downloadLabel}
          </button>
        )}
      </div>
    );
  }, [enableDownload, handleDownload, title, downloadLabel, exporting]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        maxWidth: resolvedMaxWidth,
        margin: fullWidth ? '0' : '0 auto',
        background: '#fff',
        borderRadius: 12,
        padding: contentPadding,
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: computedMinHeight,
        ...wrapperStyle,
      }}
    >
      {renderHeader}
      <div style={{ flex: 1, minHeight: height ? `${height}px` : undefined }}>
        <canvas ref={chartRef}></canvas>
      </div>
      {showFooterInline && hasFooterContent && (
        <div className="border-top pt-2" style={{ marginTop: 4 }}>
          {footerTitle && (
            <small className="text-muted d-block fw-semibold" style={{ lineHeight: 1.2 }}>
              {footerTitle}
            </small>
          )}
          {sanitizedFooterLines.map((line, index) => (
            <small key={`${line}-${index}`} className="text-muted d-block" style={{ lineHeight: 1.2 }}>
              {line}
            </small>
          ))}
        </div>
      )}
    </div>
  );
}
