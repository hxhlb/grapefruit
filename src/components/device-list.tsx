"use client";

import { useEffect, useState } from "react";

import io from "socket.io-client";
import { Loader2 } from "lucide-react";
import { Device } from "@/schema";

export default function DeviceList() {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);

  function reload() {
    setLoading(true);
    fetch("/api/devices")
      .then((r) => r.json())
      .then((data: Device[]) => setDevices(data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const socket = io("/devices");
    socket.on("change", reload);
  });

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      {loading ? (
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      ) : devices.length === 0 ? (
        <p>No devices found.</p>
      ) : null}

      <ul className="grid xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
        {devices.map((device) => (
          <li
            key={device.id}
            className="m-2 xs:w-full overflow-hidden overflow-ellipsis"
          >
            <a
              href={`/device/${device.id}`}
              className="block p-4 rounded-lg
                hover:brightness-50 transition-background
                hover:shadow-lg active:brightness-50
                duration-200 bg-gray-50 dark:bg-gray-800 shadow-md"
            >
              <h2 className="text-lg font-semibold">{device.name}</h2>
              <p className="text-sm">{device.type}</p>
              <p className="text-xs text-gray-500">{device.id}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
