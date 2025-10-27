# GPS Tracking - Complete End-to-End Implementation Guide

## 📋 Overview

This document provides a complete guide to the GPS Tracking system implementation in DCC-SFA. The system allows tracking sales representatives in real-time using GPS coordinates from mobile devices.

---

## 🏗️ Architecture Layers

### **1. Database Layer (Prisma)**

- **Table**: `gps_logs`
- **Location**: `prisma/schema.prisma`

```prisma
model gps_logs {
  id              Int       @id @default(autoincrement())
  user_id         Int
  latitude        Decimal   @db.Decimal(10, 8)
  longitude       Decimal   @db.Decimal(11, 8)
  log_time        DateTime? @default(now())
  accuracy_meters Int?
  speed_kph       Decimal?  @db.Decimal(10, 2)
  battery_level   Decimal?  @db.Decimal(5, 2)
  network_type    String?   @db.NVarChar(20)
  is_active       String    @default("Y")
  createdby       Int
  updatedby       Int?
  // ... relations
}
```

### **2. Backend API Layer (Node.js/Express)**

#### **Routes** (`dcc-sfa-be/src/v1/routes/gpsTracking.routes.ts`)

| Endpoint                             | Method | Description                       | Auth Required |
| ------------------------------------ | ------ | --------------------------------- | ------------- |
| `/api/v1/tracking/gps`               | POST   | Create GPS log (from mobile app)  | ✅ Yes        |
| `/api/v1/tracking/gps`               | GET    | Get GPS logs with filters         | ✅ Yes        |
| `/api/v1/tracking/gps/realtime`      | GET    | Get latest location for all users | ✅ Yes        |
| `/api/v1/tracking/gps/path/:user_id` | GET    | Get GPS path for specific user    | ✅ Yes        |

#### **Controller** (`dcc-sfa-be/src/v1/controllers/gpsTracking.controller.ts`)

- `createGPSLog()` - Creates new GPS log entry
- `getGPSTrackingData()` - Returns historical GPS logs
- `getRealTimeGPSTracking()` - Returns latest location for all active users
- `getUserGPSPath()` - Returns complete path for a specific user

#### **Validation** (`dcc-sfa-be/src/v1/validations/gpsTracking.validation.ts`)

Validates incoming GPS log data:

- `latitude`: Required, between -90 and 90
- `longitude`: Required, between -180 and 180
- `accuracy_meters`: Optional, positive integer
- `speed_kph`: Optional, positive number
- `battery_level`: Optional, between 0 and 100
- `network_type`: Optional, max 20 characters
- `log_time`: Optional, valid ISO 8601 date

### **3. Frontend Service Layer (Axios)**

#### **Service** (`dcc-sfa-fe/src/services/tracking/gpsTracking.ts`)

Functions:

- `fetchGPSTrackingData(filters)` - Fetch historical GPS logs
- `fetchRealTimeGPSTracking()` - Fetch real-time location data
- `fetchUserGPSPath(userId, filters)` - Fetch user-specific path

### **4. React Query Hooks**

#### **Hooks** (`dcc-sfa-fe/src/hooks/useGPSTracking.ts`)

- `useGPSTrackingData(filters)` - Manages cache with 3-minute stale time
- `useRealTimeGPSTracking()` - Auto-refreshes every 30 seconds
- `useUserGPSPath(userId, filters)` - Manages user path queries

### **5. React Component**

#### **Component** (`dcc-sfa-fe/src/pages/tracking/RepLocationTracking/index.tsx`)

Features:

- Real-time GPS tracking display
- Filter by representative
- Summary statistics (Total Reps, Active Now, Avg Speed, Tracking Points)
- Skeleton loaders during data fetch
- Auto-updates every 30 seconds

---

## 🔄 Complete Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: Mobile App Logs GPS                                  │
│                                                               │
│ POST /api/v1/tracking/gps                                    │
│ Headers: { Authorization: Bearer <token> }                  │
│ Body: {                                                       │
│   latitude: 24.7136,                                         │
│   longitude: 46.6753,                                        │
│   accuracy_meters: 10,                                       │
│   speed_kph: 45.5,                                           │
│   battery_level: 85,                                         │
│   network_type: "4G"                                         │
│ }                                                             │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: Backend Validates & Saves                            │
│                                                               │
│ 1. AuthenticateToken middleware verifies JWT                 │
│ 2. Validation middleware checks data format                  │
│ 3. Controller extracts user ID from token                    │
│ 4. Prisma saves to gps_logs table                            │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: Web App Fetches Data                                 │
│                                                               │
│ GET /api/v1/tracking/gps/realtime                            │
│ Headers: { Authorization: Bearer <token> }                  │
│                                                               │
│ Response: {                                                   │
│   summary: {                                                  │
│     total_users: 25,                                          │
│     users_with_location: 18,                                  │
│     timestamp: "2024-01-15T10:30:00Z"                        │
│   },                                                          │
│   gps_data: [{                                                │
│     user_id: 1,                                               │
│     user_name: "John Doe",                                    │
│     latitude: 24.7136,                                        │
│     longitude: 46.6753,                                       │
│     speed_kph: 45.5,                                          │
│     battery_level: 85,                                        │
│     last_update: "2024-01-15T10:29:45Z"                      │
│   }]                                                          │
│ }                                                             │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: React Query Caches & Displays                        │
│                                                               │
│ 1. React Query fetches data                                   │
│ 2. Shows skeleton loaders                                     │
│ 3. Updates UI with real data                                  │
│ 4. Auto-refreshes every 30 seconds                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### **Backend Setup**

