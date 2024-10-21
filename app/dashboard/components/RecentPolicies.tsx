// components/RecentPolicies.tsx
import { PolicyData } from '@/app/types/types';
import { FaFileSignature, FaMapMarkerAlt, FaFlagUsa, FaCity, FaBuilding, FaHome, FaLandmark } from 'react-icons/fa';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface RecentPoliciesProps {
  data: PolicyData[];
}

interface LevelInfo {
  name: string;
  icon: React.ReactElement;
}

export default function RecentPolicies({ data }: RecentPoliciesProps) {
  const levelMap: Record<PolicyData['level'], LevelInfo> = {
    NATIONAL: { name: 'ระดับประเทศ', icon: <FaFlagUsa className="text-red-500" /> },
    PROVINCIAL: { name: 'ระดับจังหวัด', icon: <FaLandmark className="text-blue-500" /> },
    DISTRICT: { name: 'ระดับอำเภอ', icon: <FaCity className="text-green-500" /> },
    SUB_DISTRICT: { name: 'ระดับตำบล', icon: <FaBuilding className="text-yellow-500" /> },
    VILLAGE: { name: 'ระดับหมู่บ้าน', icon: <FaHome className="text-purple-500" /> },
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex items-center mb-4">
          <FaFileSignature className="mr-2 text-2xl text-green-600" />
          นโยบายสาธารณะล่าสุด
        </h2>
        <ul className="timeline timeline-vertical">
          {data.map((policy, index) => (
            <li key={policy.name}>
              {index > 0 && <hr />}
              <div className="timeline-start">
                {format(new Date(policy.signingDate), 'd MMM yyyy', { locale: th })}
              </div>
              <div className="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="timeline-end timeline-box">
                <h3 className="font-bold text-lg">{policy.name}</h3>
                <p className="flex items-center mt-2">
                  {levelMap[policy.level].icon}
                  <span className="ml-2">{levelMap[policy.level].name}</span>
                </p>
                <p className="flex items-center mt-2">
                  <FaMapMarkerAlt className="mr-2 text-red-500" />
                  {`${policy.district}, ${policy.amphoe}, ${policy.province}`}
                </p>
              </div>
              {index < data.length - 1 && <hr />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}