import React from 'react';
import Link from 'next/link';
import { TraditionData, PublicPolicyData, EthnicGroupData, HomeCreativeActivityData } from '@/app/types/types';

type DataListProps = {
  title: string;
  data: TraditionData[] | PublicPolicyData[] | EthnicGroupData[] | HomeCreativeActivityData[];
  type: 'tradition' | 'public-policy' | 'ethnic-group' | 'creative-activity';
};

export const DataList: React.FC<DataListProps> = ({ title, data, type }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {data.length > 0 ? (
        <ul>
          {data.map((item) => (
            <li key={item.id} className="mb-2">
              <Link href={`/${type}/${item.id}`} className="text-green-600 hover:text-green-800">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">ไม่พบข้อมูล</p>
      )}
    </div>
  );
};