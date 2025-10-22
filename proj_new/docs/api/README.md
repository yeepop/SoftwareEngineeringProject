# API 文檔

## 概述

本 API 使用 RESTful 風格設計，所有請求和回應均使用 JSON 格式。

## 基本資訊

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

## 身份驗證

### 註冊

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "myusername",
  "first_name": "John",
  "last_name": "Doe"
}
```

**回應**:
```json
{
  "message": "註冊成功",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "username": "myusername",
    "role": "GENERAL_MEMBER"
  }
}
```

### 登入

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**回應**:
```json
{
  "message": "登入成功",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "role": "GENERAL_MEMBER"
  }
}
```

### 刷新 Token

```http
POST /auth/refresh
Authorization: Bearer <refresh_token>
```

**回應**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 取得當前使用者

```http
GET /auth/me
Authorization: Bearer <access_token>
```

## 動物管理

### 取得動物列表

```http
GET /animals?species=DOG&page=1&per_page=20
```

**查詢參數**:
- `species`: 物種 (CAT, DOG)
- `sex`: 性別 (MALE, FEMALE, UNKNOWN)
- `status`: 狀態 (PUBLISHED)
- `shelter_id`: 收容所 ID
- `page`: 頁碼
- `per_page`: 每頁筆數

**回應**:
```json
{
  "animals": [
    {
      "animal_id": 1,
      "name": "Lucky",
      "species": "DOG",
      "breed": "混種犬",
      "sex": "MALE",
      "age": 2,
      "status": "PUBLISHED",
      "images": [...]
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "pages": 5
}
```

### 取得單一動物

```http
GET /animals/{animal_id}
```

### 建立動物

```http
POST /animals
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Lucky",
  "species": "DOG",
  "breed": "混種犬",
  "sex": "MALE",
  "dob": "2022-01-15",
  "description": "活潑可愛的狗狗"
}
```

### 更新動物

```http
PATCH /animals/{animal_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "PUBLISHED"
}
```

### 刪除動物

```http
DELETE /animals/{animal_id}
Authorization: Bearer <access_token>
```

## 申請管理

### 建立申請

```http
POST /applications
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "animal_id": 1,
  "type": "ADOPTION",
  "notes": "我非常希望能領養這隻狗狗..."
}
```

### 取得申請列表

```http
GET /applications?status=PENDING
Authorization: Bearer <access_token>
```

## 錯誤處理

API 使用標準 HTTP 狀態碼：

- `200`: 成功
- `201`: 建立成功
- `400`: 請求錯誤
- `401`: 未授權
- `403`: 禁止訪問
- `404`: 資源不存在
- `409`: 衝突
- `500`: 伺服器錯誤

錯誤回應格式：
```json
{
  "error": "錯誤訊息描述"
}
```

## Rate Limiting

API 實作速率限制：
- 每分鐘最多 60 次請求
- 超過限制將返回 `429 Too Many Requests`

## 完整 API 文檔

完整的 OpenAPI 規範文檔可在以下位置查看：
- Swagger UI: http://localhost:5000/api/docs
- ReDoc: http://localhost:5000/api/redoc
- OpenAPI JSON: http://localhost:5000/api/openapi.json
