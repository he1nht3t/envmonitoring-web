'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TableSkeleton, MapSkeleton } from '@/components/ui/skeleton';
import { LoadingOverlay } from '@/components/ui/spinner';
import DeviceMap from '@/components/DeviceMap';
import { useDeviceContext } from '@/context/DeviceContext';
import { useAuth } from '@/context/AuthContext';
import { SensorData, fetchLatestSensorData, Device, createDevice, updateDevice, deleteDevice } from '@/lib/supabase';

interface DeviceFormData {
  name: string;
}

// Define the type for form errors separately to allow strings for error messages
interface DeviceFormErrors {
  name?: string;
}

export default function DevicesPage() {
  const { devices, loading } = useDeviceContext();
  const [latestSensorData, setLatestSensorData] = useState<Record<string, SensorData>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const { isAdmin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Device form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
  });
  const [formErrors, setFormErrors] = useState<DeviceFormErrors>({});
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
      setFormData({
        ...formData,
      [name]: value
      });
    
    // Clear error when field is edited
    if (formErrors[name as keyof DeviceFormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: DeviceFormErrors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Reset form state
  const resetForm = () => {
    setFormData({
      name: '',
    });
    setFormErrors({});
    setSelectedDevice(null);
  };
  
  // Open edit dialog with device data
  const openEditDialog = (device: Device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
    });
    setIsEditDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (device: Device) => {
    setSelectedDevice(device);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle add device
  const handleAddDevice = async () => {
    if (!validateForm()) return;
    
    try {
      // Set default values for lat and long that will be updated by GPS
      const deviceData = {
        ...formData,
        lat: 0,
        long: 0
      };
      
      const { error } = await createDevice(deviceData);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to add device: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Device added successfully",
      });
      
      // Refresh the page to update device list
      window.location.reload();
    } catch (error) {
      console.error('Error adding device:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };
  
  // Handle edit device
  const handleEditDevice = async () => {
    if (!validateForm() || !selectedDevice) return;
    
    try {
      // Only update the name, preserving existing lat/long values
      const { error } = await updateDevice(selectedDevice.id, formData);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to update device: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Device updated successfully",
      });
      
      // Refresh the page to update device list
      window.location.reload();
    } catch (error) {
      console.error('Error updating device:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsEditDialogOpen(false);
      resetForm();
    }
  };
  
  // Handle delete device
  const handleDeleteDevice = async () => {
    if (!selectedDevice) return;
    
    try {
      const { error } = await deleteDevice(selectedDevice.id);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to delete device: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
      
      // Refresh the page to update device list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting device:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      resetForm();
    }
  };

  // Fetch latest sensor data on component mount
  useEffect(() => {
    let isSubscribed = true;

    async function loadSensorData() {
      if (!isSubscribed) return;

      try {
        setDataLoading(true);
        
        // Fetch latest sensor data for all devices
        const latestData = await fetchLatestSensorData();
        
        if (!isSubscribed) return;

        // Convert array to record with device_id as key
        const latestByDevice = latestData.reduce((acc, item) => {
          acc[item.device_id] = item;
          return acc;
        }, {} as Record<string, SensorData>);
        
        setLatestSensorData(latestByDevice);
      } catch (error) {
        if (!isSubscribed) return;
        console.error('Error loading sensor data:', error);
      } finally {
        if (isSubscribed) {
          setDataLoading(false);
        }
      }
    }
    
    loadSensorData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <MapSkeleton className="h-96" />
          <Card>
            <CardHeader>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={5} cols={5} />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-xl">Please log in to view this page</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Devices</h1>
          
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Device
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Device</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Device Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter device name"
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Latitude and longitude will be determined by the device&apos;s GPS sensor.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDevice}>
                    Add Device
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Map showing all devices with sensor data */}
        <LoadingOverlay isLoading={dataLoading}>
          <DeviceMap devices={devices} sensorData={latestSensorData} />
        </LoadingOverlay>

        {/* Devices table */}
        <Card>
          <CardHeader>
            <CardTitle>Device List</CardTitle>
            {isAdmin && (
              <CardDescription>
                As an administrator, you can add, edit, and delete devices
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <TableSkeleton rows={5} cols={isAdmin ? 5 : 4} />
            ) : devices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Latitude</TableHead>
                    <TableHead>Longitude</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.id}</TableCell>
                      <TableCell>{device.lat}</TableCell>
                      <TableCell>{device.long}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(device)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => openDeleteDialog(device)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4">
                <p>No devices found.</p>
                {isAdmin && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the &quot;Add Device&quot; button to add a new device.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Device Dialog */}
      {isAdmin && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Device Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter device name"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Latitude and longitude are determined by the device&apos;s GPS sensor and cannot be edited manually.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditDevice}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      {isAdmin && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the device &quot;{selectedDevice?.name}&quot;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDeleteDevice}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardLayout>
  );
}