# Pharmacy System - Setup & Integration Guide

## Overview
The pharmacy system is now fully integrated with MongoDB backend. Each pharmacy gets a unique ID, and all billing, inventory, and stock data is stored per-pharmacy.

## Features Implemented
✅ **Unique Pharmacy ID** - Generated on signup (format: PH12345678)
✅ **Pharmacy Name Display** - Shows "Welcome, [Pharmacy Name]!" on billing page
✅ **Per-Pharmacy Inventory** - Each pharmacy sees only their own inventory
✅ **Local + Backend Sync** - Billing updates inventory locally (instant) and syncs with backend
✅ **MongoDB Integration** - All data stored in MongoDB with pharmacyId filter

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env` if not exists:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start backend:
```bash
node index.js
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### 2. Frontend Setup
```bash
cd ..  # Go to project root
npm install
```

Create `.env` in project root:
```env
VITE_API_BASE=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

## How It Works

### 1. Pharmacy Registration/Login
- Navigate to `/auth/pharmacy`
- **Signup**: Enter shop name, email, password, phone, location
  - System generates unique `pharmacyId` (e.g., PH12345678)
  - Stores in `localStorage.session` with pharmacy details
- **Login**: Enter email and password
  - Retrieves existing pharmacyId from memory

### 2. Session Storage
After login, `localStorage.session` contains:
```json
{
  "role": "pharmacy",
  "pharmacyId": "PH12345678",
  "pharmacyName": "MediCare Pharmacy",
  "user": {
    "shopName": "MediCare Pharmacy",
    "email": "pharmacy@example.com",
    "phone": "1234567890",
    "pharmacyId": "PH12345678"
  }
}
```

### 3. Pharmacy Dashboard Flow

#### **Billing Tab**
- Shows: "Welcome, [Pharmacy Name]! Pharmacy ID: PH12345678"
- Search medicines from inventory
- Add items to bill
- Complete sale:
  1. Updates local inventory immediately (optimistic update)
  2. Sends bill to backend: `POST /api/billing`
  3. Backend decrements stock in MongoDB
  4. Reloads inventory from backend to ensure consistency

#### **Scan & Stock Tab**
- Scan QR codes to add medicines
- Enter quantity, price, batch, expiry
- Add to inventory:
  - `POST /api/inventory` with `pharmacyId`
  - Stored in MongoDB with pharmacy filter

#### **Inventory Tab**
- Shows all medicines for current pharmacy
- Fetched via: `GET /api/inventory?pharmacyId=PH12345678`
- Real-time updates after billing/scanning

## API Endpoints

### Inventory
- `GET /api/inventory?pharmacyId=PH12345678` - Get pharmacy inventory
- `POST /api/inventory` - Add new medicine
  ```json
  {
    "pharmacyId": "PH12345678",
    "name": "Paracetamol 500mg",
    "drugCode": "DRG001",
    "batch": "BCH100",
    "expiry": "2026-01-10",
    "quantity": 120,
    "price": 15
  }
  ```
- `POST /api/inventory/update-stock` - Update stock
  ```json
  {
    "pharmacyId": "PH12345678",
    "drugCode": "DRG001",
    "qty": 10
  }
  ```

### Billing
- `POST /api/billing` - Create bill (auto-decrements stock)
  ```json
  {
    "pharmacyId": "PH12345678",
    "items": [
      { "drugCode": "DRG001", "name": "Paracetamol", "qty": 2, "price": 15 }
    ],
    "total": 30
  }
  ```
- `GET /api/billing?pharmacyId=PH12345678` - Get pharmacy bills

## Data Flow

```
┌─────────────────┐
│  Pharmacy Login │
│  (Auth Page)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate/Fetch  │
│  pharmacyId     │
│ Store in        │
│ localStorage    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         Pharmacy Dashboard              │
│  ┌─────────────────────────────────┐   │
│  │ Billing Tab                     │   │
│  │ - Welcome, [Name]!              │   │
│  │ - Shows pharmacyId              │   │
│  │ - Create bills                  │   │
│  │ - Updates inventory locally     │   │
│  │ - Syncs with backend            │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Scan & Stock Tab                │   │
│  │ - Scan QR codes                 │   │
│  │ - Add to backend inventory      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Inventory Tab                   │   │
│  │ - Shows pharmacy-specific items │   │
│  │ - Fetched from MongoDB          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB        │
│  Collections:   │
│  - inventories  │
│  - billings     │
│  (filtered by   │
│   pharmacyId)   │
└─────────────────┘
```

## Testing the Integration

### Test Scenario 1: New Pharmacy Signup
1. Go to `/auth/pharmacy`
2. Click "Signup"
3. Enter:
   - Shop Name: "Test Pharmacy"
   - Email: "test@pharmacy.com"
   - Password: "test123"
   - Phone: "9876543210"
4. Submit → Should redirect to pharmacy dashboard
5. Check browser console: `localStorage.getItem('session')` should show pharmacyId

### Test Scenario 2: Add Inventory
1. Go to "Scan & Stock" tab
2. Enter medicine details manually or scan
3. Add quantity and price
4. Click "Add to Inventory"
5. Go to "Inventory" tab → Should see the new medicine
6. Check MongoDB → Should have entry with your pharmacyId

### Test Scenario 3: Create Bill
1. Go to "Billing" tab
2. Should see "Welcome, Test Pharmacy!" with pharmacyId
3. Search for a medicine
4. Add to bill
5. Complete sale
6. Go to "Inventory" tab → Stock should be reduced
7. Check MongoDB:
   - `inventories` collection → quantity decreased
   - `billings` collection → new bill entry

## Troubleshooting

### Issue: "Missing pharmacyId" alert
**Solution**: Ensure you're logged in as pharmacy role. Check `localStorage.session` has `pharmacyId` field.

### Issue: Inventory not loading
**Solution**: 
1. Check backend is running on port 5000
2. Check `.env` has correct `VITE_API_BASE`
3. Check browser console for CORS errors
4. Verify MongoDB connection in backend logs

### Issue: Stock not updating after billing
**Solution**:
1. Check backend logs for errors
2. Verify `POST /api/billing` is being called
3. Check MongoDB connection
4. Ensure pharmacyId matches between frontend and backend

### Issue: Different pharmacy sees same inventory
**Solution**: Each pharmacy must have unique pharmacyId. Check session storage and ensure backend filters by pharmacyId.

## File Structure
```
src/
├── components/
│   ├── PharmacyDashboard.jsx    # Main dashboard with tabs
│   └── RoleAuth.jsx              # Login/signup with pharmacyId generation
├── pages/
│   ├── Billing/
│   │   └── Billing.jsx           # Billing UI with backend integration
│   ├── Scan/
│   │   └── ScanAddStock.jsx      # QR scanning for inventory
│   └── Inventory/
│       └── Inventory.jsx         # Inventory display
├── hooks/
│   └── usePharmacySession.js     # Hook to get pharmacyId & name
└── lib/
    └── api.js                    # API client with auth headers

backend/
├── controllers/
│   ├── inventoryController.js    # Inventory CRUD with pharmacyId filter
│   └── billingController.js      # Billing with stock decrement
├── models/
│   ├── Inventory.js              # Inventory schema with pharmacyId
│   └── Billing.js                # Billing schema with pharmacyId
└── routers/
    ├── inventoryRouter.js
    └── billingRouter.js
```

## Next Steps / Enhancements
- [ ] Add pharmacy profile page
- [ ] Implement billing history view
- [ ] Add stock alerts (low stock notifications)
- [ ] Export bills as PDF
- [ ] Add medicine search/filter in inventory
- [ ] Implement batch expiry tracking
- [ ] Add sales analytics dashboard

## Support
For issues or questions, check:
1. Browser console for frontend errors
2. Backend terminal for server errors
3. MongoDB logs for database issues
