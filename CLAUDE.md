# CivicSpace Project - Claude Context

## Project Overview
CivicSpace : พื้นที่พลเมืองร่วมหาทางออกปัญหาแอลกอฮอล์ เป็นศูนย์ข้อมูลและพื้นที่สำหรับเจ้าหน้าที่ในการทำงานร่วมกันหาทางออกปัญหาแอลกอฮอล์ รวบรวมข้อมูล บทความ และโครงการต่างๆ โดยใช้ API จาก CivicSpace API สำหรับแสดงเนื้อหา

## Technical Stack
- **Frontend**: Next.js 14 with React 18, TypeScript
- **UI Libraries**: Tailwind CSS, Lucide React Icons
- **Database**: MySQL with Prisma ORM (auth only)
- **Authentication**: NextAuth.js with Prisma adapter
- **External Data**: CivicSpace API integration
- **Styling**: Custom CSS with yellow color scheme
- **Design**: Clean, minimal design focused on small fonts and readability

## Project Structure
```
app/
├── api/                    # API routes (auth only)
│   └── auth/              # Authentication endpoints
├── dashboard/             # Admin dashboard for staff
│   └── page.tsx           # Dashboard with API statistics
├── auth/                  # Authentication pages
├── page.tsx               # Homepage with CivicSpace API data
├── layout.tsx             # Root layout
└── globals.css            # Global styles with yellow theme

prisma/
├── schema.prisma          # Minimal schema (User + Role only)
└── migrations/            # Database migrations
```

## Key Features
1. **หน้าแรก** - แสดงบทความล่าสุดและยอดนิยมจาก CivicSpace API
2. **แดชบอร์ด** - สถิติและข้อมูลภาพรวมสำหรับเจ้าหน้าที่
3. **ระบบผู้ใช้** - การจัดการผู้ใช้และสิทธิ์ (NextAuth.js)
4. **API Integration** - เชื่อมต่อกับ CivicSpace API สำหรับข้อมูลเนื้อหา
5. **Clean Design** - ดีไซน์เรียบง่าย เน้นตัวหนังสือขนาดเล็ก สีเหลือง
6. **เฉพาะเจ้าหน้าที่** - ระบบสำหรับเจ้าหน้าที่เท่านั้น

## Database Configuration
- **Development**: `mysql://root:root@localhost:3306/civicspace`
- **Authentication**: NextAuth with custom secret

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## External API Integration

### CivicSpace API
Base URL: `https://civicspace-gqdcg0dxgjbqe8as.southeastasia-01.azurewebsites.net/api/v1`

**Key Endpoints:**
- `GET /posts/` - All posts with pagination
- `GET /posts/latest/?limit=N` - Latest posts
- `GET /posts/popular/?limit=N` - Popular posts by view count
- `GET /categories/` - All categories with post counts
- `GET /posts/{slug}/` - Single post details
- `GET /categories/{slug}/posts/` - Posts by category

## Color Scheme
Yellow-based theme with careful attention to readability:
```css
--primary: #f59e0b;        /* Main yellow */
--secondary: #92400e;      /* Dark brown */
--accent: #fbbf24;         /* Light yellow */
--background: #fffbeb;     /* Cream background */
--foreground: #78350f;     /* Dark text */
```

## Design Principles
1. **Small font sizes** - 14px base, clean typography
2. **Minimal interface** - Focus on content
3. **Staff-focused** - Built for internal use by officials
4. **Data-driven** - Real statistics from external API
5. **Responsive** - Mobile-friendly design

## Context for AI Assistant
When working with this codebase:
1. **Language**: Content is primarily in Thai, maintain Thai language for user-facing text
2. **Database**: Use Prisma only for authentication (User model)
3. **Authentication**: NextAuth.js is configured for user management
4. **External Data**: Fetch all content from CivicSpace API
5. **UI Consistency**: Follow clean, minimal design patterns with Tailwind CSS
6. **Icons**: Use Lucide React icons only
7. **Color Scheme**: Stick to yellow-based theme for consistency
8. **Target Audience**: Government officials and staff members only