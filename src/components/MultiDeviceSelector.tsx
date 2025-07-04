'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useDeviceContext } from '@/context/DeviceContext';

interface MultiDeviceSelectorProps {
  selectedDeviceIds: string[];
  onSelectionChange: (deviceIds: string[]) => void;
  maxSelection?: number;
  mainDeviceId?: string;
}

export default function MultiDeviceSelector({ 
  selectedDeviceIds, 
  onSelectionChange, 
  maxSelection = 4,
  mainDeviceId
}: MultiDeviceSelectorProps) {
  const { devices } = useDeviceContext();
  const [open, setOpen] = useState(false);

  const handleDeviceToggle = (deviceId: string) => {
    if (deviceId === mainDeviceId) return;

    const isSelected = selectedDeviceIds.includes(deviceId);
    const isDisabled = deviceId === mainDeviceId || (!isSelected && selectedDeviceIds.length >= maxSelection);
    
    if (isDisabled) return;
    
    if (isSelected) {
      onSelectionChange(selectedDeviceIds.filter(id => id !== deviceId));
    } else {
      onSelectionChange([...selectedDeviceIds, deviceId]);
    }
  };

  const clearSelection = () => {
    if (mainDeviceId) {
      onSelectionChange([mainDeviceId]);
    } else {
      onSelectionChange([]);
    }
  };

  const getSelectedDeviceNames = () => {
    return selectedDeviceIds
      .map(id => devices.find(device => device.id === id)?.name)
      .filter(Boolean);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-auto min-w-[200px] justify-between"
          >
            {selectedDeviceIds.length === 0
              ? "Select devices..."
              : `${selectedDeviceIds.length} device${selectedDeviceIds.length > 1 ? 's' : ''} selected`
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search devices..." />
            <CommandEmpty>No devices found.</CommandEmpty>
            <CommandGroup>
              {devices.map((device) => {
                const isSelected = selectedDeviceIds.includes(device.id);
                const isMainDevice = device.id === mainDeviceId;
                const isDisabled = isMainDevice || (!isSelected && selectedDeviceIds.length >= maxSelection);

                return (
                  <CommandItem
                    key={device.id}
                    value={device.name}
                    disabled={isDisabled}
                    onSelect={() => handleDeviceToggle(device.id)}
                    className={cn(
                      "cursor-pointer",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {device.name}
                    {isMainDevice && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        Main
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected devices badges */}
      {selectedDeviceIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {getSelectedDeviceNames().map((name, index) => {
            const deviceId = selectedDeviceIds[index];
            const isMainDevice = deviceId === mainDeviceId;
            return (
              <Badge key={deviceId} variant="secondary" className="text-xs">
                {name}
                {!isMainDevice && (
                  <button
                    onClick={() => handleDeviceToggle(deviceId)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-3 h-3 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                )}
              </Badge>
            );
          })}
          {selectedDeviceIds.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}