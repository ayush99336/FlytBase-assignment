import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';
import SummaryStats from '@/components/reports/SummaryStats';
import PerformanceChart from '@/components/reports/PerformanceChart';
import MissionTypeChart from '@/components/reports/MissionTypeChart';
import MissionReports from '@/components/reports/MissionReports';
import OperationalEfficiency from '@/components/reports/OperationalEfficiency';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function ReportsAnalytics() {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = useState('30days');
  const analyticsRef = useRef<HTMLDivElement>(null);

  // Set active tab on component mount
  useEffect(() => {
    dispatch(uiActions.setActiveTab('reports'));
  }, [dispatch]);

  const handleExportPDF = async () => {
    if (!analyticsRef.current) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
    html2canvas(analyticsRef.current, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("analytics-report.pdf");
    });
  };

  return (
    <MainLayout
      title="Reports & Analytics"
      breadcrumbs={[
        { label: 'Reports', href: '/reports' }
      ]}
    >
      <div className="container mx-auto px-4 pb-6" ref={analyticsRef}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-neutral-600">Analyze mission performance and drone operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-neutral-700">Time Range:</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="bg-white border border-neutral-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-primary focus:border-primary w-[180px]">
                  <SelectValue placeholder="Last 30 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" className="flex items-center" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <SummaryStats />
        
        {/* Mission Performance Chart and Type Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Mission Performance Chart */}
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          
          {/* Mission Type Distribution */}
          <div>
            <MissionTypeChart />
          </div>
        </div>
        
        {/* Mission Reports and Operational Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mission Reports */}
          <div className="lg:col-span-2">
            <MissionReports />
          </div>
          
          {/* Operational Efficiency */}
          <div>
            <OperationalEfficiency />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ReportsAnalytics;
