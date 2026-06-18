# Cafetron Frontend: Complete Feature List & Architecture

## System Overview
**Cafetron Frontend** is a modern Angular (v21.2.16) application that provides a comprehensive user interface for employees to order from vendors, vendors to manage their orders, and admins to monitor operations. Built with standalone components, lazy loading, and role-based routing guards.

---

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Angular 21.2.16 (latest standalone components)
- **Language**: TypeScript 5.9.3
- **HTTP Client**: Angular HttpClient with custom interceptors
- **Charts**: ng2-charts with Chart.js (for admin analytics)
- **QR Scanning**: jsqr library for web-based QR code scanning
- **Routing**: Standalone components with lazy loading
- **State Management**: Services + RxJS Observables
- **Build Tool**: Angular CLI 21.2.14

### Project Structure
```
frontend/src/app/
├── core/                    # Core services & infrastructure
│   ├── auth/               # Authentication service
│   ├── guards/             # Route guards (auth, role-based)
│   ├── interceptors/       # HTTP interceptors (JWT token)
│   └── services/           # Core application services
├── features/               # Feature modules (lazy-loaded)
│   ├── auth/              # Login & Registration
│   ├── menu/              # Menu browsing & management
│   ├── cart-order/        # Shopping cart & order placement
│   ├── wallet/            # Wallet management
│   ├── order-qr/          # QR code display & scanning
│   ├── pickup-scanner/    # Counter/vendor pickup interface
│   ├── vendor/            # Vendor dashboard & order management
│   ├── admin/             # Admin dashboard & reports
│   └── profile/           # User profile & settings
├── shared/                 # Shared components & utilities
│   ├── components/        # Header, footer, etc.
│   └── models/            # Shared data models
├── models/                 # Global type definitions
└── app.routes.ts          # Central routing configuration
```

---

## 🔐 Authentication & Authorization Module

### Features
- **User Registration** - Sign up with email, password, employee ID, and department
- **User Login** - Email/password authentication with JWT token
- **JWT Token Management** - Automatic token storage and refresh
- **Role-Based Access Control** - Four role types: ADMIN, EMPLOYEE, COUNTER, VENDOR
- **Protected Routes** - Route guards enforce authentication and authorization
- **Auto-Login** - Token persistence across sessions

### Components
- **LoginComponent** (`features/auth/login/login.component.ts`)
  - Email/password form
  - Login error handling
  - "Register" link for new users
  - Redirects to menu on successful login
  
- **RegisterComponent** (`features/auth/register/register.component.ts`)
  - Form fields: name, email, password, employeeId, department, role
  - Password strength validation
  - Duplicate email checking
  - Auto-login after registration

### Services
- **AuthService** (`core/auth/auth.service.ts`)
  - `login(credentials)` - Authenticate user
  - `register(data)` - Create new user account
  - `logout()` - Clear token and session
  - `isAuthenticated()` - Check if user has valid token
  - `getCurrentUser()` - Get logged-in user info
  - `getToken()` - Get JWT token from storage

### Route Guards
- **authGuard** - Requires user to be authenticated
  - Redirects to login if not authenticated
  - Applied to all protected routes
  
- **roleGuard** - Validates user has required role
  - Checks `data.roles` in route configuration
  - Supports multiple roles per route
  - Redirects to unauthorized page if role mismatch

### Auth Models
```typescript
export const APP_ROLES = {
  admin: 'ADMIN',      // Admin console access
  employee: 'EMPLOYEE',  // Can place orders
  counter: 'COUNTER',    // Counter staff (scans QR)
  vendor: 'VENDOR',      // Vendor management
};

interface LoginRequest {
  employeeId: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  department: string;
  role: AppRole;
}

interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: AppRole | string;
}
```

### HTTP Interceptor
- **authInterceptor** (`core/interceptors/auth.interceptor.ts`)
  - Adds JWT token to every HTTP request header
  - Refreshes token if expired (optional)
  - Handles 401 unauthorized responses

---

## 🍽️ Menu Module

### Features
- **Browse Menu** - View all available menu items from vendors
- **Search Items** - Search by item name or keywords
- **Filter by Type** - Filter items by dietary type (VEG, NON-VEG, etc.)
- **View Today's Menu** - Show only available items from active vendors
- **Item Details** - See item name, price, vendor, availability, stock
- **Manage Menu** (Admin/Vendor only) - CRUD operations on menu items
- **Stock Management** - Update item stock levels
- **Availability Control** - Toggle item availability/visibility

