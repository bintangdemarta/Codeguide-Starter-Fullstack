"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wind, 
  Thermometer, 
  Droplets, 
  Battery, 
  Wifi, 
  Clock, 
  MapPin 
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

// Mock data for demonstration
const mockTelemetryData = [
  { id: 1, deviceId: "ESP32_WIND_001", timestamp: new Date(Date.now() - 60*60*1000).toISOString(), windSpeed: 15.2, windDirection: 270, temperature: 28.5, humidity: 65.2, batteryLevel: 85.5, signalStrength: -65 },
  { id: 2, deviceId: "ESP32_WIND_001", timestamp: new Date(Date.now() - 50*60*1000).toISOString(), windSpeed: 16.1, windDirection: 275, temperature: 28.7, humidity: 64.8, batteryLevel: 85.3, signalStrength: -64 },
  { id: 3, deviceId: "ESP32_WIND_001", timestamp: new Date(Date.now() - 40*60*1000).toISOString(), windSpeed: 14.8, windDirection: 265, temperature: 28.3, humidity: 65.5, batteryLevel: 85.2, signalStrength: -65 },
  { id: 4, deviceId: "ESP32_WIND_001", timestamp: new Date(Date.now() - 30*60*1000).toISOString(), windSpeed: 17.2, windDirection: 280, temperature: 29.1, humidity: 63.9, batteryLevel: 85.0, signalStrength: -63 },
  { id: 5, deviceId: "ESP32_WIND_001", timestamp: new Date(Date.now() - 20*60*1000).toISOString(), windSpeed: 15.9, windDirection: 270, temperature: 28.9, humidity: 64.2, batteryLevel: 84.8, signalStrength: -64 },
  { id: 6, deviceId: "ESP32_WIND_001", timestamp: new Date(Date.now() - 10*60*1000).toISOString(), windSpeed: 16.5, windDirection: 272, temperature: 29.0, humidity: 64.0, batteryLevel: 84.7, signalStrength: -64 },
  { id: 7, deviceId: "ESP32_WIND_001", timestamp: new Date().toISOString(), windSpeed: 15.8, windDirection: 268, temperature: 28.8, humidity: 64.5, batteryLevel: 84.5, signalStrength: -65 },
];

const mockCurrentData = {
  deviceId: "ESP32_WIND_001",
  location: "Jakarta",
  timestamp: new Date().toISOString(),
  windSpeed: 15.8,
  windDirection: 268,
  temperature: 28.8,
  humidity: 64.5,
  batteryLevel: 84.5,
  signalStrength: -65,
  firmwareVersion: "v2.1.3"
};

export default function TelemetryPage() {
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [currentData, setCurrentData] = useState<any>(null);

  useEffect(() => {
    // In a real app, this would fetch from the API
    setTelemetryData(mockTelemetryData);
    setCurrentData(mockCurrentData);
  }, []);

  // Prepare data for charts (only wind speed, temperature, and humidity over time)
  const chartData = telemetryData.map(data => ({
    time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    windSpeed: parseFloat(data.windSpeed),
    temperature: parseFloat(data.temperature),
    humidity: parseFloat(data.humidity),
  }));

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Real-time Telemetry</h1>
        <p className="text-muted-foreground">Live data from IoT wind sensors</p>
      </div>

      {currentData && (
        <>
          {/* Current Data Card */}
          <Card className="p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">{currentData.deviceId}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  {currentData.location}
                </div>
              </div>
              <Badge variant="secondary" className="mt-2 sm:mt-0">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(currentData.timestamp).toLocaleString()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/40 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Wind className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">{currentData.windSpeed} m/s</p>
                <p className="text-xs text-muted-foreground">Wind Speed</p>
              </div>
              
              <div className="text-center p-4 bg-muted/40 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Thermometer className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-2xl font-bold">{currentData.temperature} °C</p>
                <p className="text-xs text-muted-foreground">Temperature</p>
              </div>
              
              <div className="text-center p-4 bg-muted/40 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Droplets className="w-6 h-6 text-cyan-500" />
                </div>
                <p className="text-2xl font-bold">{currentData.humidity}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
              
              <div className="text-center p-4 bg-muted/40 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Wind className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">{currentData.windDirection}°</p>
                <p className="text-xs text-muted-foreground">Wind Direction</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-4 bg-muted/40 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Battery className={`w-6 h-6 ${currentData.batteryLevel > 20 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <p className="text-2xl font-bold">{currentData.batteryLevel}%</p>
                <p className="text-xs text-muted-foreground">Battery</p>
              </div>
              
              <div className="text-center p-4 bg-muted/40 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Wifi className={`w-6 h-6 ${currentData.signalStrength > -70 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <p className="text-2xl font-bold">{currentData.signalStrength} dBm</p>
                <p className="text-xs text-muted-foreground">Signal</p>
              </div>
              
              <div className="text-center p-4 bg-muted/40 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Wind className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold">ESE</p>
                <p className="text-xs text-muted-foreground">Direction</p>
              </div>
              
              <div className="text-center p-4 bg-muted/40 rounded-lg">
                <div className="flex justify-center mb-2">
                  <Clock className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-2xl font-bold">{currentData.firmwareVersion}</p>
                <p className="text-xs text-muted-foreground">Firmware</p>
              </div>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wind Speed Chart */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Wind Speed Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="windSpeed" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Temperature and Humidity Chart */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Temperature & Humidity</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#ff8042" />
                    <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#0088fe" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Recent Data Table */}
          <Card className="p-4 sm:p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Data Points</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Wind Speed</th>
                    <th className="text-left py-2">Wind Direction</th>
                    <th className="text-left py-2">Temperature</th>
                    <th className="text-left py-2">Humidity</th>
                    <th className="text-left py-2">Battery</th>
                    <th className="text-left py-2">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetryData.slice().reverse().map((data) => (
                    <tr key={data.id} className="border-b">
                      <td className="py-2">{new Date(data.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2">{data.windSpeed} m/s</td>
                      <td className="py-2">{data.windDirection}°</td>
                      <td className="py-2">{data.temperature} °C</td>
                      <td className="py-2">{data.humidity}%</td>
                      <td className="py-2">{data.batteryLevel}%</td>
                      <td className="py-2">{data.signalStrength} dBm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}