# SSN Thailand Project - Claude Context

## Project Overview
SSN Thailand เป็นระบบจัดการข้อมูลเพื่อสนับสนุนการสร้างสรรค์และการอนุรักษ์ประเพณีไทย ประกอบด้วยระบบจัดการกิจกรรมสร้างสรรค์ กลุ่มชาติพันธุ์ และนโยบายสาธารณะ

## Technical Stack
- **Frontend**: Next.js 14 with React 18, TypeScript
- **UI Libraries**: Ant Design, Chakra UI, DaisyUI, Tailwind CSS  
- **Charts**: Ant Design Charts, Highcharts, Recharts
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with Prisma adapter
- **File Upload**: Browser image compression, xlsx support
- **Maps**: React Leaflet for geographic data visualization
- **Styling**: Tailwind CSS, Emotion, Framer Motion
- **Backend**: Express.js server with Next.js

## Project Structure
```
app/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── creative-activity/ # Creative activities CRUD
│   ├── ethnic-group/      # Ethnic groups CRUD  
│   ├── tradition/         # Traditions CRUD
│   └── public-policy/     # Public policies CRUD
├── components/            # Reusable UI components
├── dashboard/             # Admin dashboard pages
└── auth/                  # Authentication pages

prisma/
├── schema.prisma          # Database schema
└── migrations/            # Database migrations

public/
└── uploads/               # File storage for images and documents
```

## Key Features
1. **สำนักงานเครือข่ายองค์กรงดเหล้า (SSN)** - ระบบจัดการข้อมูลเครือข่าย
2. **กิจกรรมสร้างสรรค์** - จัดการกิจกรรมทางวัฒนธรรม
3. **กลุ่มชาติพันธุ์** - ข้อมูลกลุ่มชาติพันธุ์ต่างๆ
4. **ประเพณี** - การจัดการข้อมูลประเพณีไทย
5. **นโยบายสาธารณะ** - ติดตามนโยบายที่เกี่ยวข้อง
6. **แดชบอร์ด** - สถิติและกราฟแสดงข้อมูล
7. **ระบบผู้ใช้** - การจัดการผู้ใช้และสิทธิ์

## Database Configuration
- **Development**: `mysql://root:root@localhost:3306/ssn_db`
- **Production**: `mysql://ssn_thailand:YY_h025194166@localhost:3306/ssn_db`
- **Authentication**: NextAuth with custom secret

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

## Important Notes
- Custom Thai font family (Seppuri) implemented
- Email notifications configured with Gmail SMTP
- File upload system for documents and images
- Multi-language support (Thai/English)
- Responsive design with mobile support
- Geographic data visualization for Thailand provinces
- Role-based access control with super admin features

## Recent Updates
- Added user relations and notification system
- Implemented tradition and policy management
- Enhanced health region level functionality
- Super admin role for advanced management

## File Upload Structure
```
public/uploads/
├── creative-activity-images/
├── creative-activity-files/
├── ethnic-group-images/
├── ethnic-group-files/
├── policy-files/
├── public-policy-images/
├── tradition-images/
└── profiles/
```

## Context for AI Assistant
When working with this codebase:
1. **Language**: Content is primarily in Thai, maintain Thai language for user-facing text
2. **Database**: Use Prisma for all database operations
3. **Authentication**: NextAuth.js is configured for user management
4. **File Handling**: Images are compressed and stored in organized folders
5. **UI Consistency**: Follow established patterns using Ant Design and Tailwind CSS
6. **Charts**: Multiple chart libraries available - choose based on data visualization needs
7. **Geographic Data**: Thailand province coordinates and regions are pre-configured