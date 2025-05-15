import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertMissionSchema } from '@shared/schema';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

// Extend the schema with more validations
const missionFormSchema = insertMissionSchema.extend({
  name: z.string().min(3, { message: "Mission name must be at least 3 characters long" }),
  location: z.string().min(3, { message: "Location must be specified" }),
  altitude: z.number().min(10, { message: "Minimum altitude is 10 meters" }).max(400, { message: "Maximum altitude is 400 meters" }),
  speed: z.number().min(1, { message: "Minimum speed is 1 m/s" }).max(20, { message: "Maximum speed is 20 m/s" }),
});

type MissionFormValues = z.infer<typeof missionFormSchema>;

interface MissionFormProps {
  surveyArea?: number;
  surveyAreaGeoJson?: any;
}

export function MissionForm({ surveyArea, surveyAreaGeoJson }: MissionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const drones = useSelector((state: RootState) => state.drones.drones);
  const availableDrones = drones.filter(drone => drone.status === 'Available');

  const defaultValues: Partial<MissionFormValues> = {
    name: '',
    missionType: 'Site Survey',
    status: 'Planned',
    location: '',
    area: surveyArea || 0,
    droneId: undefined,
    altitude: 80,
    speed: 5,
    imageOverlap: 75,
    patternType: 'Grid',
    flightPath: surveyAreaGeoJson || { type: 'LineString', coordinates: [] },
    dataFrequency: 10,
    sensors: [],
    waypoints: JSON.stringify([]),
  };

  const form = useForm<MissionFormValues>({
    resolver: zodResolver(missionFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: MissionFormValues) => {
    setIsSubmitting(true);
    try {
      // Parse waypoints JSON
      let parsedWaypoints = null;
      try {
        parsedWaypoints = data.waypoints ? JSON.parse(data.waypoints as any) : null;
      } catch {
        throw new Error('Invalid JSON in waypoints');
      }
      const formattedData = {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
        droneId: Number(data.droneId),
        dataFrequency: data.dataFrequency,
        sensors: data.sensors,
        waypoints: parsedWaypoints,
      };

      const response = await apiRequest('POST', '/api/missions', formattedData);
      const mission = await response.json();

      // Invalidate missions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/missions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/missions/active'] });

      toast({
        title: 'Mission Created',
        description: `Mission "${mission.name}" has been created successfully.`,
      });

      // Reset form
      form.reset(defaultValues);
    } catch (error: any) {
      console.error('Error creating mission:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create mission',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-300">
        <CardTitle className="font-medium">Mission Configuration</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Mission Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter mission name"
                      className="w-full border border-neutral-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="missionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Mission Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border border-neutral-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select mission type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Site Survey">Site Survey</SelectItem>
                      <SelectItem value="Building Inspection">Building Inspection</SelectItem>
                      <SelectItem value="Perimeter Security">Perimeter Security</SelectItem>
                      <SelectItem value="Construction Progress">Construction Progress</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="droneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Assigned Drone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border border-neutral-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select drone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDrones.length > 0 ? (
                        availableDrones.map(drone => (
                          <SelectItem key={drone.id} value={drone.id.toString()}>
                            {drone.model} ({drone.serialNumber})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No available drones</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Location Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., North Campus, San Francisco, CA"
                      className="w-full border border-neutral-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="altitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Flight Altitude</FormLabel>
                  <FormControl>
                    <div className="flex rounded-md shadow-sm">
                      <Input
                        type="number"
                        className="flex-1 border border-neutral-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        min={10}
                        max={400}
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                      <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-neutral-300 bg-neutral-200 text-neutral-700">meters</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="speed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Flight Speed</FormLabel>
                  <FormControl>
                    <div className="flex rounded-md shadow-sm">
                      <Input
                        type="number"
                        className="flex-1 border border-neutral-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        min={1}
                        max={20}
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                      <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-neutral-300 bg-neutral-200 text-neutral-700">m/s</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageOverlap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Image Overlap</FormLabel>
                  <FormControl>
                    <div className="flex rounded-md shadow-sm">
                      <Input
                        type="number"
                        className="flex-1 border border-neutral-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                        min={50}
                        max={90}
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                      <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-neutral-300 bg-neutral-200 text-neutral-700">%</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patternType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Flight Pattern</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border border-neutral-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select flight pattern" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Grid">Grid Pattern</SelectItem>
                      <SelectItem value="Perimeter">Perimeter Scan</SelectItem>
                      <SelectItem value="Crosshatch">Crosshatch Pattern</SelectItem>
                      <SelectItem value="Spiral">Spiral Pattern</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Schedule</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      className="w-full border border-neutral-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="flightPath"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Data Collection Frequency */}
            <FormField
              control={form.control}
              name="dataFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Data Frequency (sec)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sensors Selection */}
            <FormField
              control={form.control}
              name="sensors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Sensors to Use</FormLabel>
                  <div className="space-y-2">
                    {['RGB Camera','Thermal Camera','LiDAR','Multispectral'].map(sensor => (
                      <FormItem key={sensor} className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(sensor) || false}
                            onCheckedChange={checked => {
                              const vals = field.value || [];
                              field.onChange(
                                checked
                                  ? [...vals, sensor]
                                  : vals.filter(v => v !== sensor)
                              );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal text-neutral-700">{sensor}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Waypoints JSON */}
            <FormField
              control={form.control}
              name="waypoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Waypoints (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='[{"lat": 0, "lng": 0}]'
                      {...field}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-primary text-white font-medium py-2 px-4 rounded-md hover:bg-primary/90 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Mission'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default MissionForm;
