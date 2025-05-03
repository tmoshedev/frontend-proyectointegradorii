import * as React from 'react';

interface IconKanbanProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

const IconKanban = ({
  width = 40,       // tamaño predeterminado
  height = 40,
  className = 'icon-inmocloud',
  ...props
}: IconKanbanProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 142 142"
    fill="none"
    className={className}
    {...props}
  >
    <rect width={31} height={110} x={5.5} y={5.5} strokeWidth={11} rx={10.5} />
    <rect width={31} height={131} x={105.5} y={5.5} strokeWidth={11} rx={10.5} />
    <rect width={31} height={70} x={55.5} y={5.5} strokeWidth={11} rx={10.5} />
  </svg>
);

export default IconKanban;
