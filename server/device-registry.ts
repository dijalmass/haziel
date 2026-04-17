import type { DeviceInfo } from "./types";

class DeviceRegistry {
  private devices = new Map<string, DeviceInfo>();
  private readonly MAX_DEVICES = 10;

  register(name: string, device: DeviceInfo): boolean {
    if (this.devices.size >= this.MAX_DEVICES) {
      return false;
    }
    this.devices.set(name, device);
    return true;
  }

  unregister(name: string): void {
    this.devices.delete(name);
  }

  getDevice(name: string): DeviceInfo | undefined {
    return this.devices.get(name);
  }

  listDevices() {
    return Array.from(this.devices.values()).map(d => ({
      name: d.name,
      status: d.status
    }));
  }

  isNameTaken(name: string): boolean {
    return this.devices.has(name);
  }

  updateHeartbeat(name: string): void {
    const device = this.devices.get(name);
    if (device) {
      device.lastHeartbeat = Date.now();
    }
  }
}

export const registry = new DeviceRegistry();
