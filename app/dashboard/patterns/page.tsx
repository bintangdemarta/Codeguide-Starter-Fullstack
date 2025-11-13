"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wind, Gauge, Thermometer, Droplets, Eye, BarChart3, MapPin, AlertTriangle } from "lucide-react";
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
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  LineChart,
  Line
} from "recharts";

// Mock data for various wind pattern visualizations
const windDirectionData = [
  { name: 'N', value: 15 },
  { name: 'NNE', value: 8 },
  { name: 'NE', value: 12 },
  { name: 'ENE', value: 5 },
  { name: 'E', value: 10 },
  { name: 'ESE', value: 7 },
  { name: 'SE', value: 20 },
  { name: 'SSE', value: 15 },
  { name: 'S', value: 25 },
  { name: 'SSW', value: 18 },
  { name: 'SW', value: 12 },
  { name: 'WSW', value: 8 },
  { name: 'W', value: 10 },
  { name: 'WNW', value: 6 },
  { name: 'NW', value: 14 },
  { name: 'NNW', value: 9 },
];

const windRoseData = [
  { direction: 'N', speed: 5, frequency: 15 },
  { direction: 'NE', speed: 8, frequency: 12 },
  { direction: 'E', speed: 10, frequency: 10 },
  { direction: 'SE', speed: 12, frequency: 20 },
  { direction: 'S', speed: 15, frequency: 25 },
  { direction: 'SW', speed: 14, frequency: 18 },
  { direction: 'W', speed: 9, frequency: 10 },
  { direction: 'NW', speed: 7, frequency: 9 },
];

const hourlyWindPatterns = [
  { hour: '00:00', avgSpeed: 8.2, maxSpeed: 12.5, minSpeed: 4.1, dominantDirection: 180 },
  { hour: '04:00', avgSpeed: 7.8, maxSpeed: 11.2, minSpeed: 3.8, dominantDirection: 190 },
  { hour: '08:00', avgSpeed: 12.4, maxSpeed: 18.7, minSpeed: 7.2, dominantDirection: 225 },
  { hour: '12:00', avgSpeed: 16.7, maxSpeed: 24.3, minSpeed: 11.1, dominantDirection: 270 },
  { hour: '16:00', avgSpeed: 14.9, maxSpeed: 22.1, minSpeed: 9.8, dominantDirection: 250 },
  { hour: '20:00', avgSpeed: 10.3, maxSpeed: 16.8, minSpeed: 5.7, dominantDirection: 200 },
];

const windCorrelationData = [
  { windSpeed: 5, temperature: 22.1, humidity: 78, pressure: 1012 },
  { windSpeed: 8, temperature: 24.3, humidity: 65, pressure: 1010 },
  { windSpeed: 12, temperature: 26.7, humidity: 58, pressure: 1008 },
  { windSpeed: 15, temperature: 28.9, humidity: 52, pressure: 1005 },
  { windSpeed: 18, temperature: 30.2, humidity: 48, pressure: 1003 },
  { windSpeed: 22, temperature: 31.5, humidity: 45, pressure: 1000 },
  { windSpeed: 25, temperature: 32.1, humidity: 43, pressure: 998 },
];

export default function WindPatternsPage() {
  const [activeTab, setActiveTab] = useState("rose");

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Wind Patterns</h1>
        <p className="text-muted-foreground">Advanced visualization of wind patterns and meteorological data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Wind className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Wind Speed</p>
              <p className="text-2xl font-bold">14.2 m/s</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Gauge className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dominant Direction</p>
              <p className="text-2xl font-bold">South</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Thermometer className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Gust</p>
              <p className="text-2xl font-bold">28.4 m/s</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <BarChart3 className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trend</p>
              <p className="text-2xl font-bold text-green-500">↗ 12%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="rose">Wind Rose</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="rose" className="space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wind className="w-5 h-5" />
              Wind Direction Distribution
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={windDirectionData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  <Radar name="Wind Frequency" dataKey="value" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Wind Rose Chart</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={windRoseData}
                    layout="radial"
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarGrid />
                    <RadialBar 
                      dataKey="frequency" 
                      baseValue={0} 
                      animationBegin={0}
                      animationDuration={1000}
                      fill="#8884d8"
                    />
                    <PolarAngleAxis 
                      dataKey="direction" 
                      tick 
                      tickCount={8}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 30]} 
                    />
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Direction vs Speed</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="direction" name="Direction" />
                    <YAxis type="number" dataKey="speed" name="Speed" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Wind Data" data={windRoseData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Hourly Wind Patterns</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyWindPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgSpeed" stroke="#8884d8" name="Avg Speed" />
                  <Line type="monotone" dataKey="maxSpeed" stroke="#ff7300" name="Max Speed" />
                  <Line type="monotone" dataKey="minSpeed" stroke="#82ca9d" name="Min Speed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Speed Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyWindPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgSpeed" fill="#8884d8" name="Avg Speed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Direction Frequency</h3>
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
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 22.5}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Wind Speed vs Temperature</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="windSpeed" name="Wind Speed" unit=" m/s" />
                  <YAxis type="number" dataKey="temperature" name="Temperature" unit=" °C" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Wind vs Temp" data={windCorrelationData} fill="#ff7300" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Wind Speed vs Humidity</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="windSpeed" name="Wind Speed" unit=" m/s" />
                    <YAxis type="number" dataKey="humidity" name="Humidity" unit=" %" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <ZAxis range={[4, 20]} />
                    <Scatter name="Wind vs Humidity" data={windCorrelationData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Wind Speed vs Pressure</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={windCorrelationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="windSpeed" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area yAxisId="left" type="monotone" dataKey="pressure" stroke="#0088fe" fill="#0088fe" fillOpacity={0.3} name="Pressure" />
                    <Line yAxisId="right" type="monotone" dataKey="windSpeed" stroke="#ff7300" name="Wind Speed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wind className="w-5 h-5" />
              Wind Forecast (Next 24 Hours)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { time: 'Now', speed: 12.5, direction: 180 },
                    { time: '2H', speed: 14.2, direction: 190 },
                    { time: '4H', speed: 16.8, direction: 200 },
                    { time: '6H', speed: 15.5, direction: 210 },
                    { time: '8H', speed: 13.9, direction: 220 },
                    { time: '10H', speed: 11.7, direction: 230 },
                    { time: '12H', speed: 10.3, direction: 240 },
                    { time: '14H', speed: 12.1, direction: 250 },
                    { time: '16H', speed: 14.6, direction: 260 },
                    { time: '18H', speed: 16.2, direction: 270 },
                    { time: '20H', speed: 17.8, direction: 280 },
                    { time: '22H', speed: 15.4, direction: 290 },
                    { time: '24H', speed: 13.1, direction: 300 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="speed" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Wind Speed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Assessment
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>High Winds (20+ m/s)</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">23%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Gusts (25+ m/s)</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded">12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Extreme Gusts (30+ m/s)</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">5%</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Confidence Level
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { hour: 'Now', confidence: 95 },
                      { hour: '6H', confidence: 92 },
                      { hour: '12H', confidence: 88 },
                      { hour: '18H', confidence: 82 },
                      { hour: '24H', confidence: 75 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="confidence" fill="#8884d8" name="Confidence %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}