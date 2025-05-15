import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { droneActions } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DroneFormModal } from './DroneFormModal';
import { 
  getBatteryLevelColor, 
  getStatusColor, 
  formatDate,
  formatDistance
} from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Download, 
  Plus, 
  List, 
  Grid, 
  Focus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function DroneTable() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const drones = useSelector((state: RootState) => state.drones.drones);
  const loading = useSelector((state: RootState) => state.drones.loading);
  const error = useSelector((state: RootState) => state.drones.error);
  const missions = useSelector((state: RootState) => state.missions.missions);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [showModal, setShowModal] = useState<null | { mode: 'add' | 'edit', drone?: any }>(null);
  const itemsPerPage = 6;

  // Fetch drones on component mount
  useEffect(() => {
    const fetchDrones = async () => {
      try {
        dispatch(droneActions.setLoading(true));
        const response = await fetch('/api/drones');
        if (!response.ok) {
          throw new Error('Failed to fetch drones');
        }
        const data = await response.json();
        dispatch(droneActions.setDrones(data));
      } catch (error) {
        console.error('Error fetching drones:', error);
        dispatch(droneActions.setError('Failed to load drones'));
        toast({ 
          title: 'Error', 
          description: 'Failed to load drone fleet data', 
          variant: 'destructive' 
        });
      } finally {
        dispatch(droneActions.setLoading(false));
      }
    };

    fetchDrones();
  }, [dispatch, toast]);

  // --- ACTION HANDLERS ---
  const handleSetStatus = async (drone: any, status: string) => {
    try {
      const updated = { ...drone, status };
      await apiRequest('PATCH', `/api/drones/${drone.id}`, { status });
      dispatch(droneActions.updateDrone(updated));
      toast({ title: 'Status Updated', description: `${drone.model} set to ${status}` });
    } catch (e: any) {
      console.error('Error updating drone status:', e);
      toast({ 
        title: 'Error', 
        description: e.message || 'Failed to update status', 
        variant: 'destructive' 
      });
    }
  };
  
  const handleRecharge = async (drone: any) => {
    try {
      const updated = { ...drone, currentBatteryLevel: 100 };
      await apiRequest('PATCH', `/api/drones/${drone.id}`, { currentBatteryLevel: 100 });
      dispatch(droneActions.updateDrone(updated));
      toast({ title: 'Drone Recharged', description: `${drone.model} battery set to 100%` });
    } catch (e: any) {
      console.error('Error recharging drone:', e);
      toast({ 
        title: 'Error', 
        description: e.message || 'Failed to recharge drone', 
        variant: 'destructive' 
      });
    }
  };
  
  const handleRemove = async (drone: any) => {
    if (!window.confirm(`Remove drone ${drone.model}?`)) return;
    try {
      await apiRequest('DELETE', `/api/drones/${drone.id}`);
      dispatch(droneActions.setDrones(drones.filter((d: any) => d.id !== drone.id)));
      toast({ title: 'Drone Removed', description: `${drone.model} removed from fleet` });
    } catch (e: any) {
      console.error('Error removing drone:', e);
      toast({ 
        title: 'Error', 
        description: e.message || 'Failed to remove drone', 
        variant: 'destructive' 
      });
    }
  };
  
  const handleAddDrone = () => {
    setShowModal({ mode: 'add' });
  };
  
  const handleEdit = (drone: any) => {
    setShowModal({ mode: 'edit', drone });
  };
  
  // Filter drones based on search term and filters
  const filteredDrones = drones.filter(drone => {
    const matchesSearch = 
      searchTerm === '' || 
      drone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drone.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drone.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModel = 
      modelFilter === 'all' || 
      drone.model.toLowerCase().includes(modelFilter.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      drone.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesModel && matchesStatus;
  });
  
  // Paginate results
  const totalPages = Math.ceil(filteredDrones.length / itemsPerPage);
  const displayedDrones = filteredDrones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Get last mission for a drone
  const getLastMission = (droneId: number) => {
    const droneMissions = missions
      .filter(mission => mission.droneId === droneId)
      .sort((a, b) => {
        // Sort by completedAt or startedAt, newest first
        const dateA = a.completedAt || a.startedAt || a.createdAt;
        const dateB = b.completedAt || b.startedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    
    return droneMissions[0] || null;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-neutral-300 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search drones..."
              className="w-full bg-neutral-200 border border-neutral-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-neutral-500 h-4 w-4" />
          </div>
          
          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="bg-neutral-200 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary w-[160px]">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="DJI Mavic">DJI Mavic Series</SelectItem>
              <SelectItem value="Autel EVO">Autel EVO Series</SelectItem>
              <SelectItem value="Skydio">Skydio Series</SelectItem>
              <SelectItem value="Parrot">Parrot Series</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-neutral-200 border border-neutral-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in mission">In Mission</SelectItem>
              <SelectItem value="charging">Charging</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="default" className="ml-auto" onClick={() => handleAddDrone()}>
          <Plus className="h-4 w-4 mr-1" /> Add Drone
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading drone fleet data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  dispatch(droneActions.setError(''));
                  dispatch(droneActions.setLoading(true));
                  // Re-fetch drones
                  fetch('/api/drones')
                    .then(res => res.json())
                    .then(data => {
                      dispatch(droneActions.setDrones(data));
                      dispatch(droneActions.setLoading(false));
                    })
                    .catch(err => {
                      console.error(err);
                      dispatch(droneActions.setError('Failed to load drones'));
                      dispatch(droneActions.setLoading(false));
                    });
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : viewType === 'list' ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-200">
                <TableRow>
                  <TableHead className="text-neutral-700">Focus</TableHead>
                  <TableHead className="text-neutral-700">Status</TableHead>
                  <TableHead className="text-neutral-700">Battery</TableHead>
                  <TableHead className="text-neutral-700">Location</TableHead>
                  <TableHead className="text-neutral-700">Last Mission</TableHead>
                  <TableHead className="text-neutral-700">Flight Hours</TableHead>
                  <TableHead className="text-right text-neutral-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedDrones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No drones found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedDrones.map((drone) => {
                    const lastMission = getLastMission(drone.id);
                    return (
                      <TableRow key={drone.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-neutral-200 rounded-full flex items-center justify-center">
                              <Focus className="h-5 w-5 text-neutral-700" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{drone.model}</div>
                              <div className="text-xs text-neutral-500">ID: {drone.serialNumber}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(drone.status)}`}>
                            {drone.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-16 bg-neutral-300 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${getBatteryLevelColor(drone.currentBatteryLevel)}`} 
                                style={{ width: `${drone.currentBatteryLevel}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{drone.currentBatteryLevel}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{drone.location.split(',')[0]}</div>
                          <div className="text-xs text-neutral-500">
                            {drone.location.split(',').slice(1).join(',').trim()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lastMission ? (
                            <>
                              <div className="text-sm">{lastMission.name}</div>
                              <div className="text-xs text-neutral-500">
                                {lastMission.status === 'In Progress' 
                                  ? 'In progress' 
                                  : lastMission.completedAt 
                                    ? formatDate(lastMission.completedAt) 
                                    : formatDate(lastMission.createdAt)}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-neutral-500">No missions</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {parseFloat(drone.flightHours).toFixed(1)} hours
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="link" className="text-primary hover:text-primary-dark">Actions</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSetStatus(drone, 'Available')}>Set as Available</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetStatus(drone, 'Charging')}>Set as Charging</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetStatus(drone, 'On Mission')}>Set as On Mission</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetStatus(drone, 'Maintenance')}>Set as Maintenance</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetStatus(drone, 'Terminated')}>Set as Terminated</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRecharge(drone)}>Recharge Battery</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(drone)}>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRemove(drone)} className="text-red-600">Remove Drone</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {displayedDrones.length === 0 ? (
              <div className="col-span-full text-center py-6 text-neutral-500">
                No drones found matching your filters
              </div>
            ) : (
              displayedDrones.map(drone => {
                const lastMission = getLastMission(drone.id);
                return (
                  <Card key={drone.id} className="overflow-hidden">
                    <CardHeader className="p-4 flex flex-row items-center space-x-4">
                      <div className="h-12 w-12 bg-neutral-200 rounded-full flex items-center justify-center">
                        <Focus className="h-6 w-6 text-neutral-700" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">{drone.model}</CardTitle>
                        <p className="text-xs text-neutral-500">ID: {drone.serialNumber}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Status</span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(drone.status)}`}>
                          {drone.status}
                        </span>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Battery</span>
                          <span>{drone.currentBatteryLevel}%</span>
                        </div>
                        <Progress 
                          value={drone.currentBatteryLevel} 
                          className="h-2 bg-neutral-300"
                          indicatorClassName={getBatteryLevelColor(drone.currentBatteryLevel)}
                        />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Location</div>
                        <div className="text-neutral-600">{drone.location}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Last Mission</div>
                        <div className="text-neutral-600">
                          {lastMission ? lastMission.name : 'No missions'}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">Flight Hours</div>
                        <div className="text-neutral-600">{parseFloat(drone.flightHours).toFixed(1)} hours</div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end">
                      <Button variant="outline" size="sm">View Details</Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-6 py-3 border-t border-neutral-300 bg-neutral-200 flex items-center justify-between">
        <div className="text-sm text-neutral-700">
          Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, filteredDrones.length)}
          </span>{' '}
          of <span className="font-medium">{filteredDrones.length}</span> drones
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          {totalPages > 3 && currentPage < totalPages && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardFooter>
      
      {/* Drone Form Modal */}
      {showModal && (
        <DroneFormModal
          isOpen={!!showModal}
          onClose={() => setShowModal(null)}
          mode={showModal.mode}
          drone={showModal.drone}
        />
      )}
    </Card>
  );
}

export default DroneTable;
