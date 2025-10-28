import Image from "next/image";

import DeviceList from "@/components/device-list";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] bg-background min-h-screen p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <h1>
          <Image
            src="/logo.svg"
            alt="Grapefruit"
            width={320}
            height={60}
            priority
          />
        </h1>
        <p>
          <ThemeToggle />
        </p>
        <p className="text-md">Select a device below to begin:</p>
        <DeviceList />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/ChiChou/grapefruit"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/grapefruit.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          GitHub Repository
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://infosec.exchange/@codecolorist"
          target="_blank"
          rel="noopener noreferrer"
        >
          @codecolorist
        </a>
      </footer>
    </div>
  );
}
