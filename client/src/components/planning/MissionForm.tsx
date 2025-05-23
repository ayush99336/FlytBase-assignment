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
  // Ensure scheduledAt is properly handled as a date
  scheduledAt: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? null : new Date(val as string),
    z.date().optional().nullable()
  ),
  // Ensure droneId is treated as a number or null
  droneId: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? null : Number(val),
    z.number().optional().nullable()
  ),
  // Ensure flightPath is a valid GeoJSON object
  flightPath: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return { type: 'LineString', coordinates: [] };
        }
      }
      return val || { type: 'LineString', coordinates: [] };
    },
    z.any()
  ),
  // Ensure waypoints is always an array/object, not a string
  waypoints: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }
      return val ?? [];
    },
    z.any()
  ),
  // Ensure sensors is always an array
  sensors: z.array(z.string()).default([]),
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
      // Ensure scheduledAt is always an ISO string or null
      const formattedData = {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : null,
        droneId: typeof data.droneId === 'number' && !isNaN(data.droneId) ? data.droneId : null,
        area: typeof data.area === 'number' && !isNaN(data.area) ? data.area : 0,
        altitude: typeof data.altitude === 'number' && !isNaN(data.altitude) ? data.altitude : 80,
        speed: typeof data.speed === 'number' && !isNaN(data.speed) ? data.speed : 5,
        imageOverlap: typeof data.imageOverlap === 'number' && !isNaN(data.imageOverlap) ? data.imageOverlap : 75,
        patternType: data.patternType || 'Grid',
        dataFrequency: typeof data.dataFrequency === 'number' && !isNaN(data.dataFrequency) ? data.dataFrequency : 10,
        sensors: Array.isArray(data.sensors) ? data.sensors : [],
        waypoints: data.waypoints, // Already parsed by schema
        flightPath: (data.flightPath && typeof data.flightPath === 'object') ? data.flightPath : { type: 'LineString', coordinates: [] },
        status: data.status || 'Planned',
        missionType: data.missionType || 'Site Survey',
        location: data.location || '',
        name: data.name || '',
      };

      // DEBUG LOGGING: Output all data before sending
      console.log('MissionForm SUBMIT RAW DATA:', data);
      console.log('MissionForm SUBMIT formattedData:', formattedData);
      // Also log types for critical fields
      console.log('Types:', {
        scheduledAt: formattedData.scheduledAt,
        scheduledAtType: Object.prototype.toString.call(formattedData.scheduledAt),
        droneId: formattedData.droneId,
        droneIdType: typeof formattedData.droneId,
        area: formattedData.area,
        areaType: typeof formattedData.area,
        altitude: formattedData.altitude,
        altitudeType: typeof formattedData.altitude,
        speed: formattedData.speed,
        speedType: typeof formattedData.speed,
        imageOverlap: formattedData.imageOverlap,
        imageOverlapType: typeof formattedData.imageOverlap,
        patternType: formattedData.patternType,
        patternTypeType: typeof formattedData.patternType,
        dataFrequency: formattedData.dataFrequency,
        dataFrequencyType: typeof formattedData.dataFrequency,
        sensors: formattedData.sensors,
        sensorsType: Array.isArray(formattedData.sensors),
        waypoints: formattedData.waypoints,
        waypointsType: Array.isArray(formattedData.waypoints),
        flightPath: formattedData.flightPath,
        flightPathType: typeof formattedData.flightPath,
        status: formattedData.status,
        statusType: typeof formattedData.status,
        missionType: formattedData.missionType,
        missionTypeType: typeof formattedData.missionType,
        location: formattedData.location,
        locationType: typeof formattedData.location,
        name: formattedData.name,
        nameType: typeof formattedData.name,
      });

      const response = await apiRequest('POST', '/api/missions', formattedData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      
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
                    defaultValue={field.value ?? undefined}
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
                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                    onValueChange={(value) => {
                      // Convert empty string to undefined, otherwise convert to number
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border border-neutral-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                        <SelectValue placeholder="Select drone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDrones.length > 0 ? (
                        availableDrones.map(drone => (
                          <SelectItem key={drone.id} value={String(drone.id)}>
                            {drone.model} ({drone.serialNumber})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="py-2 px-2 text-sm text-muted-foreground">No available drones</div>
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
                        value={field.value === null || field.value === undefined ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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
                        value={field.value === null || field.value === undefined ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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
                        value={field.value === null || field.value === undefined ? '' : field.value}
                        onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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
                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                      onChange={(e) => {
                        // Convert string date to Date object
                        field.onChange(e.target.value ? new Date(e.target.value) : null);
                      }}
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
                    {/* Ensure flightPath is always a valid GeoJSON object */}
                    <Input 
                      type="hidden" 
                      {...field} 
                      onChange={(e) => {
                        let value;
                        try {
                          value = e.target.value ? JSON.parse(e.target.value) : { type: 'LineString', coordinates: [] };
                        } catch {
                          value = { type: 'LineString', coordinates: [] };
                        }
                        field.onChange(value);
                      }} 
                    />
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
                      value={field.value === null || field.value === undefined ? '' : field.value}
                      onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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
                  <div className="text-xs text-muted-foreground mt-1">
                    Leave empty or as <code>[]</code> unless you want to specify a custom path for the drone. Must be a valid JSON array of objects with <code>lat</code> and <code>lng</code>.
                  </div>
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
