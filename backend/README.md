# HackCBS Backend Setup

## 1. Environment Setup
- Copy `.env.example` to `.env` and add your MongoDB Atlas URI:
  ```
  MONGO_URI=your_mongodb_atlas_uri
  ```

## 2. Install Dependencies
```
cd backend
npm install
```

## 3. Start Backend Server
```
npm start
```
Server runs on port 5000 by default.

## 4. API Endpoints
- `POST /api/pharmacy` — Add pharmacy details
- `GET /api/pharmacy` — Get all pharmacies
- `POST /api/inventory` — Add inventory item (include `pharmacyId`)
- `GET /api/inventory` — Get inventory (optionally filter by pharmacy)
- `POST /api/billing` — Create bill (include `pharmacyId`, `items`, `total`)
- `GET /api/billing?pharmacyId=...` — Get bills for a pharmacy

## 5. Testing
Use Postman or your frontend to test endpoints. Make sure backend is running and frontend fetches from `http://localhost:5000/api/...`.
