
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format, differenceInWeeks } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddMeasurementFormProps {
  babyId: string;
  birthDate: string;
  onAddMeasurement: (measurement: any) => void;
}

export const AddMeasurementForm = ({ babyId, birthDate, onAddMeasurement }: AddMeasurementFormProps) => {
  const [measurementDate, setMeasurementDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ageWeeks = differenceInWeeks(measurementDate, new Date(birthDate));
      
      const measurement = {
        baby_id: babyId,
        measurement_date: measurementDate.toISOString().split('T')[0],
        weight_kg: weight ? parseFloat(weight) : undefined,
        height_cm: height ? parseFloat(height) : undefined,
        head_circumference_cm: headCircumference ? parseFloat(headCircumference) : undefined,
        age_weeks: ageWeeks,
      };

      await onAddMeasurement(measurement);
      
      // Reset form
      setWeight('');
      setHeight('');
      setHeadCircumference('');
    } catch (error) {
      console.error('Error submitting measurement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add New Measurement</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Measurement Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !measurementDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {measurementDate ? format(measurementDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={measurementDate}
                    onSelect={(date) => date && setMeasurementDate(date)}
                    disabled={(date) => date > new Date() || date < new Date(birthDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 3.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 52.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headCircumference">Head Circumference (cm)</Label>
              <Input
                id="headCircumference"
                type="number"
                step="0.1"
                value={headCircumference}
                onChange={(e) => setHeadCircumference(e.target.value)}
                placeholder="e.g. 36.5"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || (!weight && !height && !headCircumference)}
            className="w-full"
          >
            {isSubmitting ? 'Adding...' : 'Add Measurement'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
