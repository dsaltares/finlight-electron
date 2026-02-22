'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense, use } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { allReports } from '@/lib/reports';

type Props = {
  params: Promise<{ report: string }>;
};

export default function ReportDetailPage({ params }: Props) {
  const { report: reportKey } = use(params);
  const report = allReports[reportKey];

  if (!report) {
    notFound();
  }

  const ReportComponent = report.Component;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/insights"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-sm font-medium">{report.label}</h1>
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <ReportComponent />
      </Suspense>
    </div>
  );
}
