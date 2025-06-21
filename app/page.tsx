import Image from 'next/image';
import { Search } from './components/Search';
import { NavMenu } from './components/NavMenu';
import { Footer } from './components/Footer';
import { UserGreeting } from './components/UserGreeting';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-400 to-green-600">
      <header className="p-4 flex items-center relative">
        <div className="flex-1">
          <UserGreeting />
        </div>
        <NavMenu />
      </header>

      <main className="flex-grow flex flex-col mt-8 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl text-center">
          <div className="mb-6 transition-transform duration-300 hover:scale-105">
            <Image
              src="/powerUp.svg"
              alt="Power Logo"
              width={180}
              height={180}
              priority
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '180px',
                maxHeight: '180px',
              }}
              className="mx-auto drop-shadow-xl"
            />
          </div>

          <Search />

          <h1 className="font-seppuri text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-wide">
            เครือข่ายพลังสังคม
          </h1>

          <p className="font-seppuri text-base sm:text-lg md:text-xl text-green-100 mb-8 font-light">
            ฐานข้อมูลมูลนิธิเครือข่ายพลังสังคม
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}