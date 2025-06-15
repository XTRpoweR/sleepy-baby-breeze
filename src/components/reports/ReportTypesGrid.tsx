
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

interface ReportTypesGridProps {
  reportTypes: Array<{
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    timeframe: string;
  }>;
  onGenerateReport: (reportId: string) => void;
  pdfLoading: boolean;
}

export const ReportTypesGrid: React.FC<ReportTypesGridProps> = ({
  reportTypes,
  onGenerateReport,
  pdfLoading,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    {reportTypes.map((report) => {
      const IconComponent = report.icon;
      return (
        <Card key={report.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
              <IconComponent className="h-6 w-6 text-teal-600" />
            </div>
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <p className="text-sm text-gray-600">{report.description}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {report.timeframe}
              </span>
            </div>
            <Button
              onClick={() => onGenerateReport(report.id)}
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={pdfLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {pdfLoading ? "Preparing..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

