import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { useEffect } from "react";
import { initializeWebSocket } from "@/lib/websocket";

// Pages
import Dashboard from "@/pages/Dashboard";
import MissionPlanning from "@/pages/MissionPlanning";
import MissionMonitoring from "@/pages/MissionMonitoring";
import FleetManagement from "@/pages/FleetManagement";
import ReportsAnalytics from "@/pages/ReportsAnalytics";
import NotFound from "@/pages/not-found";
import Missions from "@/pages/Missions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/missions" component={Missions} />
      <Route path="/missions/plan" component={MissionPlanning} />
      <Route path="/missions/monitor" component={MissionMonitoring} />
      <Route path="/fleet" component={FleetManagement} />
      <Route path="/analytics" component={ReportsAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize WebSocket connection
  useEffect(() => {
    initializeWebSocket();
    // If initializeWebSocket returns a cleanup function in the future, add it here.
    return () => {};
  }, []);
  
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