### Components
- **MenuBrowseComponent** (`features/menu/menu-browse/`)
  - Displays grid/list of menu items
  - Add to cart button per item
  - Real-time stock display
  - Filters and search bar
  - Vendor information
  
- **MenuManageComponent** (`features/menu/menu-manage/`)
  - Admin/Vendor can add new items
  - Edit existing menu items
  - Update stock levels
  - Toggle item availability
  - Delete items from menu

### Services
- **MenuService** (`features/menu/menu.service.ts`)
  - `getTodaysMenu()` - Get available items
  - `searchMenu(query)` - Search by name
  - `filterByType(type)` - Filter by dietary type
  - `getItemById(id)` - Get single item details
  - `createItem(data)` - Create new item (admin/vendor)
  - `updateItem(id, data)` - Update item
  - `deleteItem(id)` - Delete item
  - `updateStock(id, quantity)` - Update item stock
  - `setAvailability(id, available)` - Toggle visibility

### Data Models
```typescript
interface MenuItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  foodType: string;        // VEG, NON-VEG, etc.
  isAvailable: boolean;
  vendor: Vendor;
  description?: string;
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}
```

### Route Configuration
```
GET /menu                    → Browse all items
GET /menu/today              → Today's available items
GET /menu/search?name=...    → Search items
GET /menu/filter?type=...    → Filter by type
POST /menu                   → Create item (vendor/admin)
GET /menu/{id}               → Get item details
PUT /menu/{id}               → Update item (vendor/admin)
PATCH /menu/{id}/stock       → Update stock (vendor/admin)
DELETE /menu/{id}            → Delete item (vendor/admin)
```

---

## 🛒 Shopping Cart & Order Module

