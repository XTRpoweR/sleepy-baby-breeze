
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface GrowthMeasurement {
  id: string;
  baby_id: string;
  measurement_date: string;
  weight_kg?: number;
  height_cm?: number;
  head_circumference_cm?: number;
  age_weeks: number;
  created_at: string;
}

export interface GrowthPercentile {
  weight?: number;
  height?: number;
  headCircumference?: number;
}

export const useBabyGrowth = (babyId: string) => {
  const [measurements, setMeasurements] = useState<GrowthMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMeasurements = async () => {
    if (!babyId) return;
    
    try {
      // For now, use mock data since we don't have the growth_measurements table
      console.log('Would fetch measurements for baby:', babyId);
      setMeasurements([]);
    } catch (error) {
      console.error('Error fetching growth measurements:', error);
      toast({
        title: "Error",
        description: "Failed to load growth measurements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMeasurement = async (measurement: Omit<GrowthMeasurement, 'id' | 'created_at'>) => {
    try {
      // For now, simulate adding a measurement
      const newMeasurement: GrowthMeasurement = {
        ...measurement,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      
      setMeasurements(prev => [...prev, newMeasurement]);
      toast({
        title: "Success",
        description: "Growth measurement added successfully",
      });
      
      return newMeasurement;
    } catch (error) {
      console.error('Error adding measurement:', error);
      toast({
        title: "Error",
        description: "Failed to add measurement",
        variant: "destructive",
      });
      throw error;
    }
  };

  const calculatePercentiles = (measurement: GrowthMeasurement): GrowthPercentile => {
    // Simplified percentile calculation - in a real app, this would use WHO growth standards
    const ageWeeks = measurement.age_weeks;
    
    return {
      weight: measurement.weight_kg ? Math.min(95, Math.max(5, 50 + (measurement.weight_kg - 7) * 10)) : undefined,
      height: measurement.height_cm ? Math.min(95, Math.max(5, 50 + (measurement.height_cm - 50) * 2)) : undefined,
      headCircumference: measurement.head_circumference_cm ? Math.min(95, Math.max(5, 50 + (measurement.head_circumference_cm - 35) * 3)) : undefined,
    };
  };

  useEffect(() => {
    fetchMeasurements();
  }, [babyId]);

  return {
    measurements,
    isLoading,
    addMeasurement,
    calculatePercentiles,
    refetch: fetchMeasurements,
  };
};
