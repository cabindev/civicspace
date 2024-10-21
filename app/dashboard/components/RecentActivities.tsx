import { RecentActivity } from '@/app/types/types';
import { FaClockRotateLeft } from 'react-icons/fa6';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface RecentActivitiesProps {
  data: RecentActivity[];
}

export default function RecentActivities({ data }: RecentActivitiesProps) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title flex items-center mb-4">
          <FaClockRotateLeft className="mr-2 text-2xl text-green-600" />
          Activity / กิจกรรมล่าสุด
        </h2>
        <ul className="timeline timeline-vertical">
          {data.map((activity, index) => (
            <li key={index}>
              {index > 0 && <hr />}
              <div className={`timeline-${index % 2 === 0 ? 'start' : 'end'} timeline-box`}>
                <p className="font-semibold">{activity.description}</p>
                <p className="text-sm text-green-600">
                  {format(new Date(activity.date), 'd MMM yyyy HH:mm', { locale: th })}
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