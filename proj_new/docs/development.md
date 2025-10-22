# 開發指南

## 專案架構說明

本專案採用前後端分離架構：

### 後端 (Flask)

- **Framework**: Flask + flask-smorest (OpenAPI)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (flask-jwt-extended)
- **Task Queue**: Celery + Redis
- **Object Storage**: MinIO

#### 目錄結構

```
backend/
├── app/
│   ├── __init__.py          # Flask 應用工廠
│   ├── blueprints/          # API 路由模組
│   │   ├── auth.py          # 身份驗證
│   │   ├── animals.py       # 動物管理
│   │   ├── applications.py  # 申請管理
│   │   └── ...
│   ├── models/              # SQLAlchemy 模型
│   │   ├── user.py
│   │   ├── animal.py
│   │   └── ...
│   ├── services/            # 業務邏輯層
│   └── utils/               # 工具函數
├── migrations/              # Alembic 遷移
├── config.py                # 配置檔
└── run.py                   # 應用入口
```

#### 開發流程

1. **環境設置**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **資料庫遷移**
   ```bash
   # 初始化 Alembic (首次)
   flask db init
   
   # 建立遷移
   flask db migrate -m "描述"
   
   # 執行遷移
   flask db upgrade
   ```

3. **啟動開發伺服器**
   ```bash
   python run.py
   ```

4. **API 文檔**
   - Swagger UI: http://localhost:5000/api/docs
   - ReDoc: http://localhost:5000/api/redoc

### 前端 (Vue 3)

- **Framework**: Vue 3 + TypeScript + Vite
- **State Management**: Pinia
- **Server State**: @tanstack/vue-query
- **Form Validation**: vee-validate + zod
- **Styling**: Tailwind CSS

#### 目錄結構

```
frontend/
├── src/
│   ├── api/              # API 客戶端
│   ├── assets/           # 靜態資源
│   ├── components/       # Vue 組件
│   ├── composables/      # Composition API 邏輯
│   ├── pages/            # 頁面組件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 狀態管理
│   ├── types/            # TypeScript 類型定義
│   ├── App.vue           # 根組件
│   └── main.ts           # 應用入口
├── index.html
├── vite.config.ts
└── package.json
```

#### 開發流程

1. **環境設置**
   ```bash
   cd frontend
   npm install
   ```

2. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

3. **建立生產版本**
   ```bash
   npm run build
   ```

## 核心功能開發指南

### 1. 新增 API 端點

1. 在 `backend/app/blueprints/` 建立或編輯 Blueprint
2. 定義路由和處理函數
3. 使用 `@jwt_required()` 保護需要認證的端點
4. 使用 SQLAlchemy 進行資料庫操作

範例：
```python
@animals_bp.route('', methods=['POST'])
@jwt_required()
def create_animal():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    animal = Animal(
        name=data.get('name'),
        species=Species(data['species']),
        created_by=current_user_id
    )
    
    db.session.add(animal)
    db.session.commit()
    
    return jsonify(animal.to_dict()), 201
```

### 2. 新增前端頁面

1. 在 `frontend/src/pages/` 建立 Vue 組件
2. 在 `router/index.ts` 註冊路由
3. 使用 composables 管理狀態和 API 請求

範例：
```vue
<script setup lang="ts">
import { ref } from 'vue'
import api from '@/api/client'

const animals = ref([])

const fetchAnimals = async () => {
  const response = await api.get('/animals')
  animals.value = response.data.animals
}

fetchAnimals()
</script>
```

### 3. 使用 Celery 執行背景任務

1. 在 `backend/app/tasks/` 定義任務
2. 使用 `@celery.task` 裝飾器
3. 透過 API 調用任務

範例：
```python
@celery.task
def process_batch_import(file_path):
    # 處理批次匯入邏輯
    pass

# 在 API 中調用
job_id = process_batch_import.delay(file_path)
return jsonify({'job_id': job_id}), 202
```

## 測試

### 後端測試
```bash
cd backend
pytest tests/
```

### 前端測試
```bash
cd frontend
npm run test:unit
npm run test:e2e
```

## 部署

### 使用 Docker Compose

```bash
# 複製環境變數檔案
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 編輯 .env 檔案，設定生產環境變數

# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

## 最佳實踐

1. **程式碼風格**
   - Python: 遵循 PEP 8
   - TypeScript: 使用 ESLint 和 Prettier

2. **Git 提交**
   - 使用清晰的提交訊息
   - 遵循 Conventional Commits 規範

3. **安全性**
   - 永遠不要提交敏感資訊到版本控制
   - 使用環境變數管理配置
   - 定期更新依賴套件

4. **效能**
   - 使用分頁處理大量資料
   - 實作適當的快取策略
   - 優化資料庫查詢

## 常見問題

### Q: 如何重置資料庫？
```bash
cd backend
flask db downgrade base
flask db upgrade
```

### Q: 如何清除 Redis 快取？
```bash
docker-compose exec redis redis-cli FLUSHALL
```

### Q: 前端連不到後端 API？
確認以下設置：
- 後端是否正在運行 (http://localhost:5000)
- CORS 配置是否正確
- Vite 代理配置是否正確

## 相關資源

- [Flask 文檔](https://flask.palletsprojects.com/)
- [Vue 3 文檔](https://vuejs.org/)
- [SQLAlchemy 文檔](https://docs.sqlalchemy.org/)
- [Pinia 文檔](https://pinia.vuejs.org/)
- [Tailwind CSS 文檔](https://tailwindcss.com/)
