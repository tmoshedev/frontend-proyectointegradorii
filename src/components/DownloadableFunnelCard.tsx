import React, { useCallback, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';

import FunnelReport, { LeadState } from './FunnelReport';

interface FunnelMetric {
  label: string;
  value: string;
  highlight?: boolean;
}

interface DownloadableFunnelCardProps {
  title: string;
  description?: string;
  leadStates: LeadState[];
  downloadFilename: string;
  downloadLabel?: string;
  footerTitle?: string;
  footerLines?: string[];
  metrics?: FunnelMetric[];
  effectiveness?: {
    label: string;
    percent: number;
    helperText?: string;
  };
}

const DEFAULT_DOWNLOAD_LABEL = 'Descargar PNG';

export default function DownloadableFunnelCard({
  title,
  description,
  leadStates,
  downloadFilename,
  downloadLabel = DEFAULT_DOWNLOAD_LABEL,
  footerTitle,
  footerLines,
  metrics,
  effectiveness,
}: DownloadableFunnelCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const hasFooter = footerTitle && footerLines?.length;
  const hasMetrics = metrics && metrics.length;
  const hasEffectiveness = effectiveness && Number.isFinite(effectiveness.percent);

  const footerList = useMemo(() => footerLines ?? [], [footerLines]);
  const effectivenessPercent = useMemo(() => {
    if (!hasEffectiveness) {
      return 0;
    }
    const raw = Number(effectiveness!.percent);
    if (!Number.isFinite(raw)) {
      return 0;
    }
    return Math.max(0, Math.min(raw, 150));
  }, [effectiveness, hasEffectiveness]);

  const handleDownload = useCallback(async () => {
    if (!containerRef.current) {
      return;
    }

    try {
      setDownloading(true);
      const dataUrl = await toPng(containerRef.current, {
        pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
        cacheBust: true,
        quality: 0.95,
        backgroundColor: '#ffffff',
        filter: node => !(node instanceof HTMLElement && node.dataset?.exportIgnore != null),
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = downloadFilename;
      link.click();
    } catch (error) {
      console.error('Error al descargar el embudo', error);
    } finally {
      setDownloading(false);
    }
  }, [downloadFilename]);

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body d-flex flex-column gap-3">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
          <div>
            <h6 className="mb-0">{title}</h6>
            {description && <small className="text-muted">{description}</small>}
          </div>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
            onClick={handleDownload}
            disabled={downloading}
            data-export-ignore
          >
            {!downloading && <Download size={16} />}
            {downloading ? 'Generando…' : downloadLabel}
          </button>
        </div>

        {hasMetrics && (
          <div className="row g-2">
            {metrics!.map(metric => (
              <div key={metric.label} className="col-12 col-md-4">
                <div className="p-2 rounded bg-light-subtle text-center">
                  <span className="d-block text-muted small">{metric.label}</span>
                  <strong className={metric.highlight ? 'text-success' : ''}>{metric.value}</strong>
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={containerRef} className="bg-white rounded p-2">
          <FunnelReport leadStates={leadStates} />
          {hasFooter && (
            <div className="pt-3">
              <h6 className="text-muted text-uppercase small mb-1">{footerTitle}</h6>
              <ul className="list-unstyled mb-0 small text-muted">
                {footerList.map(line => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {hasEffectiveness && (
          <div className="d-flex flex-column align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: 130,
                height: 130,
                background: `conic-gradient(#2563eb ${Math.min(effectivenessPercent, 100) * 3.6}deg, #e5e7eb 0deg)`,
              }}
            >
              <div
                className="bg-white rounded-circle d-flex flex-column align-items-center justify-content-center"
                style={{ width: 100, height: 100 }}
              >
                <strong className="fs-4 text-primary">{effectivenessPercent.toFixed(0)}%</strong>
                <small className="text-muted text-center">{effectiveness?.label}</small>
              </div>
            </div>
            {effectiveness?.helperText && <small className="text-muted text-center">{effectiveness.helperText}</small>}
          </div>
        )}
      </div>
    </div>
  );
}
