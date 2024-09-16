import IconButton from '@mui/material/IconButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { stringify } from 'csv-stringify/sync';

type Props<T> = {
  fileName: string;
  records: T[];
  columns: { key: keyof T; label: string }[];
  headers: boolean;
};

export default function DownloadCSVButton<T>({
  fileName,
  records,
  columns,
  headers = true,
}: Props<T>) {
  const handleDownload = () => {
    const csv = stringify(
      [
        headers ? columns.map((column) => column.label) : undefined,
        ...records.map((record) => columns.map((column) => record[column.key])),
      ].filter((line) => line !== undefined),
    );
    const element = document.createElement('a');
    element.setAttribute(
      'download',
      fileName.endsWith('.csv') ? fileName : `${fileName}.csv`,
    );
    element.setAttribute(
      'href',
      `data:text/csv;charset=utf-8, ${encodeURIComponent(csv)}`,
    );
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  return (
    <>
      <IconButton color="primary" onClick={handleDownload}>
        <FileDownloadIcon />
      </IconButton>
    </>
  );
}
