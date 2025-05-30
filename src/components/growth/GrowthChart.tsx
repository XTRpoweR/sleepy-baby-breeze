
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GrowthMeasurement } from '@/hooks/useBabyGrowth';
import { format } from 'date-fns';

interface GrowthChartProps {
  measurements: GrowthMeasurement[];
  metric: 'weight' | 'height' | 'head_circumference';
  title: string;
  unit: string;
  color: string;
}

export const GrowthChart = ({ measurements, metric, title, unit, color }: GrowthChartProps) => {
  const chartData = measurements
    .filter(m => {
      const value = metric === 'weight' ? m.weight_kg : 
                   metric === 'height' ? m.height_cm : 
                   m.head_circumference_cm;
      return value !== undefined && value !== null;
    })
    .map(measurement => ({
      date: format(new Date(measurement.measurement_date), 'MMM dd'),
      ageWeeks: measurement.age_weeks,
      value: metric === 'weight' ? measurement.weight_kg : 
             metric === 'height' ? measurement.height_cm : 
             measurement.head_circumference_cm,
      fullDate: measurement.measurement_date,
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No {title.toLowerCase()} measurements recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: unit, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`${value} ${unit}`, title]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${label} (${data.ageWeeks} weeks)`;
                  }
                  return label;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
