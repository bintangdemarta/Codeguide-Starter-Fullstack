"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wind, Gauge, MapPin, Battery, Wifi, Thermometer, Droplets, Eye, BarChart3, TrendingUp } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

export default function DashboardPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [windDirectionData, setWindDirectionData] = useState<any[]>([]);
  const [aggregatedData, setAggregatedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // In a real app, this would fetch from the API
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls with mock data for now
      // In a real implementation, these would be actual API calls
      const mockDevices = [
        { id: "1", deviceCode: "ESP32_WIND_001", location: "Jakarta", status: "active", windSpeed: 15.2, temperature: 28.5, humidity: 65.2, battery: 85.5, signal: -65, lastSeen: new Date().toISOString() },
        { id: "2", deviceCode: "ESP32_WIND_002", location: "Bandung", status: "active", windSpeed: 12.8, temperature: 27.3, humidity: 62.1, battery: 78.3, signal: -68, lastSeen: new Date().toISOString() },
        { id: "3", deviceCode: "ESP32_WIND_003", location: "Surabaya", status: "offline", windSpeed: 0, temperature: 0, humidity: 0, battery: 45.2, signal: -90, lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      ];

      const mockTelemetryData = [
        { hour: "00:00", windSpeed: 12.5, temperature: 26.1, humidity: 60.2 },
        { hour: "04:00", windSpeed: 13.2, temperature: 25.8, humidity: 61.5 },
        { hour: "08:00", windSpeed: 16.8, temperature: 28.3, humidity: 58.7 },
        { hour: "12:00", windSpeed: 20.1, temperature: 31.2, humidity: 55.3 },
        { hour: "16:00", windSpeed: 18.7, temperature: 30.8, humidity: 57.1 },
        { hour: "20:00", windSpeed: 14.3, temperature: 28.9, humidity: 62.4 },
      ];

      const mockWindDirectionData = [
        { name: "N", value: 15 },
        { name: "NE", value: 20 },
        { name: "E", value: 10 },
        { name: "SE", value: 5 },
        { name: "S", value: 25 },
        { name: "SW", value: 8 },
        { name: "W", value: 12 },
        { name: "NW", value: 5 },
      ];

      const mockAggregatedData = {
        totalDevices: 3,
        totalReadings: 245,
        avgWindSpeed: 15.8,
        maxWindSpeed: 28.4,
        minWindSpeed: 8.2,
        avgTemperature: 28.7,
        avgHumidity: 62.4,
        avgWindDirection: 180,
        dataCompleteness: 95.2,
        timeRange: {
          start: "2024-11-01T00:00:00Z",
          end: "2024-11-13T23:59:59Z",
        },
        hourlyTrends: [
          { hour: "00:00", avgWindSpeed: 12.1, avgTemperature: 25.3, avgHumidity: 68.2 },
          { hour: "04:00", avgWindSpeed: 11.8, avgTemperature: 24.7, avgHumidity: 70.5 },
          { hour: "08:00", avgWindSpeed: 16.2, avgTemperature: 28.1, avgHumidity: 59.7 },
          { hour: "12:00", avgWindSpeed: 20.3, avgTemperature: 31.4, avgHumidity: 53.2 },
          { hour: "16:00", avgWindSpeed: 18.9, avgTemperature: 30.7, avgHumidity: 56.4 },
          { hour: "20:00", avgWindSpeed: 14.7, avgTemperature: 28.8, avgHumidity: 63.1 },
        ],
        dailyStats: [
          { day: "2024-11-08", avgWindSpeed: 14.5, maxWindSpeed: 24.2, minWindSpeed: 7.8, avgTemperature: 27.8, avgHumidity: 61.2 },
          { day: "2024-11-09", avgWindSpeed: 16.8, maxWindSpeed: 26.7, minWindSpeed: 9.1, avgTemperature: 28.9, avgHumidity: 59.4 },
          { day: "2024-11-10", avgWindSpeed: 13.2, maxWindSpeed: 20.1, minWindSpeed: 6.3, avgTemperature: 27.2, avgHumidity: 64.8 },
          { day: "2024-11-11", avgWindSpeed: 17.1, maxWindSpeed: 28.4, minWindSpeed: 8.2, avgTemperature: 29.4, avgHumidity: 58.7 },
          { day: "2024-11-12", avgWindSpeed: 15.6, maxWindSpeed: 25.8, minWindSpeed: 9.3, avgTemperature: 28.3, avgHumidity: 62.1 },
          { day: "2024-11-13", avgWindSpeed: 14.8, maxWindSpeed: 23.5, minWindSpeed: 8.7, avgTemperature: 28.0, avgHumidity: 61.5 },
        ]
      };

      setDevices(mockDevices);
      setTelemetryData(mockTelemetryData);
      setWindDirectionData(mockWindDirectionData);
      setAggregatedData(mockAggregatedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const activeDevices = devices.filter(device => device.status === "active").length;
  const totalDevices = devices.length;
  const avgWindSpeed = devices.reduce((sum, device) => sum + device.windSpeed, 0) / devices.length || 0;
  const avgTemperature = devices.reduce((sum, device) => sum + device.temperature, 0) / devices.length || 0;

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Wind Dashboard</h1>
        <p className="text-muted-foreground">Monitor and analyze wind data from IoT sensors</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Wind className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Devices</p>
              <p className="text-2xl font-bold">{activeDevices}/{totalDevices}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Gauge className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Wind Speed</p>
              <p className="text-2xl font-bold">{avgWindSpeed.toFixed(1)} m/s</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Thermometer className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Temperature</p>
              <p className="text-2xl font-bold">{avgTemperature.toFixed(1)} °C</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Droplets className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Humidity</p>
              <p className="text-2xl font-bold">61.9%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="aggregated">Aggregated Data</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Wind Speed Chart */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wind className="w-5 h-5" />
              Wind Speed Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="windSpeed" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Temperature and Humidity Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Temperature Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="temperature" stroke="#ff8042" fill="#ff8042" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Humidity Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="humidity" stroke="#0088fe" fill="#0088fe" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Wind Direction Distribution */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Wind Direction Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={windDirectionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {windDirectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Device Status Chart */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Device Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Active", count: activeDevices },
                      { name: "Offline", count: totalDevices - activeDevices },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d">
                      {[
                        { name: "Active", count: activeDevices },
                        { name: "Offline", count: totalDevices - activeDevices },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "Active" ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aggregated">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Readings</p>
                  <p className="text-2xl font-bold">{aggregatedData?.totalReadings || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Gauge className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Wind Speed</p>
                  <p className="text-2xl font-bold">{aggregatedData?.maxWindSpeed?.toFixed(1) || 0} m/s</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Thermometer className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min Wind Speed</p>
                  <p className="text-2xl font-bold">{aggregatedData?.minWindSpeed?.toFixed(1) || 0} m/s</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <BarChart3 className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Completeness</p>
                  <p className="text-2xl font-bold">{aggregatedData?.dataCompleteness || 0}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Aggregated Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Hourly Trends */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Hourly Averages</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aggregatedData?.hourlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="avgWindSpeed" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Wind Speed" />
                    <Area type="monotone" dataKey="avgTemperature" stroke="#ff8042" fill="#ff8042" fillOpacity={0.3} name="Temperature" />
                    <Area type="monotone" dataKey="avgHumidity" stroke="#0088fe" fill="#0088fe" fillOpacity={0.3} name="Humidity" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Daily Stats */}
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Wind Speed</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aggregatedData?.dailyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgWindSpeed" fill="#8884d8" name="Avg Wind Speed" />
                    <Bar dataKey="maxWindSpeed" fill="#82ca9d" name="Max Wind Speed" />
                    <Bar dataKey="minWindSpeed" fill="#ffc658" name="Min Wind Speed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Time Range */}
          <Card className="p-4 sm:p-6 mt-4">
            <h3 className="text-lg font-semibold mb-4">Data Time Range</h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {aggregatedData?.timeRange?.start 
                    ? new Date(aggregatedData.timeRange.start).toLocaleDateString() 
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {aggregatedData?.timeRange?.end 
                    ? new Date(aggregatedData.timeRange.end).toLocaleDateString() 
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Days</p>
                <p className="font-medium">
                  {aggregatedData?.timeRange?.start && aggregatedData?.timeRange?.end
                    ? Math.ceil(
                        (new Date(aggregatedData.timeRange.end).getTime() - 
                         new Date(aggregatedData.timeRange.start).getTime()) / 
                        (1000 * 60 * 60 * 24)
                      ) + " days"
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Device Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Device</th>
                    <th className="text-left py-2">Location</th>
                    <th className="text-left py-2">Wind Speed</th>
                    <th className="text-left py-2">Temperature</th>
                    <th className="text-left py-2">Humidity</th>
                    <th className="text-left py-2">Battery</th>
                    <th className="text-left py-2">Signal</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <tr key={device.id} className="border-b">
                      <td className="py-2 font-medium">{device.deviceCode}</td>
                      <td className="py-2">{device.location}</td>
                      <td className="py-2">{device.windSpeed > 0 ? `${device.windSpeed} m/s` : "N/A"}</td>
                      <td className="py-2">{device.temperature > 0 ? `${device.temperature} °C` : "N/A"}</td>
                      <td className="py-2">{device.humidity > 0 ? `${device.humidity}%` : "N/A"}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Battery className={`w-4 h-4 ${device.battery > 20 ? 'text-green-500' : 'text-red-500'}`} />
                          {device.battery}%
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4" />
                          {device.signal} dBm
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          device.status === "active" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {device.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}