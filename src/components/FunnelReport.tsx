import React, { useMemo } from 'react';

export interface LeadState {
	name: string;
	meta: number;
	real: number;
}

interface FunnelReportProps {
	leadStates: LeadState[];
	title?: string;
	options?: unknown;
}

const NUMBER_FORMATTER = new Intl.NumberFormat('es-PE');
const PERCENT_FORMATTER = new Intl.NumberFormat('es-PE', {
	style: 'percent',
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
});
const MIN_WIDTH_PERCENT = 60;
const MAX_WIDTH_PERCENT = 100;
const TRAPEZOID_OFFSET = 6; // reduce la base inferior para simular el triángulo invertido

const palette = ['#bfdbfe', '#a5b4fc', '#c4b5fd', '#fbcfe8', '#fcd34d', '#fbbf24', '#86efac', '#99f6e4'];

const computeStageWidth = (index: number, total: number) => {
	if (total <= 1) {
		return MAX_WIDTH_PERCENT;
	}

	const step = (MAX_WIDTH_PERCENT - MIN_WIDTH_PERCENT) / (total - 1);
	return MAX_WIDTH_PERCENT - step * index;
};

const wrapperStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '16px',
};

const titleStyle: React.CSSProperties = {
	fontSize: '1.25rem',
	fontWeight: 600,
	color: '#0f172a',
	margin: 0,
	textAlign: 'center',
};

const containerStyle: React.CSSProperties = {
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	gap: '20px',
};

const stageShapeBaseStyle: React.CSSProperties = {
	padding: '28px 36px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	minHeight: '96px',
	boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
};

const stageContentStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '6px',
	color: '#0f172a',
	textAlign: 'center',
};

const stageNameStyle: React.CSSProperties = {
	fontSize: '1.05rem',
	fontWeight: 700,
};

const stageValueStyle: React.CSSProperties = {
	fontSize: '1.05rem',
	fontWeight: 600,
};

const stageMetaStyle: React.CSSProperties = {
	fontSize: '0.85rem',
	color: '#1f2937',
};

export default function FunnelReport({ leadStates, title = 'Reporte de Embudo de Ventas' }: FunnelReportProps) {
	const safeLeadStates = useMemo(() => {
		if (leadStates.length > 0) {
			return leadStates;
		}
		return [{ name: 'Sin datos', meta: 1, real: 1 }];
	}, [leadStates]);

	const totalStages = safeLeadStates.length;

	return (
		<div style={wrapperStyle}>
			{title && <h3 style={titleStyle}>{title}</h3>}
			<div style={containerStyle}>
				{safeLeadStates.map((state, index) => {
					const width = computeStageWidth(index, totalStages);
					const color = palette[index % palette.length];
					const isLastStage = index === totalStages - 1;
					return (
						<div
							key={`${state.name}-${index}`}
							style={{
								width: `${width}%`,
								margin: '0 auto',
							}}
						>
							<div
								style={{
									...stageShapeBaseStyle,
									background: color,
									clipPath: isLastStage
									  ? 'polygon(0 0, 100% 0, 50% 200%)'
									  : `polygon(0 0, 100% 0, ${100 - TRAPEZOID_OFFSET}% 100%, ${TRAPEZOID_OFFSET}% 100%)`,
								}}
							>
								<div style={stageContentStyle}>
									<span style={stageNameStyle}>{state.name}</span>
									<span style={stageValueStyle}>{NUMBER_FORMATTER.format(Math.max(state.real, 0))} leads</span>
									{state.meta !== state.real && (
										<span style={stageMetaStyle}>
											Meta: {NUMBER_FORMATTER.format(Math.max(state.meta, 0))}
											{' · '}
											{state.meta > 0
												? PERCENT_FORMATTER.format(Math.max(state.real, 0) / state.meta)
												: '—'}
										</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
