"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Wind, Thermometer, Battery, Wifi, Clock, MapPin } from "lucide-react";

// Mock data for demonstration
const mockAlerts = [
  {
    id: 1,
    deviceId: "ESP32_WIND_001",
    deviceCode: "ESP32_WIND_001",
    location: "Jakarta",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    alerts: [
      {
        type: "HIGH_WIND_SPEED",
        severity: "warning",
        message: "High wind speed detected: 25.2 m/s",
        value: 25.2,
        threshold: 20,
      }
    ]
  },
  {
    id: 2,
    deviceId: "ESP32_WIND_003",
    deviceCode: "ESP32_WIND_003",
    location: "Surabaya",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    alerts: [
      {
        type: "CRITICAL_BATTERY",
        severity: "critical",
        message: "Critical battery level: 8%",
        value: 8,
        threshold: 10,
      }
    ]
  },
  {
    id: 3,
    deviceId: "ESP32_WIND_002",
    deviceCode: "ESP32_WIND_002",
    location: "Bandung",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    alerts: [
      {
        type: "HIGH_TEMPERATURE",
        severity: "warning",
        message: "High temperature detected: 38.5 °C",
        value: 38.5,
        threshold: 35,
      },
      {
        type: "POOR_SIGNAL",
        severity: "warning",
        message: "Poor signal strength: -85 dBm",
        value: -85,
        threshold: -80,
      }
    ]
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    // In a real app, this would fetch from the API
    setAlerts(mockAlerts);
    setFilteredAlerts(mockAlerts);
  }, []);

  useEffect(() => {
    if (severityFilter === "all") {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(
        alerts.filter(alert => 
          alert.alerts.some((a: any) => a.severity === severityFilter)
        )
      );
    }
  }, [severityFilter, alerts]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Weather Alerts</h1>
        <p className="text-muted-foreground">Monitor critical alerts from your IoT wind sensors</p>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
              <p className="text-2xl font-bold">
                {alerts.filter(a => a.alerts.some((al: any) => al.severity === 'critical')).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warning Alerts</p>
              <p className="text-2xl font-bold">
                {alerts.filter(a => a.alerts.some((al: any) => al.severity === 'warning')).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Wind className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
              <p className="text-2xl font-bold">{alerts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2">Filter by Severity</label>
            <div className="flex gap-2 mt-2">
              {["all", "critical", "warning"].map((severity) => (
                <button
                  key={severity}
                  className={`px-3 py-1.5 rounded-md text-sm capitalize ${
                    severityFilter === severity
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setSeverityFilter(severity)}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No alerts found</h3>
            <p className="text-muted-foreground">You have no active alerts matching your filters.</p>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {alert.deviceCode} - {alert.location}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4" />
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  {alert.alerts.map((alertItem: any, idx: number) => (
                    <Badge 
                      key={idx} 
                      variant={alertItem.severity === 'critical' ? 'destructive' : 'default'}
                    >
                      {alertItem.severity.charAt(0).toUpperCase() + alertItem.severity.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {alert.alerts.map((alertItem: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`
                      p-2 rounded-full
                      ${alertItem.severity === 'critical' 
                        ? 'bg-red-500/20 text-red-500' 
                        : 'bg-yellow-500/20 text-yellow-500'}
                    `}>
                      {alertItem.type.includes('WIND') && <Wind className="w-4 h-4" />}
                      {alertItem.type.includes('TEMPERATURE') && <Thermometer className="w-4 h-4" />}
                      {alertItem.type.includes('BATTERY') && <Battery className="w-4 h-4" />}
                      {alertItem.type.includes('SIGNAL') && <Wifi className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{alertItem.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Threshold: {alertItem.threshold} (Current: {alertItem.value})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}