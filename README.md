# 寵物領養平台 🐾

一個現代化的貓狗領養平台，讓愛心人士能夠輕鬆找到需要家庭的毛孩子。

## 功能特色

### 用戶功能
- 🔐 用戶註冊與登入系統
- 🔍 搜尋與篩選寵物
- 📝 線上領養申請
- 👤 個人資料管理
- 📱 響應式設計，支援行動裝置

### 管理員功能  
- 🐕 寵物資訊管理
- 📋 領養申請審核
- 📊 統計數據儀表板
- 🛡️ 用戶權限管理

### 技術特色
- 🚀 現代化技術棧
- 🎨 美觀的使用者介面
- 🔒 安全的身份驗證
- 📈 完整的 API 文檔
- 🧪 全面的測試覆蓋

## 技術架構

### 後端 (Backend)
- **Node.js 18+** - JavaScript 運行環境
- **NestJS** - 現代化的 Node.js 框架
- **TypeScript** - 類型安全的 JavaScript
- **Prisma** - 現代化的 ORM
- **PostgreSQL** - 關聯式資料庫
- **JWT** - 身份驗證
- **Swagger** - API 文檔

### 前端 (Frontend)
- **React 18** - 使用者介面框架
- **TypeScript** - 類型安全
- **Vite** - 現代化的建置工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **React Query** - 伺服器狀態管理
- **React Router** - 路由管理

### 資料庫
- **PostgreSQL** - 主要資料庫
- **Prisma Schema** - 資料庫結構定義
- **種子資料** - 測試用初始資料

## 快速開始

### 環境要求
- Node.js 18+ 
- PostgreSQL 12+
- npm 或 yarn

### 1. 複製專案
```bash
git clone <repository-url>
cd SoftwareEnginnering
```

### 2. 設定資料庫
```bash
# 安裝 PostgreSQL 並建立資料庫
createdb pet_adoption_db
```

### 3. 後端設定
```bash
cd backend

# 安裝依賴
npm install

# 複製環境變數檔案並修改設定
cp .env.example .env
# 編輯 .env 檔案，設定資料庫連接字串

# 生成 Prisma 客戶端
npx prisma generate

# 執行資料庫遷移
npx prisma db push

# 載入種子資料
npm run prisma:seed
```

### 4. 前端設定  
```bash
cd ../frontend

# 安裝依賴
npm install

# 複製環境變數檔案
cp .env.example .env
```

### 5. 啟動服務

#### 開發模式
```bash
# 啟動後端 (終端機 1)
cd backend
npm run start:dev

# 啟動前端 (終端機 2) 
cd frontend
npm run dev
```

#### 生產模式
```bash
# 建置後端
cd backend
npm run build
npm run start:prod

# 建置前端
cd frontend  
npm run build
npm run preview
```

## 預設帳戶

系統預設建立了以下測試帳戶：

| 角色 | 帳號 | 密碼 | 說明 |
|------|------|------|------|
| 管理員 | admin@petadoption.com | admin123 | 系統管理員 |
| 用戶 | user1@example.com | user123 | 一般用戶 |
| 用戶 | user2@example.com | user123 | 一般用戶 |

## API 文檔

後端啟動後，可以在以下網址查看 API 文檔：
- Swagger UI: http://localhost:3001/api

## 專案結構

```
SoftwareEnginnering/
├── backend/                 # 後端專案
│   ├── src/
│   │   ├── auth/           # 身份驗證模組
│   │   ├── users/          # 用戶管理模組  
│   │   ├── listings/       # 寵物清單模組
│   │   ├── applications/   # 領養申請模組
│   │   ├── admin/          # 管理功能模組
│   │   └── prisma/         # 資料庫服務
│   ├── prisma/
│   │   ├── schema.prisma   # 資料庫結構
│   │   └── seed.ts         # 種子資料
│   └── package.json
├── frontend/               # 前端專案
│   ├── src/
│   │   ├── components/     # 可重用元件
│   │   ├── pages/          # 頁面元件
│   │   ├── contexts/       # React 上下文
│   │   ├── hooks/          # 自定義 Hooks
│   │   ├── api/            # API 呼叫
│   │   └── types.ts        # TypeScript 類型定義
│   └── package.json
└── specs/                  # 專案規格文檔
    └── 001-project-vision-mission/
```

## 開發指南

### 後端開發
```bash
# 生成新的 Prisma 遷移
npx prisma migrate dev --name <migration-name>

# 重置資料庫
npx prisma migrate reset

# 檢視資料庫
npx prisma studio

# 執行測試
npm run test

# 執行 E2E 測試  
npm run test:e2e
```

### 前端開發
```bash
# 啟動開發伺服器
npm run dev

# 類型檢查
npm run type-check

# 建置專案
npm run build

# 預覽建置結果
npm run preview
```

## 部署

### 使用 Docker (推薦)
```bash
# 建置容器
docker-compose build

# 啟動服務
docker-compose up -d
```

### 手動部署
1. 設定生產環境的資料庫
2. 設定環境變數
3. 建置前後端專案
4. 使用 PM2 或類似工具管理 Node.js 程序
5. 使用 Nginx 作為反向代理

## 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`) 
5. 開啟 Pull Request

## 授權

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 聯絡資訊

如有任何問題或建議，歡迎聯絡：
- Email: contact@petadoption.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

❤️ 用愛心打造，為毛孩子們找到溫暖的家