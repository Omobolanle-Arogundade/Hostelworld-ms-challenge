# Record Store Challenge API

## Description

A scalable NestJS-based API built to manage a record store’s inventory and orders. It supports robust querying, authentication, admin features, and a flexible caching mechanism. The application is production-ready, equipped with unit and end-to-end test suites, linting, and Docker support for local development.

Live API is deployed and accessible here:  
**https://hostelworld-ms-challenge-976456345277.europe-west1.run.app**

---

## 🔥 Highlights & Improvements

- **Advanced Query Optimization**: Aggregation pipelines added to improve performance when querying order statistics.
- **Flexible Caching Layer**: Swappable cache implementation using either NodeCache or Redis. Controlled via environment variables.
- **Role-based Access Control**: Guards and decorators added to restrict access for non-admin users.
- **Modular Design**: Separated concerns using modules for auth, records, orders, users, admin_ui, etc.
- **Static Frontend Support**: admin_ui (Vite-based) can be built and served via ServeStaticModule in Nest.
- **Comprehensive Error Handling**: Custom exception filters and structured responses.
- **Observability**: Logs via Nest logger, `/metrics` for Prometheus, and `/api-docs` for Swagger API documentation.

---

## 🛠 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB with Docker (For Local Dev)

```bash
npm run mongo:start
```

This runs MongoDB on localhost:27017. Update your `.env`:

```
MONGO_URL=mongodb://localhost:27017/records
```

### 3. Setup Database with Seed Data

```bash
npm run setup:db
```

This imports `data.json` into the records collection. It will prompt whether to clear existing records.

**Example data.json record:**

```json
[
  {
    "artist": "Foo Fighters",
    "album": "Foo Fighers",
    "price": 8,
    "qty": 10,
    "format": "CD",
    "category": "Rock",
    "mbid": "d6591261-daaa-4bb2-81b6-544e499da727"
  }
]
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root:

```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/records
CACHE_TYPE=node       # or redis
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
```

---

## 🚀 Running the App

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

---

## 🐳 Docker Support

### Start MongoDB & App

```bash
docker-compose -f docker-compose-mongo.yml up -d
```

---

## 🎛️ Serve Static Admin UI

The Admin UI is built using Vite and stored in `src/admin_ui`.

```bash
npm run build:ui
```

Then served automatically by the backend using ServeStaticModule. Accessible at the same URL as the API:
**https://hostelworld-ms-challenge-976456345277.europe-west1.run.app**

---

## 🧩 API Prefixing

All backend routes are prefixed with `/api` to distinguish from frontend routes.

---

## 🧠 Caching System

The application supports two cache implementations:

- `NodeCache` (default, in-memory, fast, ephemeral)
- `Redis` (persistent, scalable)

```env
CACHE_TYPE=redis     # or node
```

The service injects the appropriate caching provider accordingly.

---

## ✅ Testing

### Unit Tests

```bash
npm run test
```

### Coverage

```bash
npm run test:cov
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Linting

```bash
npm run lint
```

---

## 🧪 Developer Tools

- **Swagger Docs**: [`/swagger`](https://hostelworld-ms-challenge-976456345277.europe-west1.run.app/swagger)
- **Metrics (Prometheus)**: [`/metrics`](https://hostelworld-ms-challenge-976456345277.europe-west1.run.app/metrics)

---

## 📄 License

MIT
