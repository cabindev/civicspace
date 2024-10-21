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

    // ตั้งค่าเสิร์ฟไฟล์ static จากโฟลเดอร์ public/images
    server.use('/images', express.static(path.join(__dirname, 'public', 'images')));
    
    // ตั้งค่าเสิร์ฟไฟล์ static จากโฟลเดอร์ public/img
    server.use('/img', express.static(path.join(__dirname, 'public', 'img')));

    // Log requests ในโหมด development
    if (dev) {
        server.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });
    }

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});