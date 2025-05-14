import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { formatDate, formatDuration, formatArea, getStatusColor } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function MissionReports() {
  const missions = useSelector((state: RootState) => state.missions.missions);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    // Wait for DOM to render
    await new Promise((resolve) => setTimeout(resolve, 100));
    html2canvas(reportRef.current, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("mission-reports.pdf");
    });
  };

  // Get the most recent missions
  const recentMissions = [...missions]
    .sort((a, b) => {
      const dateA = a.completedAt || a.startedAt || a.createdAt;
      const dateB = b.completedAt || b.startedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 4);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-neutral-300 flex justify-between items-center">
        <CardTitle className="font-medium">Recent Mission Reports</CardTitle>
        <div className="flex gap-2">
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm">
            View All Reports
          </Button>
          <Button variant="outline" className="text-sm" onClick={handleExportPDF}>
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto" ref={reportRef}>
          <Table>
            <TableHeader className="bg-neutral-200">
              <TableRow>
                <TableHead className="text-neutral-700">Mission</TableHead>
                <TableHead className="text-neutral-700">Date</TableHead>
                <TableHead className="text-neutral-700">Duration</TableHead>
                <TableHead className="text-neutral-700">Area</TableHead>
                <TableHead className="text-neutral-700">Status</TableHead>
                <TableHead className="text-right text-neutral-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-neutral-300">
              {recentMissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No mission reports available
                  </TableCell>
                </TableRow>
              ) : (
                recentMissions.map(mission => (
                  <TableRow key={mission.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{mission.name}</div>
                      <div className="text-xs text-neutral-500">ID: MSN-{mission.id}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(mission.completedAt || mission.startedAt || mission.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDuration(mission.duration) || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatArea(mission.area)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(mission.status)}`}>
                        {mission.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" className="text-primary hover:text-primary-dark">
                        View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default MissionReports;
