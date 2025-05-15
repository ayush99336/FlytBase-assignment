import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, missionActions } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Missions() {
  const dispatch = useDispatch();
  const missions = useSelector((state: RootState) => state.missions.missions);

  useEffect(() => {
    // Fetch all missions on mount
    const fetchMissions = async () => {
      try {
        const response = await fetch('/api/missions');
        const data = await response.json();
        dispatch(missionActions.setMissions(data));
      } catch (error) {
        // handle error
      }
    };
    fetchMissions();
  }, [dispatch]);

  return (
    <MainLayout title="All Missions" breadcrumbs={[{ label: 'Missions', href: '/missions' }]}> 
      <Card className="overflow-hidden">
        <CardHeader className="p-4 border-b border-neutral-300 flex justify-between items-center">
          <CardTitle className="font-medium">Mission List</CardTitle>
          <Link href="/missions/plan">
            <Button className="bg-primary text-white">Plan New Mission</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-200">
                <TableRow>
                  <TableHead className="text-neutral-700">Name</TableHead>
                  <TableHead className="text-neutral-700">Type</TableHead>
                  <TableHead className="text-neutral-700">Status</TableHead>
                  <TableHead className="text-neutral-700">Location</TableHead>
                  <TableHead className="text-neutral-700">Drone</TableHead>
                  <TableHead className="text-neutral-700">Progress</TableHead>
                  <TableHead className="text-right text-neutral-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No missions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  missions.map(mission => (
                    <TableRow key={mission.id}>
                      <TableCell>{mission.name}</TableCell>
                      <TableCell>{mission.missionType}</TableCell>
                      <TableCell>{mission.status}</TableCell>
                      <TableCell>{mission.location}</TableCell>
                      <TableCell>{mission.droneId || 'Unassigned'}</TableCell>
                      <TableCell>{mission.progress}%</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/monitor?mission=${mission.id}`}>
                          <Button variant="link" className="text-primary hover:text-primary-dark">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
