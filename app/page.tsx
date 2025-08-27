import Image from 'next/image';
import { Search } from './components/Search';
import { NavMenu } from './components/NavMenu';
import { Footer } from './components/Footer';
import { UserGreeting } from './components/UserGreeting';

// Server Actions
import { getLatestTraditions } from '@/app/lib/actions/tradition/get';
import { getLatestPublicPolicies } from '@/app/lib/actions/public-policy/get';
import { getLatestEthnicGroups } from '@/app/lib/actions/ethnic-group/get';
import { getLatestCreativeActivities } from '@/app/lib/actions/creative-activity/get';

export default async function Home() {
  // Pre-fetch footer data on server-side to avoid client-side POST requests
  const footerData = await Promise.all([
    getLatestTraditions(5),
    getLatestPublicPolicies(5),
    getLatestEthnicGroups(5),
    getLatestCreativeActivities(5)
  ]);

  const footerProps = {
    traditions: footerData[0].success ? footerData[0].data : [],
    policies: footerData[1].success ? footerData[1].data : [],
    ethnicGroups: footerData[2].success ? footerData[2].data : [],
    creativeActivities: footerData[3].success ? footerData[3].data : []
  };

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

      <Footer initialData={footerProps} />
    </div>
  );
}