import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "N/A";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${hours}h ${minutes}m`;
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters === null || meters === undefined) return "N/A";
  
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  } else {
    return `${(meters / 1000).toFixed(2)} km`;
  }
}

export function formatArea(squareMeters: number | null | undefined): string {
  if (squareMeters === null || squareMeters === undefined) return "N/A";
  
  if (squareMeters < 10000) {
    return `${squareMeters.toFixed(0)} m²`;
  } else {
    return `${(squareMeters / 10000).toFixed(2)} ha`;
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "in progress":
    case "available":
      return "bg-success/10 text-success";
    case "planned":
    case "upcoming":
    case "charging":
      return "bg-warning/10 text-warning";
    case "aborted":
    case "maintenance":
      return "bg-danger/10 text-danger";
    case "completed":
      return "bg-primary/10 text-primary";
    default:
      return "bg-neutral-500/10 text-neutral-700";
  }
}

export function getBatteryLevelColor(level: number): string {
  if (level >= 70) return "bg-success";
  if (level >= 30) return "bg-warning";
  return "bg-danger";
}

export function getMissionTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case "site survey":
      return "map";
    case "inspection":
    case "building inspection":
      return "search";
    case "security":
    case "perimeter security":
      return "shield";
    case "construction progress":
      return "hard-hat";
    default:
      return "drone";
  }
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}
