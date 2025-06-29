import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <Image
          src="/logo.svg"
          alt="Grapefruit Logo"
          width={320}
          height={60}
          priority
        />
        <p className="text-lg sm:text-xl">
          Runtime app inspection tool with friendly web user interface
        </p>
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
