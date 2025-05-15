import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { droneActions } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  model: z.string().min(1, { message: 'Model is required' }),
  serialNumber: z.string().min(1, { message: 'Serial number is required' }),
  batteryCapacity: z.coerce.number().min(1, { message: 'Battery capacity must be greater than 0' }),
  currentBatteryLevel: z.coerce.number().min(0, { message: 'Battery level cannot be negative' }).max(100, { message: 'Battery level cannot exceed 100%' }),
  status: z.string().min(1, { message: 'Status is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  flightHours: z.coerce.number().min(0, { message: 'Flight hours cannot be negative' }),
  healthStatus: z.string().optional(),
});

// Type for our form
type FormValues = z.infer<typeof formSchema>;

interface DroneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  drone?: any;
}

export function DroneFormModal({ isOpen, onClose, mode, drone }: DroneFormModalProps) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  // Initialize form with existing drone data if in edit mode
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'edit' && drone 
      ? {
          name: drone.name,
          model: drone.model,
          serialNumber: drone.serialNumber,
          batteryCapacity: drone.batteryCapacity,
          currentBatteryLevel: drone.currentBatteryLevel,
          status: drone.status,
          location: drone.location,
          flightHours: parseFloat(drone.flightHours),
          healthStatus: drone.healthStatus || '',
        }
      : {
          name: '',
          model: '',
          serialNumber: '',
          batteryCapacity: 0,
          currentBatteryLevel: 100,
          status: 'Available',
          location: '',
          flightHours: 0,
          healthStatus: '',
        }
  });
  
  const handleSubmit = async (values: FormValues) => {
    try {
      if (mode === 'add') {
        // Create new drone
        const response = await apiRequest('POST', '/api/drones', values);
        const newDrone = await response.json();
        
        dispatch(droneActions.updateDrone(newDrone));
        toast({ 
          title: 'Drone Added', 
          description: `${values.model} added to the fleet` 
        });
      } else if (mode === 'edit' && drone) {
        // Update existing drone
        await apiRequest('PATCH', `/api/drones/${drone.id}`, values);
        
        const updatedDrone = { ...drone, ...values };
        dispatch(droneActions.updateDrone(updatedDrone));
        toast({ 
          title: 'Drone Updated', 
          description: `${values.model} has been updated` 
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving drone:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save drone', 
        variant: 'destructive' 
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Drone' : 'Edit Drone'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Drone name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DJI Mavic Pro">DJI Mavic Pro</SelectItem>
                      <SelectItem value="DJI Mavic Air">DJI Mavic Air</SelectItem>
                      <SelectItem value="DJI Mavic Mini">DJI Mavic Mini</SelectItem>
                      <SelectItem value="Autel EVO II">Autel EVO II</SelectItem>
                      <SelectItem value="Skydio 2">Skydio 2</SelectItem>
                      <SelectItem value="Parrot Anafi">Parrot Anafi</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Serial number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batteryCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Battery Capacity (mAh)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentBatteryLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Battery Level (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="In Mission">In Mission</SelectItem>
                      <SelectItem value="Charging">Charging</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
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
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Drone location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="flightHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flight Hours</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="healthStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Status (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Health status notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'add' ? 'Add Drone' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default DroneFormModal;
