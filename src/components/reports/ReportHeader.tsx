import { format } from 'date-fns';
import { FileText } from 'lucide-react';

interface ReportHeaderProps {
  reportTitle: string;
  patientName: string;
  dateRange: { start: Date; end: Date };
  reportType: string;
}

export const ReportHeader = ({ reportTitle, patientName, dateRange, reportType }: ReportHeaderProps) => {
  return (
    <div className="mb-8 pb-6 border-b-2 border-gray-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-600 p-3 rounded-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{reportTitle}</h1>
            <p className="text-sm text-gray-600 mt-1">Pediatric Health Report</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Report Generated</p>
          <p className="font-semibold text-gray-900">{format(new Date(), 'MMM dd, yyyy')}</p>
          <p className="text-xs text-gray-500 mt-1">{format(new Date(), 'HH:mm')}</p>
        </div>
      </div>

      {/* Patient & Report Info */}
      <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Patient Name</p>
          <p className="text-lg font-bold text-gray-900">{patientName}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Report Type</p>
          <p className="text-lg font-bold text-gray-900">{reportType}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reporting Period</p>
          <p className="text-base font-semibold text-gray-900">
            {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Data Source</p>
          <p className="text-base font-semibold text-gray-900">Parent Tracking App</p>
        </div>
      </div>
    </div>
  );
};