1. **Register Routes** (Already done)

   ```typescript
   // dcc-sfa-be/src/routes/index.ts
   routes.use('/v1/tracking', gpsTracking);
   ```

2. **Start Backend Server**
   ```bash
   cd dcc-sfa-be
   npm run dev
   ```

### **Frontend Setup**

1. **Access the Page**
   - Navigate to: `http://localhost:5173/tracking/location`
   - Or click "Tracking" → "Rep Location Tracking" in sidebar

2. **View Real-Time Data**
   - Page auto-loads with skeleton loaders
   - Data appears after ~1 second
   - Auto-updates every 30 seconds

---

## 📱 Mobile App Integration

### **Example: Send GPS Data from Mobile App**

```javascript
// React Native / Flutter / Native Mobile App

async function sendGPSLog(location, deviceInfo) {
  try {
    const response = await fetch(
      'https://api.example.com/api/v1/tracking/gps',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy_meters: location.accuracy || null,
          speed_kph: location.speed ? location.speed * 3.6 : null, // m/s to km/h
          battery_level: deviceInfo.batteryLevel,
          network_type: deviceInfo.networkType,
          log_time: new Date().toISOString(),
        }),
      }
    );

    const data = await response.json();
    console.log('GPS log created:', data);
  } catch (error) {
    console.error('Failed to send GPS log:', error);
  }
}

// Call this periodically (e.g., every 30 seconds)
setInterval(() => {
  getCurrentLocation((location, deviceInfo) => {
    sendGPSLog(location, deviceInfo);
  });
}, 30000);
```

---

## 🧪 Testing the Complete Flow

### **1. Test POST Endpoint (Create GPS Log)**

```bash
curl -X POST http://localhost:3000/api/v1/tracking/gps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": 24.7136,
    "longitude": 46.6753,
    "accuracy_meters": 10,
    "speed_kph": 45.5,
    "battery_level": 85,
    "network_type": "4G"
  }'
```

### **2. Test GET Endpoint (Real-Time Data)**

```bash
curl -X GET http://localhost:3000/api/v1/tracking/gps/realtime \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3. Test Frontend Page**

1. Start frontend: `cd dcc-sfa-fe && npm run dev`
2. Login to the application
3. Navigate to: http://localhost:5173/tracking/location
4. View real-time GPS data

---

## 📊 Key Features

✅ **Real-Time Updates**: Auto-refresh every 30 seconds  
✅ **Loading States**: Skeleton loaders for better UX  
✅ **Filtering**: Filter by representative  
✅ **Summary Stats**: Total reps, active users, average speed  
✅ **Authentication**: JWT token required  
✅ **Validation**: Data validation on both client and server  
✅ **Error Handling**: Comprehensive error messages  
✅ **TypeScript**: Full type safety

---

## 🔍 API Response Examples

### **POST Response (Create GPS Log)**

```json
{
  "success": true,
  "message": "GPS log created successfully",
  "data": {
    "id": 12345,
    "user_id": 1,
    "user_name": "John Doe",
    "latitude": 24.7136,
    "longitude": 46.6753,
    "log_time": "2024-01-15T10:30:00.000Z",
    "accuracy_meters": 10,
    "speed_kph": 45.5,
    "battery_level": 85,
    "network_type": "4G"
  }
}
```

### **GET Response (Real-Time Data)**

```json
{
  "success": true,
  "message": "Real-time GPS tracking data retrieved successfully",
  "data": {
    "summary": {
      "total_users": 25,
      "users_with_location": 18,
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    "gps_data": [
      {
        "user_id": 1,
        "user_name": "John Doe",
        "user_email": "john@example.com",
        "employee_id": "EMP001",
        "latitude": 24.7136,
        "longitude": 46.6753,
        "last_update": "2024-01-15T10:29:45.000Z",
        "accuracy_meters": 10,
        "speed_kph": 45.5,
        "battery_level": 85,
        "network_type": "4G"
      }
    ]
  }
}
```

---

## 🛠️ Troubleshooting

### **Issue: GPS data not appearing**

- Check if mobile app is sending GPS logs
- Verify JWT token is valid
- Check database for gps_logs entries

### **Issue: Page shows "No GPS data available"**

- Ensure at least one user has GPS logs in database
- Check if logs are marked as `is_active: 'Y'`
- Verify user is logged in

### **Issue: Skeleton loaders stuck**

- Check network tab for API calls
- Verify backend is running
- Check console for errors

---

## 📝 Files Created/Modified

### **New Files**

- `dcc-sfa-be/src/v1/validations/gpsTracking.validation.ts`
- `GPS_TRACKING_IMPLEMENTATION.md` (this file)

### **Modified Files**

- `dcc-sfa-be/src/v1/controllers/gpsTracking.controller.ts` - Added `createGPSLog()` method
- `dcc-sfa-be/src/v1/routes/gpsTracking.routes.ts` - Added POST endpoint
- `dcc-sfa-fe/src/pages/tracking/RepLocationTracking/index.tsx` - Added skeleton loaders

---

## 🎯 Next Steps

1. **Deploy Backend**: Deploy backend API to production
2. **Deploy Frontend**: Deploy frontend to production
3. **Mobile App**: Integrate GPS logging in mobile app
4. **Testing**: Test complete flow in production environment
5. **Monitoring**: Set up monitoring for GPS data collection

---

## 📞 Support

For issues or questions:

1. Check logs in backend console
2. Inspect network requests in browser DevTools
3. Verify database records in Prisma Studio
4. Contact development team

---

_Last Updated: January 2024_
_Version: 1.0.0_
