// users/components/ActivityList.tsx
import { List, Card, Typography } from 'antd';
import Link from 'next/link';
import { Activity, Policy } from '../types/user';

const { Text } = Typography;

interface Props {
 data: (Activity | Policy)[];
 type: 'tradition' | 'policy' | 'ethnic' | 'creative';
}

function getLinkPath(type: string): string {
 switch(type) {
   case 'tradition': return 'traditions';
   case 'policy': return 'public-policies';
   case 'ethnic': return 'ethnic-groups';
   case 'creative': return 'creative-activities';
   default: return '';
 }
}

function isPolicy(type: string): boolean {
 return type === 'policy';
}

export function ActivityList({ data, type }: Props) {
 return (
   <List
     dataSource={data}
     renderItem={item => (
       <Link href={`/dashboard/${getLinkPath(type)}/${item.id}`} key={item.id}>
         <Card 
           size="small" 
           className="mb-2 hover:shadow-md transition-shadow"
           hoverable
         >
           <div className="flex flex-col gap-1">
             <Text strong className="line-clamp-1">
               {item.name}
             </Text>
             <div className="flex justify-between text-sm">
               <Text type="secondary">
                 {isPolicy(type) 
                   ? (item as Policy).level 
                   : (item as Activity).type}
               </Text>
               <Text type="secondary">
                 {item.province}
               </Text>
             </div>
             <Text type="secondary" className="text-xs">
               {new Date(item.createdAt).toLocaleDateString('th-TH', {
                 year: 'numeric',
                 month: 'long',
                 day: 'numeric'
               })}
             </Text>
           </div>
         </Card>
       </Link>
     )}
   />
 );
}