### Features
- **Add to Cart** - Add menu items with quantity
- **View Cart** - See all cart items with totals
- **Remove from Cart** - Delete items from cart
- **Update Quantity** - Change item quantity in cart
- **Checkout** - Convert cart to order
- **Pickup Slot Selection** - Choose order collection time
- **Order History** - View all user's past orders
- **Order Details** - See order items, status, total amount
- **Order Status Tracking** - Monitor order progress (PENDING → COLLECTED)
- **Reorder** - Quickly reorder items from previous orders
- **Timeout Handling** - Display orders that timed out (vendor didn't respond)

### Components
- **CartComponent** (`features/cart-order/cart/`)
  - Display cart items in table/list
  - Update quantities inline
  - Remove items with confirmation
  - Show cart total
  - "Proceed to Checkout" button
  - "Continue Shopping" link
  
- **CheckoutComponent** (`features/cart-order/checkout/`)
  - Review order items and total
  - Select pickup slot from available options
  - Confirm payment (from wallet)
  - Show order confirmation with QR code
  - Display order ID for reference
  
- **OrderHistoryComponent** (`features/cart-order/order-history/`)
  - List user's all orders with status
  - Search/filter orders by date
  - Click to view order details
  - Reorder button per order
  
- **OrderDetailComponent** (`features/cart-order/order-history/order-detail/`)
  - Full order information
  - Line items with prices
  - Order status and timeline
  - Vendor responses (accepted/declined items)
  - Refund status if applicable
  - Download QR code

### Services
- **OrderService** (`features/cart-order/services/order.service.ts`)
  - `placeOrder(cartData)` - Submit order
  - `getMyOrders()` - Get user's order history
  - `getOrderDetail(orderId)` - Get single order
  - `cancelOrder(orderId)` - Cancel order (within window)
  - `processTimeout(orderId)` - Handle order timeout
  
- **CartService** (`features/cart-order/services/cart.service.ts`)
  - `addItem(menuItem, quantity)` - Add to cart
  - `removeItem(itemId)` - Remove from cart
  - `updateQuantity(itemId, quantity)` - Change quantity
  - `getCart()` - Get all cart items
  - `clearCart()` - Empty cart after checkout
  - `getCartTotal()` - Calculate total price
  - `getPickupSlots()` - Get available time slots

### Data Models
```typescript
interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  userId: number;
  status: 'PENDING_VENDOR' | 'ACCEPTED' | 'COLLECTED' | 'CANCELLED' | 'TIMEOUT';
  paymentStatus: 'PAID' | 'REFUNDED';
  totalAmount: number;
  pickupSlot: string;
  token: string;        // QR code token
  createdAt: Date;
  readyAt?: Date;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  vendorStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TIMEOUT';
}
```

### Route Configuration
```
POST /api/cart/items             → Add to cart
DELETE /api/cart/items/{itemId}  → Remove from cart
GET /api/cart                    → Get cart contents
GET /api/cart/slots              → Get pickup slots
POST /api/orders                 → Place order (checkout)
GET /api/orders                  → Get order history
GET /api/orders/{orderId}        → Get order details
POST /api/orders/{orderId}/timeout → Process timeout
```

---

## 💳 Wallet Module

### Features
- **View Wallet Balance** - Display current account balance
- **Top-Up Wallet** - Add funds to wallet (simulated payment gateway)
- **View Transaction History** - See all wallet transactions (paginated)
- **Transaction Details** - Type, amount, description, timestamp
- **Order-Linked Transactions** - See which transaction belongs to which order
- **Refund Tracking** - Monitor refunds for cancelled/timeout orders
- **Balance Validation** - Check if sufficient funds before order placement

### Components
- **WalletComponent** (`features/wallet/wallet.component.ts`)
  - Display current balance prominently
  - Top-up form with amount input
  - Payment simulation (no real gateway)
  - Transaction history table (paginated)
  - Transaction filters (type, date range)
  - Linked order reference per transaction

### Services
- **WalletService** (`features/wallet/services/wallet.service.ts`)
  - `getWalletBalance()` - Get current balance
  - `topUpWallet(amount)` - Add funds
  - `getTransactions(page, limit)` - Paginated transaction history
  - `getTransactionDetail(id)` - Single transaction info
  - `linkOrderToTransaction(orderId)` - Get order for transaction

### Data Models
```typescript
interface Wallet {
  id: number;
  userId: number;
  balance: number;      // BigDecimal in backend
  updatedAt: Date;
}

interface Transaction {
  id: number;
  walletId: number;
  type: 'TOPUP' | 'DEBIT' | 'REFUND';
  amount: number;
  description: string;
  orderId?: number;     // If order-related
  createdAt: Date;
}
```

### Route Configuration
```
GET /api/wallet                    → Get balance
POST /api/wallet/topup             → Top-up funds
GET /api/wallet/transactions       → Get history (paginated)
```

---

## 📸 Order QR Code Module

### Features
- **QR Code Display** - Show QR code for user's order
- **QR Code Generation** - Frontend displays backend-generated code
- **QR Code Download** - Save QR code as image
- **QR Code Sharing** - Share QR via email/messaging
- **Real-Time Updates** - Fetch latest QR after order placement

### Components
- **OrderQRDisplayComponent** (`features/order-qr/order-qr-display/`)
  - Large QR code display
  - Order ID and details
  - Download QR button
  - Share QR options
  - Print QR code
  
- **OrderQrScannerComponent** (`features/order-qr/order-qr-scanner/`)
  - Web camera access for QR scanning
  - Real-time QR detection using jsqr
  - Fallback upload option
  - Beep sound on successful scan
  - Scanned order details display
  
- **OrderQRUploadComponent** (`features/order-qr/order-qr-upload/`)
  - File upload for QR code images
  - Image preview
  - Extract and verify QR from image

### Services
- **OrderQRService** (`features/order-qr/services/order-qr.service.ts`)
  - `generateQR(orderId)` - Fetch QR from backend
  - `displayQR(token)` - Render QR code
  - `downloadQR(token)` - Export as PNG/PDF
  - `shareQR(token, method)` - Share QR code
  - `validateQRToken(token)` - Verify QR authenticity

### Technologies Used
- **jsqr** - Lightweight QR scanner
- **HTML5 Canvas** - QR rendering
- **MediaDevices API** - Camera access

---

## 🏪 Pickup & Counter Scanner Module

### Features
- **Counter Order Queue** - Real-time list of pending orders
- **QR Verification** - Scan QR code at counter
- **Order Status Update** - Mark order as COLLECTED
- **Conflict Reporting** - Flag order issues (missing items, etc.)
- **Order Details Display** - Show items in order after scanning
- **Polling Updates** - Auto-refresh queue every few seconds
- **Vendor Dashboard** - Pending orders for vendor items

### Components
- **OrderQrScannerComponent** (`features/pickup-scanner/`)
  - Camera-based QR scanning
  - Upload fallback
  - Verification results
  - Order item listing
  - Mark collected button
  
- **QueueComponent** (`features/pickup-scanner/queue/`)
  - Paginated order list
  - Auto-polling every 3-5 seconds
  - Order status indicators
  - Vendor filter
  - Quick-scan button per order
  - Conflict flag button

### Services
- **PickupService** (`features/pickup-scanner/services/pickup.service.ts`)
  - `getOrderQueue()` - Get pending orders
  - `verifyQRToken(token)` - Validate QR
  - `markOrderCollected(orderId)` - Update status
  - `flagConflict(orderId, reason)` - Report issue
  - `getQueueWithPolling()` - RxJS polling setup

### Real-Time Features
- **Polling Strategy** - Frontend polls `/api/pickup/queue` every few seconds
- **No WebSocket** - Lightweight polling reduces server load
- **Optimized Queries** - Only fetch pending orders
- **Auto-Refresh** - Queue updates without manual refresh

---

## 🏪 Vendor Management Module

### Features
- **Vendor Dashboard** - Overview of all orders for vendor
- **Pending Orders** - View orders awaiting vendor response
- **Accept Order** - Vendor accepts items in order
- **Decline Order** - Vendor declines with optional reason
- **Order Tracking** - Monitor which orders are accepted/declined
- **Timeout Alerts** - See orders about to expire
- **Vendor Profile** - Edit vendor information
- **Item Management** - Manage vendor's menu items
- **Response History** - Track past responses

### Components
- **VendorOrdersComponent** (`features/vendor/vendor-orders/`)
  - Paginated list of pending orders
  - Order details with items
  - Accept/Decline buttons per item
  - Reason input for decline
  - Filter by status
  - Sort by created date
  
- **VendorManageComponent** (`features/vendor/vendor-manage/`)
  - CRUD for vendor information
  - Contact details
  - Active/inactive toggle
  - Menu items management
  - Vendor list for admin

### Services
- **VendorService** (`features/vendor/services/vendor.service.ts`)
  - `getVendorOrders()` - Get pending orders
  - `acceptOrder(statusId)` - Accept order item
  - `declineOrder(statusId, reason)` - Decline with reason
  - `getVendorDetail(vendorId)` - Get vendor info
  - `updateVendor(vendorId, data)` - Edit vendor
  - `createVendor(data)` - Create new vendor (admin)
  - `deleteVendor(vendorId)` - Remove vendor

### Data Models
```typescript
interface VendorOrder {
  id: number;
  vendorId: number;
  orderItemId: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TIMEOUT';
  menuItemName: string;
  quantity: number;
  customerId: number;
  createdAt: Date;
  actionExpiresAt: Date;
  declineReason?: string;
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: Date;
}
```

---

## 📊 Admin Dashboard & Reporting Module

### Features
- **Dashboard Overview** - Key metrics and charts
- **Daily Analytics** - Orders, revenue, items sold per day
- **Top Items Report** - Best-selling items with quantities
- **Revenue Charts** - Revenue trend visualization
- **Order Status Breakdown** - Pie chart of order statuses
- **Date Range Reports** - Filter data by date
- **CSV Export** - Export reports to CSV
- **Window Control** - Open/close order placement
- **Cutoff Time Management** - Set daily order deadline
- **Admin Logs** - System activity tracking

### Components
- **DashboardComponent** (`features/admin/dashboard/`)
  - Key metrics cards (total revenue, orders today, active vendors)
  - Daily revenue chart
  - Order status pie chart
  - Top 10 items table
  - Recent orders list
  - Refresh button
  
- **OperationsComponent** (`features/admin/operations/`)
  - Order window toggle (open/close)
  - Daily cutoff time picker
  - System status indicators
  - Activity logs
  - Configuration settings
  - Emergency actions

### Services
- **AdminReportService** (`features/admin/admin-report.service.ts`)
  - `getDailyReport(date)` - Daily summary
  - `getTopItems(limit)` - Top selling items
  - `getRevenueRange(from, to)` - Revenue series
  - `getStatusBreakdown(date)` - Order status counts
  - `exportToCSV(data)` - CSV export
  - `getConfiguration()` - Get system config
  - `updateConfiguration(config)` - Update config

### Chart Integration
- **Library**: ng2-charts with Chart.js
- **Chart Types**:
  - Line chart for revenue trends
  - Pie/Doughnut chart for order statuses
  - Bar chart for top items
  - Area chart for daily metrics

### Data Models
```typescript
interface DailyReport {
  date: Date;
  orderCount: number;
  revenue: number;
  itemsSold: number;
}

interface TopItem {
  menuItemId: number;
  name: string;
  qtySold: number;
  revenue: number;
}

interface RevenuePoint {
  date: Date;
  revenue: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface OrderingConfig {
  windowOpen: boolean;
  cutoffTime: string;  // HH:mm format
}
```

---

## 👥 User Profile Module

### Features
- **View Profile** - See user information
- **Edit Profile** - Update name, email, department
- **Change Password** - Secure password update
- **Account Settings** - Preferences and notifications
- **Logout** - Clear session and token

### Components
- **ProfileComponent** (`features/profile/profile.component.ts`)
  - Display user info
  - Edit form for profile fields
  - Password change form
  - Account deactivation option
  - Logout button

### Services
- **UserService** (`core/services/user.service.ts`)
  - `getUserProfile()` - Get current user info
  - `updateProfile(data)` - Update user info
  - `changePassword(oldPwd, newPwd)` - Change password
  - `deactivateAccount()` - Disable account

---

## 🎨 Shared Components

### Header Component (`shared/components/header/`)
- **Navigation Bar** - Links to main sections
- **User Menu** - Dropdown with profile/logout
- **Role Badge** - Display user's current role
- **Wallet Balance** - Quick access to balance (if employee)
- **Search Bar** - Global search (optional)
- **Notifications** - Order status notifications (optional)
- **Theme Toggle** - Dark/light mode (optional)

### Footer Component (`shared/components/footer/`)
- **Copyright Info** - Company information
- **Links** - Help, support, policy links
- **Contact Info** - Support email/phone
- **Social Links** - Company social media

---

## 🔒 Core Infrastructure

### HTTP Interceptor
- **JWT Token Injection** - Automatically adds token to requests
- **Error Handling** - Global error response handling
- **Loading Indicator** - Show loading state during requests
- **Request/Response Logging** - Debug HTTP traffic
- **Retry Logic** - Automatic retry for failed requests (optional)

### Route Guards
```typescript
// authGuard: Check if user is authenticated
// Redirects to login if no token
canActivate: [authGuard]

// roleGuard: Check if user has required role
// Requires data.roles in route config
canActivate: [authGuard, roleGuard]
data: { roles: ['ADMIN', 'VENDOR'] }
```

### Error Handling
- **Global Error Handler** - Centralized error display
- **Toast Notifications** - User-friendly error messages
- **Retry Mechanisms** - Automatic retry for transient errors
- **Fallback Pages** - 404, unauthorized, server error pages

---

## 🚀 Application Configuration

### App Configuration (`app.config.ts`)
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // Standalone routing with input binding
    provideRouter(routes, withComponentInputBinding()),
    
    // HTTP client with JWT interceptor
    provideHttpClient(withInterceptors([authInterceptor])),
    
    // Animation support
    provideAnimationsAsync(),
    
    // Chart.js support
    provideCharts(withDefaultRegisterables()),
  ],
};
```

### Route Configuration (`app.routes.ts`)
- **Public Routes**: Login, Register (no auth required)
- **Protected Routes**: Menu, Cart, Orders, Profile (auth required)
- **Role-Protected Routes**: Admin, Vendor (specific roles required)
- **Lazy Loading**: Feature modules loaded on-demand
- **Fallback**: Redirects unknown routes to login

---

## 📱 User Role-Based Features

### EMPLOYEE Role
- ✅ Browse menu
- ✅ Add items to cart
- ✅ Place orders
- ✅ View order history
- ✅ View order details
- ✅ Top-up wallet
- ✅ View wallet transactions
- ✅ View wallet balance
- ✅ Update profile
- ✅ Download QR code

### VENDOR Role
- ✅ Manage menu items (add/edit/delete)
- ✅ View pending orders for their items
- ✅ Accept orders
- ✅ Decline orders with reason
- ✅ View vendor dashboard
- ✅ Update vendor profile
- ✅ View inventory/stock

### COUNTER Role
- ✅ Scan QR codes
- ✅ Verify orders
- ✅ Mark orders as collected
- ✅ Flag order conflicts
- ✅ View pending order queue
- ✅ Auto-refresh queue

### ADMIN Role
- ✅ Access to all employee features
- ✅ All vendor features
- ✅ All counter features
- ✅ View analytics dashboard
- ✅ Generate reports (daily, revenue, top items)
- ✅ Export reports to CSV
- ✅ Manage vendors (CRUD)
- ✅ Control ordering window
- ✅ Set daily cutoff time
- ✅ View system logs

---

## 🌐 API Integration

### Key API Endpoints Used
```typescript
// Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/me

