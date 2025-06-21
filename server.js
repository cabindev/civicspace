const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
    const server = express();

    // ตั้งค่าเสิร์ฟไฟล์ static จากโฟลเดอร์ public
    server.use(express.static(path.join(__dirname, 'public')));

    // ตั้งค่าเสิร์ฟไฟล์ static จากโฟลเดอร์ public/images (เก่า)
    server.use('/images', express.static(path.join(__dirname, 'public', 'images')));
    
    // ตั้งค่าเสิร์ฟไฟล์ static จากโฟลเดอร์ public/img (เก่า)
    server.use('/img', express.static(path.join(__dirname, 'public', 'img')));

    // ===== UPLOADS FOLDER ROUTING =====
    // หลัก: เสิร์ฟไฟล์ทั้งหมดใน uploads/
    server.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

    // รายละเอียด: เสิร์ฟแต่ละโฟลเดอร์ย่อย (เพื่อความชัดเจน)
    
    // Profile Images
    server.use('/uploads/profiles', express.static(path.join(__dirname, 'public', 'uploads', 'profiles')));
    
    // Creative Activity
    server.use('/uploads/creative-activity-images', express.static(path.join(__dirname, 'public', 'uploads', 'creative-activity-images')));
    server.use('/uploads/creative-activity-files', express.static(path.join(__dirname, 'public', 'uploads', 'creative-activity-files')));
    
    // Ethnic Group
    server.use('/uploads/ethnic-group-images', express.static(path.join(__dirname, 'public', 'uploads', 'ethnic-group-images')));
    server.use('/uploads/ethnic-group-files', express.static(path.join(__dirname, 'public', 'uploads', 'ethnic-group-files')));
    
    // Public Policy
    server.use('/uploads/public-policy-images', express.static(path.join(__dirname, 'public', 'uploads', 'public-policy-images')));
    server.use('/uploads/policy-files', express.static(path.join(__dirname, 'public', 'uploads', 'policy-files')));
    
    // Tradition
    server.use('/uploads/tradition-images', express.static(path.join(__dirname, 'public', 'uploads', 'tradition-images')));
    server.use('/uploads/tradition-policy-files', express.static(path.join(__dirname, 'public', 'uploads', 'tradition-policy-files')));

    // ===== SECURITY HEADERS =====
    // เพิ่ม security headers สำหรับไฟล์ที่อัปโหลด
    server.use('/uploads', (req, res, next) => {
        // ป้องกัน hotlinking (optional)
        // res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // ตั้งค่า cache สำหรับรูปภาพ (1 วัน)
        if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        }
        
        // ตั้งค่า cache สำหรับไฟล์ PDF (1 ชั่วโมง)
        if (req.path.match(/\.(pdf|doc|docx)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
        }
        
        next();
    });

    // ===== DEVELOPMENT LOGGING =====
    if (dev) {
        server.use((req, res, next) => {
            // แสดงเฉพาะ requests ที่สำคัญ
            if (req.url.startsWith('/api') || 
                req.url.startsWith('/uploads') || 
                req.url.startsWith('/images') || 
                req.url.startsWith('/img')) {
                console.log(`📁 ${req.method} ${req.url}`);
            }
            next();
        });
    }

    // ===== ERROR HANDLING FOR STATIC FILES =====
    // จัดการ 404 สำหรับไฟล์ที่ไม่พบ
    server.use('/uploads', (req, res, next) => {
        res.status(404).json({ 
            error: 'File not found',
            path: req.path,
            message: 'The requested file does not exist'
        });
    });

    // ===== NEXT.JS ROUTING =====
    // ส่ง requests อื่นๆ ไปให้ Next.js จัดการ
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    // ===== START SERVER =====
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`🚀 Server ready on http://localhost:${port}`);
        console.log(`📁 Static files served from:`);
        console.log(`   - /uploads/* → public/uploads/*`);
        console.log(`   - /images/* → public/images/*`);
        console.log(`   - /img/* → public/img/*`);
        
        if (dev) {
            console.log(`🔍 Development mode: Logging enabled`);
        }
    });
});