import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuService } from '../menu.service';
import { MenuItem } from '../menu.models';
import { Subject } from 'rxjs';
import { takeUntil, timeout, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-menu-browse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-browse.component.html',
  styleUrl: './menu-browse.component.css',
})
export class MenuBrowseComponent implements OnInit, OnDestroy {

  items: MenuItem[] = [];
  activeFilter = 'ALL';
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.loadToday();
  }

  loadToday(): void {
    this.activeFilter = 'ALL';
    this.isLoading = true;
    this.errorMessage = '';

    this.menuService
      .getTodaysMenu()
      .pipe(
        timeout(10000),
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.items = data || [];
        },
        error: (error) => {
          console.error('Error loading menu:', error);
          this.items = [];
          this.errorMessage =
            error.name === 'TimeoutError'
              ? 'Menu took too long to load. Please check that the backend is running.'
              : error.error?.message || 'Failed to load menu. Please try again.';
        },
      });
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.isLoading = true;
    this.errorMessage = '';

    if (term.trim()) {
      this.menuService
        .search(term)
        .pipe(
          timeout(10000),
          takeUntil(this.destroy$),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (data) => {
            this.items = data || [];
          },
          error: (error) => {
            console.error('Search error:', error);
            this.items = [];
            this.errorMessage = 'Failed to search menu items.';
          },
        });
    } else {
      this.loadToday();
    }
  }

  applyFilter(type: string): void {
    this.activeFilter = type;
    this.isLoading = true;
    this.errorMessage = '';

    if (type === 'ALL') {
      this.loadToday();
    } else {
      this.menuService
        .filterByFoodType(type)
        .pipe(
          timeout(10000),
          takeUntil(this.destroy$),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (data) => {
            this.items = data || [];
          },
          error: (error) => {
            console.error('Filter error:', error);
            this.items = [];
            this.errorMessage = `Failed to filter by ${type}.`;
          },
        });
    }
  }

  trackByItemId(index: number, item: MenuItem): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