// Menu
GET    /api/menu
GET    /api/menu/today
GET    /api/menu/search
GET    /api/menu/filter
POST   /api/menu
PUT    /api/menu/{id}
PATCH  /api/menu/{id}/stock
DELETE /api/menu/{id}

// Cart & Orders
POST   /api/cart/items
DELETE /api/cart/items/{id}
GET    /api/cart
GET    /api/cart/slots
POST   /api/orders
GET    /api/orders
GET    /api/orders/{id}
POST   /api/orders/{id}/timeout

// Wallet
GET    /api/wallet
POST   /api/wallet/topup
GET    /api/wallet/transactions

// Pickup & QR
GET    /api/pickup/qr/{orderId}
GET    /api/pickup/queue
POST   /api/pickup/verify
POST   /api/pickup/conflict/{orderId}

// Vendor
GET    /api/vendor/orders
POST   /api/vendor/orders/{statusId}/accept
POST   /api/vendor/orders/{statusId}/decline
GET    /api/vendors
POST   /api/vendors
GET    /api/vendors/{id}
PUT    /api/vendors/{id}

// Admin
GET    /api/admin/reports/daily
GET    /api/admin/reports/top-items
GET    /api/admin/reports/range
GET    /api/admin/reports/status-breakdown
GET    /api/admin/config
POST   /api/admin/window/toggle
PUT    /api/admin/cutoff
```

---

## 🎯 Development & Build

### NPM Scripts
```bash
npm start           # Start dev server (ng serve)
npm run build       # Production build (ng build)
npm run watch       # Watch mode build
npm test            # Run unit tests (Jasmine/Karma)
npm run ng          # Angular CLI commands
```

### Development Server
- **Port**: 4200 (default)
- **Hot Reload**: Automatic on file changes
- **CORS**: Configured to accept backend (http://localhost:8081)
- **Build**: Ahead-of-Time (AOT) compilation

### Production Build
- **Optimization**: Tree-shaking, minification, uglification
- **Code Splitting**: Lazy-loaded feature modules
- **Caching**: Service worker for offline support (optional)
- **Size**: Optimized bundle with ng2-charts and jsqr included

---

## 🧪 Testing

### Test Framework
- **Unit Testing**: Jasmine 6.3.0
- **Test Runner**: Karma 6.4.4
- **Coverage**: Karma Coverage 2.2.1
- **Headless Browser**: Chrome Launcher

### Test Execution
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --code-coverage # Generate coverage report
```

