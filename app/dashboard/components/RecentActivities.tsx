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
        <h2 className="card-title flex items-center mb-4 text-sm font-light">
          <FaClockRotateLeft className="mr-2 text-xl text-green-600" />
          Activity / กิจกรรมล่าสุด
        </h2>
        <ul className="timeline timeline-vertical">
          {data.map((activity, index) => (
            <li key={index}>
              {index > 0 && <hr />}
              <div className={`timeline-${index % 2 === 0 ? 'start' : 'end'} timeline-box`}>
                <p className="text-sm font-light">{activity.description}</p>
                {(activity.type || activity.region) && (
                  <div className="flex flex-wrap gap-1 mt-1 mb-2">
                    {activity.type && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activity.type}
                      </span>
                    )}
                    {activity.region && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activity.region}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs font-light text-green-600">
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