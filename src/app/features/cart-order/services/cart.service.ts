import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '../../menu/menu.models';
import { PlaceOrderItemRequest } from '../models/order.models';

export interface CartItem {
  menuItemId: number;
  itemName: string;
  price: number;
  quantity: number;
  foodType?: string;
  vendorName?: string;
}

const CART_STORAGE_KEY = 'cafetron_cart_items';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>(this.readFromStorage());
  readonly cartItems$ = this.cartItemsSubject.asObservable();

  getSnapshot(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  addItem(menuItem: MenuItem, quantity = 1): void {
    const currentItems = this.getSnapshot();
    const existingItem = currentItems.find((item) => item.menuItemId === menuItem.id);

    const nextItems = existingItem
      ? currentItems.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [
          ...currentItems,
          {
            menuItemId: menuItem.id,
            itemName: menuItem.itemName,
            price: Number(menuItem.price) || 0,
            quantity,
            foodType: menuItem.foodType,
            vendorName: menuItem.vendorName,
          },
        ];

    this.setItems(nextItems);
  }

  updateQuantity(menuItemId: number, quantity: number): void {
    const normalizedQuantity = Math.max(1, Math.floor(quantity));
    this.setItems(
      this.getSnapshot().map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity: normalizedQuantity } : item
      )
    );
  }

  removeItem(menuItemId: number): void {
    this.setItems(this.getSnapshot().filter((item) => item.menuItemId !== menuItemId));
  }

  clearCart(): void {
    this.setItems([]);
  }

  toPlaceOrderItems(): PlaceOrderItemRequest[] {
    return this.getSnapshot().map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    }));
  }

  getTotal(): number {
    return this.getTotalForItems(this.getSnapshot());
  }

  getItemCount(): number {
    return this.getSnapshot().reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalForItems(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private setItems(items: CartItem[]): void {
    const normalizedItems = items
      .filter((item) => item.menuItemId && item.quantity > 0)
      .map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        quantity: Math.max(1, Math.floor(item.quantity)),
      }));

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedItems));
    this.cartItemsSubject.next(normalizedItems);
  }

  private readFromStorage(): CartItem[] {
    const rawItems = localStorage.getItem(CART_STORAGE_KEY);
    if (!rawItems) {
      return [];
    }

    try {
      const parsedItems = JSON.parse(rawItems) as CartItem[];
      return Array.isArray(parsedItems)
        ? parsedItems.filter((item) => item.menuItemId && item.quantity > 0)
        : [];
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
  }
}