---

## 📦 Dependencies Summary

### Core Dependencies
- **@angular/core** - Framework core
- **@angular/router** - Client-side routing
- **@angular/forms** - Reactive & template forms
- **@angular/common/http** - HTTP client
- **rxjs** - Reactive programming
- **tslib** - TypeScript runtime library
- **zone.js** - Angular zone management

### Feature Libraries
- **ng2-charts** 9.0.0 - Chart visualization
- **chart.js** 4.5.1 - Chart rendering engine
- **jsqr** 1.4.0 - QR code scanning
- **@angular/animations** - Animation support

### Dev Dependencies
- **TypeScript** 5.9.3 - Compilation
- **Angular CLI** 21.2.14 - Build tooling
- **Karma** - Test runner
- **Jasmine** - Test framework

---

## 🎨 Styling & Theming

### CSS Architecture
- **Standalone Styles** - Component-scoped styles
- **Global Styles** (`styles.css`) - Shared variables and resets
- **CSS Variables** - Theme colors, spacing, shadows
- **Responsive Design** - Mobile-first approach
- **Animations** - Smooth transitions and page loads

### Design System
- **Color Palette** - Primary, secondary, success, error, warning colors
- **Typography** - Font sizes, weights, line heights
- **Spacing** - Consistent margin/padding system
- **Border Radius** - Rounded corners configuration
- **Shadows** - Depth and elevation effects
- **Responsive Breakpoints** - Mobile, tablet, desktop

