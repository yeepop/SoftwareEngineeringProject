# 貓狗領養平台 (Pet Adoption Platform)

## 專案簡介

這是一個完整的貓狗領養平台系統，提供動物瀏覽、送養管理、領養申請、醫療紀錄管理等功能。

## 技術架構

### 前端 (Frontend)
- **框架**: Vue 3 + TypeScript + Vite
- **狀態管理**: Pinia
- **數據請求**: @tanstack/vue-query
- **表單驗證**: vee-validate + zod
- **UI 框架**: Tailwind CSS

### 後端 (Backend)
- **框架**: Flask + flask-smorest
- **ORM**: SQLAlchemy
- **遷移工具**: Alembic
- **任務隊列**: Celery
- **消息隊列**: Redis

### 資料庫與儲存
- **資料庫**: MySQL 8.0+ (InnoDB)
- **物件儲存**: MinIO
- **快取**: Redis

## 專案結構

```
proj_new/
├── backend/              # Flask 後端應用
│   ├── app/             # 應用主目錄
│   │   ├── blueprints/  # API 路由模組
│   │   ├── models/      # SQLAlchemy 模型
│   │   ├── services/    # 業務邏輯層
│   │   ├── utils/       # 工具函數
│   │   └── __init__.py  # Flask 應用工廠
│   ├── migrations/      # Alembic 遷移檔案
│   ├── config.py        # 設定檔
│   ├── requirements.txt # Python 依賴
│   └── run.py           # 應用入口
├── frontend/            # Vue 3 前端應用
│   ├── src/
│   │   ├── assets/      # 靜態資源
│   │   ├── components/  # Vue 組件
│   │   ├── composables/ # Composition API 邏輯
│   │   ├── pages/       # 頁面組件
│   │   ├── router/      # 路由設定
│   │   ├── stores/      # Pinia 狀態管理
│   │   ├── types/       # TypeScript 類型定義
│   │   └── App.vue      # 根組件
│   ├── package.json
│   └── vite.config.ts
├── docker/              # Docker 相關檔案
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
├── docker-compose.yml   # Docker Compose 設定
└── docs/                # 專案文檔
    ├── api/             # API 文檔
    └── development.md   # 開發指南
```

## 快速開始

### 環境需求

- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- MySQL 8.0+

### 使用 Docker Compose 啟動

```bash
# 複製環境變數檔案
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f
```

服務將在以下端口運行：
- 前端: http://localhost:3000
- 後端 API: http://localhost:5000
- MinIO 控制台: http://localhost:9001
- MySQL: localhost:3307

### 本地開發

#### 後端設置

```bash
cd backend

# 建立虛擬環境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安裝依賴
pip install -r requirements.txt

# 設定環境變數
cp .env.example .env

# 初始化資料庫
flask db upgrade

# 啟動開發伺服器
python run.py
```

#### 前端設置

```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建立生產版本
npm run build
```

## 主要功能模組

### 1. 動物瀏覽與搜尋
- 動物列表瀏覽
- 進階搜尋與篩選
- 動物詳情檢視
- 領養申請提交

### 2. 送養管理
- 個人送養發佈與管理
- 收容所送養發佈與批次匯入
- 送養狀態管理

### 3. 申請審核
- 申請列表瀏覽
- 申請狀態管理與指派
- 申請審核作業

### 4. 醫療紀錄
- 醫療紀錄新增與檢視
- 醫療紀錄驗證

### 5. 系統管理
- 使用者管理
- 權限管理
- 資料審核

### 6. 通知中心
- 通知瀏覽與管理

## API 文檔

API 文檔使用 OpenAPI 3.0 規範，可通過以下方式訪問：

- Swagger UI: http://localhost:5000/api/docs
- ReDoc: http://localhost:5000/api/redoc
- OpenAPI JSON: http://localhost:5000/api/openapi.json

## 測試

### 後端測試

```bash
cd backend
pytest tests/
```

### 前端測試

```bash
cd frontend
npm run test:unit      # 單元測試
npm run test:e2e       # E2E 測試
```

## 部署

詳細的部署指南請參考 [docs/deployment.md](docs/deployment.md)

## 授權

本專案僅供學習使用。

## 開發團隊

軟體工程專案 - 中期作業

## 版本歷史

- v0.1.0 (2025-10-22) - 初始專案架構建立
