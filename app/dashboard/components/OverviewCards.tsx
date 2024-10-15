import { FaUser, FaPalette, FaLandmark, FaScroll, FaUsers } from 'react-icons/fa';
import { OverviewData } from '@/app/types/types';
import { ReactNode } from 'react';

interface OverviewCardsProps {
  data: OverviewData;
}

interface CardProps {
  title: string;
  value: number;
  icon: ReactNode;
}

const Card = ({ title, value, icon }: CardProps) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body flex flex-row items-center">
      {icon}
      <div className="ml-4">
        <h2 className="card-title">{title}</h2>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

export default function OverviewCards({ data }: OverviewCardsProps) {
  return (
    <>
      <Card title="Users" value={data.userCount} icon={<FaUser className="text-4xl text-primary" />} />
      <Card title="Creative Activities" value={data.creativeActivityCount} icon={<FaPalette className="text-4xl text-secondary" />} />
      <Card title="Traditions" value={data.traditionCount} icon={<FaLandmark className="text-4xl text-accent" />} />
      <Card title="Public Policies" value={data.publicPolicyCount} icon={<FaScroll className="text-4xl text-info" />} />
      <Card title="Ethnic Groups" value={data.ethnicGroupCount} icon={<FaUsers className="text-4xl text-success" />} />
    </>
  );
}