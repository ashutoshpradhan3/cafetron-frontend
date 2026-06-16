import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuItem, MenuItemRequest, Vendor } from './menu.models';

@Injectable({ providedIn: 'root' })
export class MenuService {

  private readonly baseUrl = `${environment.apiUrl}/menu`;
  private readonly vendorUrl = `${environment.apiUrl}/vendors`;

  constructor(private http: HttpClient) {}

  // ---- employee browse ----
  getTodaysMenu(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/today`);
  }
  search(name: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/search`, { params: { name } });
  }
  filterByFoodType(type: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/filter`, { params: { type } });
  }

  // ---- staff management (used by the manage screen next) ----
  getAll(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.baseUrl);
  }
  create(request: MenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.baseUrl, request);
  }
  update(id: number, request: MenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/${id}`, request);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  setStock(id: number, stock: number): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.baseUrl}/${id}/stock`, null, { params: { stock } });
  }
  setAvailability(id: number, available: boolean): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.baseUrl}/${id}/availability`, null, { params: { available } });
  }

  // ---- vendors (for the manage form's dropdown) ----
  getVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.vendorUrl}/active`);
  }
}