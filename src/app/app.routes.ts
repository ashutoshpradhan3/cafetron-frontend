import { Component } from '@angular/core';
import { Route, Routes } from '@angular/router';

// Cart-Order Components
import { CheckoutComponent } from './features/cart-order/checkout/checkout.component';
import { OrderHistoryComponent } from './features/cart-order/order-history/order-history.component';
import { OrderDetailComponent } from './features/cart-order/order-history/order-detail/order-detail.component';
import { MenuBrowseComponent } from './features/menu/menu-browse/menu-browse.component';

// Menu Management Components
import { MenuManageComponent } from './features/menu/menu-manage/menu-manage.component';
import { OrderQRDisplayComponent } from './features/order-qr/order-qr-display/order-qr-display.component';
import { OrderQrScannerComponent } from './features/order-qr/order-qr-scanner/order-qr-scanner.component';
import { OrderQRUploadComponent } from './features/order-qr/order-qr-upload/order-qr-upload.component';

// Vendor Management Components
import { VendorManageComponent } from './features/vendor/vendor-manage/vendor-manage.component';
import { authGuard } from './core/guards/auth.guard';

// import { APP_ROLES, AppRole, roleGuard } from './core/guards/role.guard';
// import { authGuard } from './core/guards/auth.guard';

@Component({
  standalone: true,
  template: `
    <main class="pending-page">
      <section class="pending-card">
        <p class="eyebrow">Cafetron Module</p>
        <h1>Experience in progress</h1>
        <p>
          This route is wired into the app shell and is ready for the feature component.
          The full screen will appear here once the module implementation lands.
        </p>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .pending-page {
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 24px;
    }

    .pending-card {
      width: min(560px, 100%);
      padding: 34px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: var(--shadow-md);
      animation: fadeUp 360ms ease both;
    }

    .eyebrow {
      margin: 0 0 10px;
      color: var(--primary);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: var(--text);
      font-size: clamp(32px, 6vw, 54px);
      line-height: 1;
    }

    p:last-child {
      margin: 14px 0 0;
      color: var(--muted);
      line-height: 1.65;
    }
  `],
})
class PendingFeatureRouteComponent {}

type FeatureRouteOptions = {
  path: string;
  title: string;
  componentPath: string;
};

const featureRoute = ({
  path,
  title,
  componentPath,
}: FeatureRouteOptions): Route => ({
  path,
  title,
  canActivate: [authGuard],
  component: PendingFeatureRouteComponent,
  data: {
    componentPath,
  },
});

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',        // ← changed from 'menu' to 'login'
  },

  // ── YOUR ROUTES (auth) ──────────────────────────────────────────
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.LoginComponent),
  },
  {
    path: 'register',
    title: 'Register',
    loadComponent: () =>
      import('./features/auth/register/register')
        .then(m => m.RegisterComponent),
  },

  // ── TEAMMATES' ROUTES (unchanged, just added authGuard) ─────────
  featureRoute({
    path: 'menu',
    title: 'Menu',
    componentPath: 'features/menu/menu-browse/menu-browse.component',
  }),
  featureRoute({
    path: 'menu/manage',
    title: 'Manage Menu',
    componentPath: 'features/menu/menu-manage/menu-manage.component',
  }),
  featureRoute({
    path: 'cart',
    title: 'Cart',
    componentPath: 'features/cart-order/cart/cart.component',
  }),
  {
    path: 'checkout',
    title: 'Checkout',
    component: CheckoutComponent,
  },
  {
    path: 'orders',
    title: 'Order History',
    component: OrderHistoryComponent,
  },
  {
    path: 'orders/:orderId',
    title: 'Order Detail',
    component: OrderDetailComponent,
  },
  featureRoute({
    path: 'wallet',
    title: 'Wallet',
    componentPath: 'features/wallet/wallet/wallet.component',
  }),
  {
    path: 'pickup',
    pathMatch: 'full',
    redirectTo: 'pickup/scan',
  },
  {
    path: 'pickup/scan',
    title: 'Scan Pickup QR',
    component: OrderQrScannerComponent,
  },
  {
    path: 'pickup/upload',
    title: 'Upload Pickup QR',
    component: OrderQRUploadComponent,
  },
  {
    path: 'pickup/qr/:orderId',
    title: 'Pickup QR',
    component: OrderQRDisplayComponent,
  },
  {
    path: 'pickup/qr',
    pathMatch: 'full',
    redirectTo: 'orders',
  },
  {
    path: 'counter',
    pathMatch: 'full',
    redirectTo: 'counter/scanner',
  },
  featureRoute({
    path: 'counter/scanner',
    title: 'Counter Scanner',
    componentPath: 'features/pickup-scanner/scanner/scanner.component',
  }),
  featureRoute({
    path: 'counter/queue',
    title: 'Pickup Queue',
    componentPath: 'features/pickup-scanner/queue/queue.component',
  }),
  {
    path: 'admin',
    pathMatch: 'full',
    redirectTo: 'admin/dashboard',
  },
  {
    path: 'admin/dashboard',
    title: 'Admin Dashboard',
    loadComponent: () =>
    import('./features/admin/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
    // roles: [APP_ROLES.admin],
    // componentPath: 'features/admin/dashboard/dashboard.component',
  },
  {
    path: 'admin/operations',
    title: 'Operations',
    loadComponent: () =>
    import('./features/admin/operations/operations.component')
      .then(m => m.OperationsComponent)
    // roles: [APP_ROLES.admin],
    // componentPath: 'features/admin/operations/operations.component',
  },
  {
    path: 'admin/vendors',
    title: 'Manage Vendors',
    component: VendorManageComponent,
  },
  {
    path: 'test/menu',
    component: MenuBrowseComponent,
  },
  {
    path: '**',
    redirectTo: 'login',        // ← changed from 'menu' to 'login'
  },
];