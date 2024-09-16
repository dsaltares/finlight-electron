import stringToColor from 'string-to-color';
import { useTheme } from '@mui/material/styles';
import useIsMobile from '@lib/useIsMobile';

type Props = {
  x: number;
  y: number;
  cx: number;
  cy: number;
  name: string;
  percent: number;
  innerRadius: number;
  outerRadius: number;
  midAngle: number;
  formatValue?: (value: number | string) => string;
};

export default function PieLabel({
  x,
  y,
  cx,
  cy,
  name,
  percent,
  innerRadius,
  outerRadius,
  midAngle,
}: Props) {
  const isMobile = useIsMobile();
  const theme = useTheme();
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const innerX = cx + radius * Math.cos(-midAngle * RADIAN);
  const innerY = cy + radius * Math.sin(-midAngle * RADIAN);
  const color = stringToColor(name);
  return (
    <>
      <text
        x={innerX}
        y={innerY}
        fill={theme.palette.getContrastText(color)}
        textAnchor={innerX > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      {!isMobile && (
        <text
          x={x}
          y={y}
          fill={color}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {name}
        </text>
      )}
    </>
  );
}
