import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface VendorOrder {
  vendorOrderStatusId: number;
  orderId: number;
  orderItemId: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  pickupSlot: string;
  orderStatus: string;
  vendorStatus: string;
  declinedReason?: string;
  actionExpiresAt: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class VendorOrdersService {
  private readonly api = `${environment.apiUrl}/vendor/orders`;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<VendorOrder[]> {
    return this.http.get<VendorOrder[]>(this.api);
  }

  accept(statusId: number): Observable<VendorOrder> {
    return this.http.post<VendorOrder>(`${this.api}/${statusId}/accept`, {});
  }

  decline(statusId: number, reason: string): Observable<VendorOrder> {
    return this.http.post<VendorOrder>(`${this.api}/${statusId}/decline`, { reason });
  }
}
