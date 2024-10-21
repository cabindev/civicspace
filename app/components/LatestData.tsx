// components/LatestData.tsx
import Link from 'next/link';
import DataStats from './DataStats';
import { DashboardData } from '../types/types';

export default function LatestData({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="col-span-full">
        <DataStats data={data.overview} />
      </div>
      {Object.entries(data).map(([key, items]) => (
        <div key={key} className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">{key}</h2>
          <ul>
            {items.map((item: any) => (
              <li key={item.id}>
                <Link href={`/${key}/${item.id}`}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}