---

## 🔄 Data Flow & State Management

### State Management Approach
- **RxJS Subjects** - Observable-based state management
- **Services as State** - Centralized services maintain app state
- **Component Subscriptions** - Components subscribe to services
- **OnPush Strategy** - Change detection optimization
- **Memory Management** - Unsubscribe in ngOnDestroy

### Key State Stores
- **AuthService** - Current user and authentication state
- **CartService** - Shopping cart items
- **OrderService** - Order history and details
- **WalletService** - Wallet balance and transactions
- **MenuService** - Menu items and filters

---

## 🔒 Security Features

### Frontend Security Measures
- **JWT Token Storage** - Secure token in localStorage (vulnerable; should use httpOnly cookies in production)
- **HTTPS Only** - All API calls over HTTPS in production
- **Input Validation** - Form validation before submission
- **Output Encoding** - Angular auto-escapes content (XSS protection)
- **CSRF Protection** - Token-based protection (implicit in Angular)
- **Content Security Policy** - Server-side CSP headers
- **Role-Based Access** - Route guards enforce authorization
- **Ownership Checks** - Verify user owns orders/data

### Recommended Improvements
- Use httpOnly cookies for JWT storage (not localStorage)
- Implement token refresh with short expiration
- Add request signing for sensitive operations
- Rate limiting on login endpoints

