import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { PagedTransactionDto, TopUpRequestDto, WalletResponseDto } from './models/wallet.models';
import { WalletService } from './wallet.service';

@Component({
  selector: 'wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
})
export class WalletComponent implements OnInit, OnDestroy {
  wallet: WalletResponseDto | null = null;
  transactions: PagedTransactionDto | null = null;

  isLoadingWallet = true;
  isLoadingTransactions = true;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  topUpAmount: number | null = null;
  userId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfileAndData();
  }

  loadProfileAndData(): void {
    this.authService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.userId = profile.id;
          forkJoin({
            wallet: this.walletService.getWallet(),
            transactions: this.walletService.getTransactions(0, 10),
          })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: ({ wallet, transactions }) => {
                this.wallet = wallet;
                this.transactions = transactions;
                this.isLoadingWallet = false;
                this.isLoadingTransactions = false;
                this.cdr.detectChanges();
              },
              error: (error) => {
                this.errorMessage = error?.error?.message || 'Failed to load wallet data.';
                this.isLoadingWallet = false;
                this.isLoadingTransactions = false;
                this.cdr.detectChanges();
              },
            });
        },
        error: () => {
          this.errorMessage = 'Failed to load profile data.';
          this.isLoadingWallet = false;
          this.isLoadingTransactions = false;
          this.cdr.detectChanges();
        },
      });
  }

  loadWallet(): void {
    this.isLoadingWallet = true;
    this.walletService.getWallet()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.wallet = response;
          this.isLoadingWallet = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.wallet = null;
          this.isLoadingWallet = false;
          this.errorMessage = error?.error?.message || 'Failed to load wallet.';
          this.cdr.detectChanges();
        },
      });
  }

  loadTransactions(page = 0): void {
    this.isLoadingTransactions = true;
    this.walletService.getTransactions(page, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.transactions = response;
          this.isLoadingTransactions = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.transactions = null;
          this.isLoadingTransactions = false;
          this.errorMessage = error?.error?.message || 'Failed to load transactions.';
          this.cdr.detectChanges();
        },
      });
  }

  submitTopUp(): void {
    if (!this.userId || !this.topUpAmount || this.topUpAmount <= 0) {
      this.errorMessage = 'Enter a valid top-up amount.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: TopUpRequestDto = {
      userId: this.userId,
      amount: this.topUpAmount,
    };

    this.walletService.topUp(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message) => {
          this.successMessage = message;
          this.isSaving = false;
          this.topUpAmount = null;
          this.loadWallet();
          this.loadTransactions();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Top-up failed.';
          this.isSaving = false;
          this.cdr.detectChanges();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
