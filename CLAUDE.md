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
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── post/              # Posts proxy API
│   ├── categories/        # Categories proxy API
│   ├── videos/            # Videos proxy API
│   └── surveys/           # Surveys proxy API (NEW)
├── dashboard/             # Admin dashboard for staff
│   ├── page.tsx           # Dashboard with API statistics
│   ├── posts/             # Posts management
│   ├── categories/        # Categories management
│   └── surveys/           # Surveys management (NEW)
├── components/            # Reusable components
│   ├── Navbar.tsx         # Navigation bar
│   ├── Footer.tsx         # Footer component
│   ├── Loading.tsx        # Loading states
│   └── SurveyCard.tsx     # Survey card component (NEW)
├── auth/                  # Authentication pages
├── page.tsx               # Homepage with CivicSpace API data
├── post/[slug]/           # Individual post pages
├── layout.tsx             # Root layout
└── globals.css            # Global styles with yellow theme

lib/
└── api.ts                 # API library with Survey interface (NEW)

prisma/
├── schema.prisma          # Minimal schema (User + Role only)
└── migrations/            # Database migrations
```

## Key Features
1. **หน้าแรก** - แสดงบทความล่าสุด, วิดีโอ, และแบบสำรวจจาก CivicSpace API
2. **แดชบอร์ด** - สถิติและข้อมูลภาพรวมสำหรับเจ้าหน้าที่
3. **ระบบผู้ใช้** - การจัดการผู้ใช้และสิทธิ์ (NextAuth.js)
4. **API Integration** - เชื่อมต่อกับ CivicSpace API สำหรับข้อมูลเนื้อหา
5. **Surveys Management** - จัดการและดาวน์โหลดแบบสำรวจ (NEW)
6. **Clean Design** - ดีไซน์เรียบง่าย เน้นตัวหนังสือขนาดเล็ก สีเหลือง
7. **เฉพาะเจ้าหน้าที่** - ระบบสำหรับเจ้าหน้าที่เท่านั้น

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

**Posts Endpoints:**
- `GET /posts/` - All posts with pagination
- `GET /posts/latest/?limit=N` - Latest posts
- `GET /posts/popular/?limit=N` - Popular posts by view count
- `GET /posts/{slug}/` - Single post details
- `GET /categories/{slug}/posts/` - Posts by category

**Categories Endpoints:**
- `GET /categories/` - All categories with post counts
- `GET /categories/{slug}/` - Category details

**Videos Endpoints:**
- `GET /videos/` - All videos with pagination
- `GET /videos/latest/?limit=N` - Latest videos

**Surveys Endpoints (NEW):**
- `GET /surveys/` - All surveys with pagination
- `GET /surveys/latest/?limit=N` - Latest surveys
- `GET /surveys/popular/?limit=N` - Popular surveys by view count
- `GET /surveys/{slug}/` - Single survey details (increments view_count)
- `GET /categories/{slug}/surveys/` - Surveys by category

**Survey Response Structure:**
```json
{
  "id": 1,
  "title": "แบบสำรวจ...",
  "slug": "survey-slug",
  "description": "คำอธิบาย",
  "author": "email@example.com",
  "category": {
    "id": 10,
    "name": "หมวดหมู่",
    "slug": "category-slug"
  },
  "survey_file_url": "https://.../file.docx",
  "is_published": true,
  "survey_date": "2025-10-08",
  "response_count": 0,
  "view_count": 0,
  "created_at": "2025-10-08T11:44:48+07:00",
  "updated_at": "2025-10-08T11:44:48+07:00",
  "published_at": "2025-10-08T11:44:48+07:00"
}
```

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
5. **API Proxy**: Use internal API routes (`/api/surveys`, `/api/posts`, etc.) instead of calling external API directly
6. **UI Consistency**: Follow clean, minimal design patterns with Tailwind CSS
7. **Icons**: Use Lucide React icons only
8. **Color Scheme**: Stick to yellow-based theme for consistency
9. **Target Audience**: Government officials and staff members only
10. **Surveys**: Files are downloadable via `window.open()` to external blob storage URLs

## Recent Updates (October 2025)
- ✅ Added Surveys Management feature
- ✅ Created `/api/surveys` proxy route with pagination support
- ✅ Built `SurveyCard` component (compact variant)
- ✅ Dashboard surveys page with statistics
- ✅ Homepage displays latest 3 surveys
- ✅ Download functionality for survey files (.docx)