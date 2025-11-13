"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Wind, 
  Battery, 
  Wifi, 
  Thermometer, 
  Droplets, 
  MapPin, 
  AlertTriangle,
  Eye,
  Settings,
  Plus,
  Search
} from "lucide-react";

// Mock data for demonstration
const mockDevices = [
  { 
    id: "1", 
    deviceCode: "ESP32_WIND_001", 
    location: "Jakarta", 
    status: "active", 
    windSpeed: 15.2, 
    temperature: 28.5, 
    humidity: 65.2, 
    battery: 85.5, 
    signal: -65, 
    lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    firmwareVersion: "v2.1.3"
  },
  { 
    id: "2", 
    deviceCode: "ESP32_WIND_002", 
    location: "Bandung", 
    status: "active", 
    windSpeed: 12.8, 
    temperature: 27.3, 
    humidity: 62.1, 
    battery: 78.3, 
    signal: -68, 
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    firmwareVersion: "v2.1.2"
  },
  { 
    id: "3", 
    deviceCode: "ESP32_WIND_003", 
    location: "Surabaya", 
    status: "offline", 
    windSpeed: 0, 
    temperature: 0, 
    humidity: 0, 
    battery: 45.2, 
    signal: -90, 
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    firmwareVersion: "v2.0.0"
  },
];

export default function DeviceManagementPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch from the API
    setDevices(mockDevices);
    setFilteredDevices(mockDevices);
  }, []);

  useEffect(() => {
    let result = devices;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(device => 
        device.deviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(device => device.status === statusFilter);
    }

    setFilteredDevices(result);
  }, [searchTerm, statusFilter, devices]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Device Management</h1>
          <p className="text-muted-foreground">Manage and monitor IoT wind sensors</p>
        </div>
        <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Register Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Device</DialogTitle>
              <DialogDescription>
                Add a new IoT wind sensor to your network
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Device Code</label>
                <Input placeholder="e.g. ESP32_WIND_001" />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input placeholder="e.g. Jakarta" />
              </div>
              <div>
                <label className="text-sm font-medium">Firmware Version</label>
                <Input placeholder="e.g. v2.1.3" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Devices Table */}
      <Card className="p-4 sm:p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Wind Speed</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Humidity</TableHead>
              <TableHead>Battery</TableHead>
              <TableHead>Signal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Firmware</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.map((device) => (
              <TableRow key={device.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    {device.deviceCode}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {device.location}
                  </div>
                </TableCell>
                <TableCell>
                  {device.windSpeed > 0 ? (
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      <span>{device.windSpeed} m/s</span>
                    </div>
                  ) : "N/A"}
                </TableCell>
                <TableCell>
                  {device.temperature > 0 ? (
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4" />
                      <span>{device.temperature} °C</span>
                    </div>
                  ) : "N/A"}
                </TableCell>
                <TableCell>
                  {device.humidity > 0 ? (
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      <span>{device.humidity}%</span>
                    </div>
                  ) : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Battery className={`w-4 h-4 ${device.battery > 20 ? 'text-green-500' : 'text-red-500'}`} />
                    <span>{device.battery}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Wifi className={`w-4 h-4 ${device.signal > -70 ? 'text-green-500' : 'text-red-500'}`} />
                    <span>{device.signal} dBm</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    device.status === "active" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {device.status}
                  </span>
                </TableCell>
                <TableCell>{device.firmwareVersion}</TableCell>
                <TableCell>
                  {new Date(device.lastSeen).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Settings
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Wind className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Devices</p>
              <p className="text-2xl font-bold">
                {devices.filter(d => d.status === "active").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offline Devices</p>
              <p className="text-2xl font-bold">
                {devices.filter(d => d.status === "offline").length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Battery className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Battery</p>
              <p className="text-2xl font-bold">
                {devices.reduce((sum, device) => sum + device.battery, 0) / devices.length || 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}