/* eslint-disable @typescript-eslint/no-explicit-any */
import Stack from '@mui/material/Stack';
import {
  type PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ResponsiveContainer } from 'recharts';
import useIsMobile from '@lib/useIsMobile';

export default function ChartContainer({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);

  useLayoutEffect(() => {
    const updateSize = () => {
      setWidth(ref.current?.offsetWidth || 0);
      setHeight(ref.current?.offsetHeight || 0);
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <Stack
      ref={ref}
      width="100%"
      height="100%"
      minHeight={isMobile ? 300 : 500}
    >
      <Stack width={width} height={height}>
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </Stack>
    </Stack>
  );
}
