import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
    PagedTransactionDto,
    TopUpRequestDto,
    WalletResponseDto
} from "./models/wallet.models";

@Injectable({providedIn:"root"})
export class WalletService{
    private readonly api = `${environment.apiUrl}/wallet`;

    constructor(private http: HttpClient) {}

    getWallet(): Observable<WalletResponseDto> {
        return this.http.get<WalletResponseDto>(this.api);
    }

    topUp(request: TopUpRequestDto): Observable<string> {
        return this.http.post(this.api + '/topup', request, { responseType: 'text' });
    }

    getTransactions(page = 0, size = 10): Observable<PagedTransactionDto> {
        return this.http.get<PagedTransactionDto>(`${this.api}/transactions`, {
            params: { page, size }
        });
    }
}
