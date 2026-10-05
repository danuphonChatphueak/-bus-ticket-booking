# Bus Ticket Booking System 🚌

ระบบจองตั๋วรถทัวร์ออนไลน์แบบครบวงจร พร้อมระบบจัดการสำหรับ Admin พัฒนาด้วย React, Node.js และ Azure SQL Database

## 1. Project Overview
ระบบจองตั๋วรถทัวร์ที่ให้ผู้ใช้ค้นหาเที่ยวรถ เลือกที่นั่ง และรับ E-Ticket ได้ทันที มีระบบป้องกันการจองที่นั่งซ้ำซ้อน (Double Booking) ด้วย SQL Transactions และมี Dashboard สำหรับ Admin ในการจัดการรถ เส้นทาง และเที่ยวรถ

## 2. Features
- **Passenger**: สมัครสมาชิก/เข้าสู่ระบบด้วย JWT, ค้นหาเที่ยวรถ, เลือกที่นั่งแบบ Interactive (ผังที่นั่งตามจริง), ดูการจองของฉัน, ยกเลิกการจอง, สร้าง QR Code E-Ticket
- **Admin**: Dashboard สรุปสถิติ, จัดการรถ (CRUD), จัดการเส้นทาง, จัดการเที่ยวรถ, ตรวจสอบและเปลี่ยนสถานะการจอง, ดูข้อมูลผู้โดยสาร
- **Security**: ป้องกันที่นั่งซ้ำด้วย SQL Transaction (UNIQUE constraint), เข้ารหัสรหัสผ่านด้วย bcrypt, Role-based API authorization

## 3. Technology Stack
- **Frontend**: React.js, Vite, React Router, Tailwind-like custom CSS (Glassmorphism design)
- **Backend**: Node.js, Express.js, mssql (Azure SQL)
- **Database**: Microsoft Azure SQL Database
- **Cloud & Deployment**: Azure App Service, Azure Static Web Apps, GitHub Actions (CI/CD)

## 4. Project Structure
```text
bus-ticket-booking/
├── frontend/             # React (Vite) Frontend App
├── backend/              # Node.js (Express) Backend API
├── database/             # SQL Schema & Seed Data
└── .github/workflows/    # CI/CD pipelines
```

## 5. Database Setup
1. สร้าง **Azure SQL Database** ใน Azure Portal
2. ใช้เครื่องมือเช่น Azure Data Studio หรือ SQL Server Management Studio (SSMS) เชื่อมต่อไปยัง Database
3. รันโค้ดทั้งหมดในไฟล์ `database/schema.sql` (โค้ดนี้จะสร้าง Table, Indexes และเพิ่มข้อมูลเริ่มต้น รวมถึง Admin account)

## 6. Local Development

### 1) Clone Repository
```bash
git clone <repository-url>
cd bus-ticket-booking
```

### 2) Backend Setup
```bash
cd backend
npm install
```
คัดลอกไฟล์ `.env.example` เป็น `.env` และตั้งค่า Database และ JWT:
```text
DB_SERVER=your-server.database.windows.net
DB_DATABASE=your-db
DB_USER=your-user
DB_PASSWORD=your-password
JWT_SECRET=your-secret
PORT=8080
FRONTEND_URL=http://localhost:5173
```
เริ่มรันเซิร์ฟเวอร์:
```bash
npm run dev
```

### 3) Frontend Setup (เปิด Terminal ใหม่อีกจอ)
```bash
cd frontend
npm install
npm run dev
```

## 7. Environment Variables
ห้ามนำ Environment Variables (เช่น รหัสผ่าน DB, JWT Secret) ใส่ลงใน GitHub เด็ดขาด
- ให้ใช้ `.env` สำหรับทดสอบ Local (ไฟล์นี้ถูก ignore ใน git)
- ส่วนใน Production (Azure) ให้ไปตั้งค่าใน **Environment variables** ของ Azure App Service

## 8. GitHub Setup
1. สร้าง Repository ใหม่ใน GitHub
2. Push code ทั้งหมดนี้ขึ้น GitHub Repository ของคุณ

## 9. Azure App Service Setup (Backend)
1. ไปที่ Azure Portal -> Create a resource -> **Web App**
2. เลือก Publish: **Code**
3. Runtime stack: **Node 18 LTS**
4. Operating System: **Linux**
5. สร้างเสร็จแล้ว ให้ไปที่เมนู **Settings -> Environment variables** และเพิ่มค่าดังนี้:
   - `DB_SERVER`
   - `DB_DATABASE`
   - `DB_USER`
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `PORT` (ค่าปกติใช้ 8080 ก็ได้ Azure จะจับคู่ให้)
   - `FRONTEND_URL` (URL ของเว็บ Frontend ที่ Deploy แล้ว)

## 10. Azure SQL Setup
1. Create Resource -> **Azure SQL** -> **Single database**
2. ตั้งค่า Server Admin login และ Password
3. ไปที่ **Set server firewall** เลือก "Allow Azure services and resources to access this server" เพื่อให้ App Service เชื่อมได้
4. นำ Connection string มาใส่ใน App Service Environment Variables

## 11. GitHub Actions Setup (CI/CD)
1. ใน Azure Portal -> Web App ของคุณ -> ไปที่ **Deployment Center**
2. เลือก Source: **GitHub**
3. Login ด้วย GitHub และเลือก Repository ของคุณ
4. Azure จะสร้างไฟล์ Workflow (`.github/workflows/main_xxx.yml`) อัตโนมัติและสร้าง Secrets ใน GitHub ให้ (หรือคุณจะใช้ไฟล์ `.github/workflows/azure-deploy.yml` ที่เตรียมไว้ให้ก็ได้)

## 12. การตั้ง GitHub Secrets (ทำด้วยตนเองถ้าไม่ใช้ Deployment Center)
ไปที่ GitHub Repository -> Settings -> Secrets and variables -> Actions -> **New repository secret**
เพิ่ม:
- `AZUREAPPSERVICE_CLIENTID`
- `AZUREAPPSERVICE_TENANTID`
- `AZUREAPPSERVICE_SUBSCRIPTIONID`
*(ข้อมูลเหล่านี้จะได้จากการสร้าง Service Principal ใน Azure Entra ID)*

## 13. Deployment (สรุป)
เมื่อมีการ Push Code ไปที่ Branch `main`:
```text
GitHub → Trigger GitHub Actions → Build Node.js → Zip File → Deploy to Azure App Service
```
ระบบจะออนไลน์โดยอัตโนมัติ

## 14. Frontend Deployment
แนะนำให้ Deploy Frontend บน **Azure Static Web Apps**
1. สร้าง Static Web App ใน Azure
2. เลือกเชื่อมกับ GitHub
3. Build Details:
   - Framework: `React`
   - App location: `/frontend`
   - Output location: `dist`
4. เมื่อสร้างเสร็จ ไปตั้งค่า **Environment variables** ใน Static Web App:
   - `VITE_API_URL` = `https://<ชื่อ-backend-app>.azurewebsites.net`

## 15. API Documentation & Production Testing
เมื่อระบบออนไลน์แล้ว สามารถทดสอบว่า Backend ทำงานปกติหรือไม่ผ่าน Health Check:
```text
GET https://<your-backend-app-name>.azurewebsites.net/health
```
Response ควรเป็น:
```json
{
    "status": "ok",
    "service": "bus-ticket-booking-api"
}
```
