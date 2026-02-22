'use client';

import { IconAdjustments } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import ReportSettingsChips from '@/components/reports/ReportSettingsChips';
import ReportSettingsDialog from '@/components/reports/ReportSettingsDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useDialog from '@/hooks/use-dialog';
import useInsightsFilters from '@/hooks/useInsightsFilters';

export default function InsightsLayout({ children }: { children: ReactNode }) {
  const {
    open: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDialog();
  const { filterCount } = useInsightsFilters();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 flex-row items-center gap-2">
        <ReportSettingsChips />
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsOpen}
            className="relative"
          >
            <IconAdjustments className="size-5" />
            {filterCount > 0 && (
              <Badge className="absolute -top-1 -right-1 size-5 p-0 text-[10px]">
                {filterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">{children}</div>

      {isSettingsOpen && (
        <ReportSettingsDialog open={isSettingsOpen} onClose={onSettingsClose} />
      )}
    </div>
  );
}
