import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface InsightItem {
  type: 'positive' | 'neutral' | 'attention';
  text: string;
}

interface ClinicalInsightsProps {
  insights: InsightItem[];
}

export const ClinicalInsights = ({ insights }: ClinicalInsightsProps) => {
  if (insights.length === 0) return null;

  return (
    <div className="my-6 p-5 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-amber-700" />
        <h3 className="text-lg font-bold text-amber-900">Key Clinical Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.type === 'positive' ? CheckCircle : AlertCircle;
          const colorClass = insight.type === 'positive' 
            ? 'text-green-700 bg-green-100' 
            : insight.type === 'attention'
            ? 'text-orange-700 bg-orange-100'
            : 'text-blue-700 bg-blue-100';
          
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-1 rounded ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm text-gray-800 flex-1">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};