
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useBabyGrowth } from '@/hooks/useBabyGrowth';
import { GrowthChart } from './GrowthChart';
import { AddMeasurementForm } from './AddMeasurementForm';

interface BabyGrowthTrackerProps {
  babyId: string;
  babyName: string;
  birthDate: string;
}

export const BabyGrowthTracker = ({ babyId, babyName, birthDate }: BabyGrowthTrackerProps) => {
  const { measurements, isLoading, addMeasurement, calculatePercentiles } = useBabyGrowth(babyId);

  const latestMeasurement = measurements[measurements.length - 1];
  const previousMeasurement = measurements[measurements.length - 2];

  const getGrowthTrend = (current?: number, previous?: number) => {
    if (!current || !previous) return null;
    const change = current - previous;
    if (Math.abs(change) < 0.1) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Growth Tracker for {babyName}</h2>
        {latestMeasurement && (
          <Badge variant="outline">
            {measurements.length} measurement{measurements.length !== 1 ? 's' : ''} recorded
          </Badge>
        )}
      </div>

      <AddMeasurementForm
        babyId={babyId}
        birthDate={birthDate}
        onAddMeasurement={addMeasurement}
      />

      {latestMeasurement && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {latestMeasurement.weight_kg && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Latest Weight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{latestMeasurement.weight_kg} kg</span>
                  {getTrendIcon(getGrowthTrend(latestMeasurement.weight_kg, previousMeasurement?.weight_kg))}
                </div>
                <p className="text-sm text-muted-foreground">
                  ~{Math.round(calculatePercentiles(latestMeasurement).weight || 0)}th percentile
                </p>
              </CardContent>
            </Card>
          )}

          {latestMeasurement.height_cm && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Latest Height</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{latestMeasurement.height_cm} cm</span>
                  {getTrendIcon(getGrowthTrend(latestMeasurement.height_cm, previousMeasurement?.height_cm))}
                </div>
                <p className="text-sm text-muted-foreground">
                  ~{Math.round(calculatePercentiles(latestMeasurement).height || 0)}th percentile
                </p>
              </CardContent>
            </Card>
          )}

          {latestMeasurement.head_circumference_cm && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Head Circumference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{latestMeasurement.head_circumference_cm} cm</span>
                  {getTrendIcon(getGrowthTrend(latestMeasurement.head_circumference_cm, previousMeasurement?.head_circumference_cm))}
                </div>
                <p className="text-sm text-muted-foreground">
                  ~{Math.round(calculatePercentiles(latestMeasurement).headCircumference || 0)}th percentile
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {measurements.length > 0 && (
        <Tabs defaultValue="weight" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="height">Height</TabsTrigger>
            <TabsTrigger value="head">Head Circumference</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weight">
            <GrowthChart
              measurements={measurements}
              metric="weight"
              title="Weight Over Time"
              unit="kg"
              color="#8884d8"
            />
          </TabsContent>
          
          <TabsContent value="height">
            <GrowthChart
              measurements={measurements}
              metric="height"
              title="Height Over Time"
              unit="cm"
              color="#82ca9d"
            />
          </TabsContent>
          
          <TabsContent value="head">
            <GrowthChart
              measurements={measurements}
              metric="head_circumference"
              title="Head Circumference Over Time"
              unit="cm"
              color="#ffc658"
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
