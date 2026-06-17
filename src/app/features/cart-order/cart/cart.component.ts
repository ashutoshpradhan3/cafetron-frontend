import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartItem, CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartItemCount = 0;
  cartTotal = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        this.cartItems = items;
        this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartTotal = this.cartService.getTotalForItems(items);
        this.cdr.detectChanges();
      });
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.menuItemId, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      this.cartService.removeItem(item.menuItemId);
      return;
    }

    this.cartService.updateQuantity(item.menuItemId, item.quantity - 1);
  }

  removeFromCart(item: CartItem): void {
    this.cartService.removeItem(item.menuItemId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  goToCheckout(): void {
    if (this.cartItemCount > 0) {
      this.router.navigate(['/checkout']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
