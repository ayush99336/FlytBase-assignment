import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { 
  Drone, Mission, MissionLog, Telemetry, 
  InsertMission, UpdateMissionStatus
} from '@shared/schema';

// Drones slice
interface DroneState {
  drones: Drone[];
  loading: boolean;
  error: string | null;
}

const initialDroneState: DroneState = {
  drones: [],
  loading: false,
  error: null
};

const droneSlice = createSlice({
  name: 'drones',
  initialState: initialDroneState,
  reducers: {
    setDrones: (state, action: PayloadAction<Drone[]>) => {
      state.drones = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateDrone: (state, action: PayloadAction<Drone>) => {
      const index = state.drones.findIndex(drone => drone.id === action.payload.id);
      if (index !== -1) {
        state.drones[index] = action.payload;
      }
    }
  }
});

// Missions slice
interface MissionState {
  missions: Mission[];
  activeMissions: Mission[];
  currentMission: Mission | null;
  loading: boolean;
  error: string | null;
}

const initialMissionState: MissionState = {
  missions: [],
  activeMissions: [],
  currentMission: null,
  loading: false,
  error: null
};

const missionSlice = createSlice({
  name: 'missions',
  initialState: initialMissionState,
  reducers: {
    setMissions: (state, action: PayloadAction<Mission[]>) => {
      state.missions = action.payload;
      state.loading = false;
      state.error = null;
    },
    setActiveMissions: (state, action: PayloadAction<Mission[]>) => {
      state.activeMissions = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentMission: (state, action: PayloadAction<Mission | null>) => {
      state.currentMission = action.payload;
    },
    updateMission: (state, action: PayloadAction<Mission>) => {
      // Update in missions array
      const index = state.missions.findIndex(mission => mission.id === action.payload.id);
      if (index !== -1) {
        state.missions[index] = action.payload;
      }
      
      // Update in activeMissions array if present
      const activeIndex = state.activeMissions.findIndex(mission => mission.id === action.payload.id);
      if (activeIndex !== -1) {
        if (action.payload.status === "In Progress") {
          state.activeMissions[activeIndex] = action.payload;
        } else {
          // Remove from active missions if not in progress
          state.activeMissions.splice(activeIndex, 1);
        }
      } else if (action.payload.status === "In Progress") {
        // Add to active missions if not there but status is in progress
        state.activeMissions.push(action.payload);
      }
      
      // Update current mission if it's the one being viewed
      if (state.currentMission && state.currentMission.id === action.payload.id) {
        state.currentMission = action.payload;
      }
    },
    addMission: (state, action: PayloadAction<Mission>) => {
      state.missions.push(action.payload);
      if (action.payload.status === "In Progress") {
        state.activeMissions.push(action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

// Telemetry slice
interface TelemetryState {
  telemetry: Record<number, Telemetry[]>; // Mapping of missionId to telemetry array
  loading: boolean;
  error: string | null;
}

const initialTelemetryState: TelemetryState = {
  telemetry: {},
  loading: false,
  error: null
};

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState: initialTelemetryState,
  reducers: {
    setTelemetry: (state, action: PayloadAction<{ missionId: number, telemetry: Telemetry[] }>) => {
      state.telemetry[action.payload.missionId] = action.payload.telemetry;
      state.loading = false;
      state.error = null;
    },
    addTelemetry: (state, action: PayloadAction<Telemetry>) => {
      const { missionId } = action.payload;
      if (!state.telemetry[missionId]) {
        state.telemetry[missionId] = [];
      }
      state.telemetry[missionId].unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

// Mission logs slice
interface MissionLogState {
  logs: Record<number, MissionLog[]>; // Mapping of missionId to logs array
  loading: boolean;
  error: string | null;
}

const initialMissionLogState: MissionLogState = {
  logs: {},
  loading: false,
  error: null
};

const missionLogSlice = createSlice({
  name: 'missionLogs',
  initialState: initialMissionLogState,
  reducers: {
    setMissionLogs: (state, action: PayloadAction<{ missionId: number, logs: MissionLog[] }>) => {
      state.logs[action.payload.missionId] = action.payload.logs;
      state.loading = false;
      state.error = null;
    },
    addMissionLog: (state, action: PayloadAction<MissionLog>) => {
      const { missionId } = action.payload;
      if (!state.logs[missionId]) {
        state.logs[missionId] = [];
      }
      state.logs[missionId].unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

// UI slice
interface UIState {
  activeTab: string;
  sidebarOpen: boolean;
}

const initialUIState: UIState = {
  activeTab: 'dashboard',
  sidebarOpen: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    }
  }
});

// Create the store
export const store = configureStore({
  reducer: {
    drones: droneSlice.reducer,
    missions: missionSlice.reducer,
    telemetry: telemetrySlice.reducer,
    missionLogs: missionLogSlice.reducer,
    ui: uiSlice.reducer
  }
});

// Export actions
export const droneActions = droneSlice.actions;
export const missionActions = missionSlice.actions;
export const telemetryActions = telemetrySlice.actions;
export const missionLogActions = missionLogSlice.actions;
export const uiActions = uiSlice.actions;

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
