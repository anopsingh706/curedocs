# CureDocs — Secure Medical Vault

> A full-stack MERN application for uploading, organizing, and managing personal medical records in one secure, cloud-backed vault.
>
> **Live Demo** - curedocs.vercel.app : https://curedocs-4b2w4g7mk-anops706-6213s-projects.vercel.app?_vercel_share=AGFPWb7XvS45hg3u1dDN1xk7ksKDXSzW


---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| State | Redux Toolkit + RTK Query |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express |
| Auth | JWT + bcryptjs |
| Upload | Multer + Cloudinary SDK |
| Database | MongoDB Atlas + Mongoose |
| CDN | Cloudinary |

---

## Project Structure

```
curedocs/
├── package.json              # Root: concurrently dev script
├── .env.example              # Environment variable template
├── .gitignore
│
├── server/
│   ├── server.js             # Express entry point
│   ├── package.json
│   ├── config/
│   │   ├── db.js             # MongoDB connect + category seeding
│   │   └── cloudinary.js     # Cloudinary SDK + Multer storage
│   ├── models/
│   │   ├── User.js           # User schema (bcrypt hashing)
│   │   ├── Category.js       # Category schema
│   │   └── MedicalFile.js    # MedicalFile schema (indexed)
│   ├── controllers/
│   │   ├── authController.js      # register, login, getMe
│   │   ├── categoryController.js  # CRUD categories
│   │   └── fileController.js      # upload, list, detail, update, publish, delete, stats
│   ├── middleware/
│   │   ├── auth.js           # protect (JWT verify) + adminOnly guard
│   │   └── errorHandler.js   # notFound + global error handler
│   ├── routes/
│   │   ├── auth.js
│   │   ├── categories.js
│   │   └── files.js
│   └── utils/
│       └── fileHelpers.js    # detectFileType, formatBytes
│
└── client/
    ├── index.html
    ├── vite.config.js        # Dev proxy → localhost:5000
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx           # React root + Redux Provider
        ├── App.jsx            # Router + protected/admin routes
        ├── assets/styles/
        │   └── index.css      # Tailwind + CSS design tokens
        ├── store/
        │   ├── store.js
        │   ├── slices/
        │   │   └── authSlice.js          # credentials + localStorage
        │   └── api/
        │       ├── apiSlice.js           # RTK Query base (JWT headers)
        │       ├── authApi.js            # login, register, getMe
        │       ├── filesApi.js           # full file CRUD + stats
        │       └── categoriesApi.js      # category CRUD
        ├── utils/
        │   └── helpers.js     # CAT_CONFIG, formatDate, formatBytes, timeAgo
        ├── components/
        │   ├── layout/
        │   │   ├── AppLayout.jsx   # Sidebar + Topbar + <Outlet>
        │   │   ├── Sidebar.jsx     # Nav links, category list, user footer
        │   │   └── Topbar.jsx      # Search bar, Upload button
        │   ├── auth/
        │   │   ├── ProtectedRoute.jsx
        │   │   └── AdminRoute.jsx
        │   ├── common/
        │   │   ├── Spinner.jsx
        │   │   ├── StatCard.jsx
        │   │   └── CategoryBadge.jsx
        │   ├── files/
        │   │   ├── FileCard.jsx       # Gallery card with hover actions
        │   │   ├── CategoryTabs.jsx   # Filter pill tabs
        │   │   ├── UploadModal.jsx    # Full upload form + drag-drop
        │   │   └── EditFileModal.jsx  # Edit metadata modal
        │   └── admin/                 # (extend here for category manager)
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx   # Stats, recent files, activity, storage
            ├── GalleryPage.jsx     # Grid/list, filters, pagination
            ├── FileDetailPage.jsx  # Full metadata, preview, edit, delete
            ├── AdminPage.jsx       # File table with publish toggles
            └── NotFoundPage.jsx
```

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourname/curedocs.git
cd curedocs
npm run install:all
```

### 2. Environment variables

```bash
cp .env.example server/.env
```

Fill in `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/curedocs
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Also create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run development servers

```bash
npm run dev
```

This runs both frontend (`:5173`) and backend (`:5000`) concurrently.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/auth/me` | JWT | Current user profile |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | Public | List all categories |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete (non-default only) |

### Files
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/files` | JWT | List own files (filter, search, paginate) |
| GET | `/api/files/stats` | JWT | Dashboard stats |
| GET | `/api/files/:id` | JWT | Single file detail |
| POST | `/api/files/upload` | JWT | Upload file + metadata |
| PUT | `/api/files/:id` | Owner | Edit metadata |
| PATCH | `/api/files/:id/publish` | Admin | Toggle publish flag |
| DELETE | `/api/files/:id` | Owner/Admin | Delete from DB + Cloudinary |

---

## Document Categories

| Category | Accepted Formats |
|----------|-----------------|
| Clinical & Consultation | PDF, DOCX, JPG |
| Lab & Diagnostic Reports | PDF, JPG, DICOM |
| Hospital & Surgical Records | PDF, DOCX |
| Medications & Preventive Care | PDF, CSV, DOCX |
| Administrative & Legal | PDF, DOCX, JPG |

---

## Deployment

**Frontend → Vercel**
```bash
cd client && npm run build
# Deploy /dist to Vercel
# Set VITE_API_BASE_URL to your Render backend URL
```

**Backend → Render**
- Connect GitHub repo, set root to `/server`
- Add all environment variables in Render dashboard
- Build command: `npm install`
- Start command: `npm start`

---

## Roadmap

- [ ] PDF inline viewer (react-pdf)
- [ ] DICOM viewer integration
- [ ] Shared record links with expiry
- [ ] Two-factor authentication
- [ ] Bulk upload + ZIP export
- [ ] Doctor/hospital directory
- [ ] Audit log for admin actions
- [ ] Mobile app (React Native)

---

## License

MIT © 2026 CureDocs