---

## 📈 Performance Optimizations

### Code Optimization
- **Lazy Loading** - Feature modules loaded on-demand
- **Tree-Shaking** - Unused code eliminated in build
- **Minification** - Reduced bundle size
- **Preloading** - Prefetch likely-to-use modules
- **OnPush Detection** - Reduce change detection cycles

### Network Optimization
- **Gzip Compression** - Compress HTTP responses
- **Caching Strategies** - Browser caching for assets
- **HTTP/2 Server Push** - Push critical resources
- **Lazy Image Loading** - Load images on-demand
- **API Polling Optimization** - Efficient queue polling

### Bundle Analysis
```bash
ng build --stats-json
# Then analyze with: webpack-bundle-analyzer
```

---

## 🚨 Error Handling & Validation

### Form Validation
- **Template Validation** - HTML5 validators
- **Reactive Validation** - FormGroup validators
- **Custom Validators** - Business logic validation
- **Error Messages** - Clear, actionable user feedback
- **Real-Time Feedback** - Instant validation errors

### API Error Handling
- **Status Code Handling** - 400, 401, 403, 500, etc.
- **Error Messages** - Display user-friendly messages
- **Retry Logic** - Auto-retry transient failures
- **Fallback UI** - Show cached data if available
- **Logging** - Log errors for debugging

### User Feedback
- **Toast Notifications** - Temporary success/error messages
- **Modal Dialogs** - Critical confirmations
- **Error Pages** - 404, unauthorized, server error
- **Loading States** - Show progress during operations
- **Inline Errors** - Field-level error messages

---

## 📚 Component Summary

| Module | Components | Purpose |
|--------|-----------|---------|
| **Auth** | Login, Register | User authentication |
| **Menu** | Browse, Manage | Menu item discovery & management |
| **Cart-Order** | Cart, Checkout, History, Detail | Order placement & tracking |
| **Wallet** | Wallet | Balance & transaction management |
| **QR** | Display, Scanner, Upload | QR code operations |
| **Pickup** | Scanner, Queue | Counter pickup interface |
| **Vendor** | Orders, Manage | Vendor dashboard |
| **Admin** | Dashboard, Operations | Admin console |
| **Profile** | Profile | User settings |
| **Shared** | Header, Footer | Layout components |

---

## 🎯 Summary: What Cafetron Frontend Provides

| Category | Features |
|----------|----------|
| **Authentication** | Login, register, JWT tokens, role-based access |
| **Menu** | Browse, search, filter, manage items & stock |
| **Shopping** | Cart, checkout, order history, order details |
| **Payment** | Wallet balance, top-up, transaction history |
| **QR Codes** | Display, scan, upload, verification |
| **Order Pickup** | Counter queue, order verification, status updates |
| **Vendor Portal** | Order dashboard, accept/decline, response tracking |
| **Admin Dashboard** | Analytics, reports, configuration, metrics |
| **User Profile** | Profile management, password change |
| **Security** | JWT auth, role guards, ownership checks |
| **Performance** | Lazy loading, tree-shaking, optimized bundles |
| **UX** | Error handling, validation, notifications |

---

This frontend provides a **complete, modern Angular application** with comprehensive features for employees, vendors, and admins to manage food ordering, payment, and fulfillment workflows.


