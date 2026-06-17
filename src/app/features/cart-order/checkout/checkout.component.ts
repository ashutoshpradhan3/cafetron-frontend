import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrderApiService } from '../services/order-api.service';
import { PlaceOrderRequest } from '../models/order.models';
import { CartItem, CartService } from '../services/cart.service';
import { WalletService } from '../../wallet/wallet.service';

@Component({
  selector: 'checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  selectedPickupSlot: string = '';
  totalAmount: number = 0;
  walletBalance: number | null = null;
  isLoading: boolean = false;
  isWalletLoading: boolean = false;
  errorMessage: string = '';
  checkoutView: 'cards' | 'overview' = 'cards';
  activeStep = 0;
  private destroy$ = new Subject<void>();

  checkoutSteps = [
    { label: 'Time slot', icon: 'schedule' },
    { label: 'Preview food', icon: 'restaurant' },
    { label: 'Payment', icon: 'payments' },
    { label: 'Place order', icon: 'receipt_long' },
  ];

  pickupSlots = [
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '01:30 PM',
    '02:00 PM',
  ];

  constructor(
    private orderApi: OrderApiService,
    private cartService: CartService,
    private walletService: WalletService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.warn('No JWT found — redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.cartItems = items;
        this.calculateTotal();
      });

    this.loadWalletBalance();
  }

  private calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  private loadWalletBalance(): void {
    this.isWalletLoading = true;

    this.walletService
      .getWallet()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wallet) => {
          this.walletBalance = wallet.balance;
          this.isWalletLoading = false;
        },
        error: (error) => {
          console.error('Failed to load wallet:', error);
          this.walletBalance = null;
          this.isWalletLoading = false;
        },
      });
  }

  getWalletLabel(): string {
    if (this.isWalletLoading) {
      return 'Loading...';
    }

    return this.walletBalance === null
      ? 'Unavailable'
      : `$${this.walletBalance.toFixed(2)}`;
  }

  getLineTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  getCartInitial(item: CartItem): string {
    return item.itemName?.trim().charAt(0).toUpperCase() || String(item.menuItemId);
  }

  setCheckoutView(view: 'cards' | 'overview'): void {
    this.checkoutView = view;
  }

  goToStep(index: number): void {
    this.activeStep = Math.max(0, Math.min(index, this.checkoutSteps.length - 1));
  }

  nextStep(): void {
    this.goToStep(this.activeStep + 1);
  }

  previousStep(): void {
    this.goToStep(this.activeStep - 1);
  }

  onPlaceOrder(): void {
    if (!this.selectedPickupSlot) {
      this.errorMessage = 'Please select a pickup time';
      return;
    }

    if (this.cartItems.length === 0) {
      this.errorMessage = 'Your cart is empty';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const request: PlaceOrderRequest = {
      pickupSlot: this.selectedPickupSlot,
      items: this.cartService.toPlaceOrderItems(),
    };

    this.orderApi
      .placeOrder(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Order placed:', response);
          this.cartService.clearCart();
          this.router.navigate(['/orders', response.orderId]);
        },
        error: (error) => {
          console.error('❌ Full Error Response:', error);
          console.error('   Status:', error.status);
          console.error('   Message:', error.error?.message);
          console.error('   Error:', error.error);

          const statusMessage = error.status === 401
            ? 'Unauthorized - Token issue or user not found'
            : error.error?.message || 'Failed to place order. Please try again.';

          this.errorMessage = statusMessage;
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
