import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import {
  AdminReportService,
  DailySummaryDTO,
  TopItemDTO,
  RevenuePointDTO,
  StatusCountDTO,
  VendorDeclineSummaryDTO
} from '../admin-report.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class DashboardComponent implements OnInit {

  today = new Date().toISOString().split('T')[0];
  selectedDate = this.today;

  rangeFrom = new Date(Date.now() - 6 * 864e5).toISOString().split('T')[0];
  rangeTo = this.today;

  loading = false;

  summary: DailySummaryDTO | null = null;
  topItems: TopItemDTO[] = [];
  statusBreakdown: StatusCountDTO[] = [];
  vendorDeclines: VendorDeclineSummaryDTO[] = [];

  topItemsChart: ChartData<'bar'> = { labels: [], datasets: [] };
  statusChart: ChartData<'doughnut'> = { labels: [], datasets: [] };
  revenueChart: ChartData<'line'> = { labels: [], datasets: [] };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true }
    }
  };

  private colors = [
    '#f97316', '#9d4300', '#006398', '#565e74',
    '#ffb690', '#00a2f4', '#783200', '#8c7164'
  ];

  private statusColors: Record<string, string> = {
    COLLECTED:        '#10b981',
    READY_FOR_PICKUP: '#006398',
    VENDOR_ACCEPTED:  '#9d4300',
    PENDING_VENDOR:   '#f97316',
    VENDOR_DECLINED:  '#ef4444',
    CANCELLED:        '#94a3b8'
  };

  constructor(
    private reportService: AdminReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  // ── Called when date input changes ───────────────────────────────
  onDateChange(): void {
    this.load();
  }

  onRangeChange(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cdr.detectChanges(); // ← show loading state immediately

    forkJoin({
      summary:         this.reportService.getDailySummary(this.selectedDate),
      topItems:        this.reportService.getTopItems(8),
      statusBreakdown: this.reportService.getStatusBreakdown(this.selectedDate),
      vendorDeclines:  this.reportService.getVendorDeclines(this.selectedDate),
      revenueRange:    this.reportService.getRevenueRange(this.rangeFrom, this.rangeTo)
    }).subscribe({
      next: ({ summary, topItems, statusBreakdown, vendorDeclines, revenueRange }) => {
        this.summary         = summary;
        this.topItems        = topItems;
        this.statusBreakdown = statusBreakdown;
        this.vendorDeclines  = vendorDeclines;
        this.buildCharts(topItems, statusBreakdown, revenueRange);
        this.loading = false;
        this.cdr.detectChanges(); // ← update view after data arrives
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildCharts(
    topItems: TopItemDTO[],
    statuses: StatusCountDTO[],
    revenue: RevenuePointDTO[]
  ): void {
    // Assign new object references so Angular detects the change
    this.topItemsChart = {
      labels: [...topItems.map(i => i.name)],
      datasets: [{
        data: [...topItems.map(i => i.qtySold)],
        backgroundColor: this.colors.slice(0, topItems.length),
        borderRadius: 6,
        borderSkipped: false
      }]
    };

    this.statusChart = {
      labels: [...statuses.map(s => s.status.replace(/_/g, ' '))],
      datasets: [{
        data: [...statuses.map(s => s.count)],
        backgroundColor: statuses.map(s =>
          this.statusColors[s.status] ?? '#94a3b8'),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    this.revenueChart = {
      labels: [...revenue.map(p => p.date)],
      datasets: [{
        data: [...revenue.map(p => p.revenue)],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,0.12)',
        borderWidth: 2,
        pointBackgroundColor: '#f97316',
        pointRadius: 4,
        fill: true,
        tension: 0.4
      }]
    };
  }

  downloadDaily(): void {
    this.reportService.downloadDailyCsv(this.selectedDate);
  }
  downloadTopItems(): void {
    this.reportService.downloadTopItemsCsv(8);
  }
  downloadRange(): void {
    this.reportService.downloadRangeCsv(this.rangeFrom, this.rangeTo);
  }
  downloadDeclines(): void {
    this.reportService.downloadVendorDeclinesCsv(this.selectedDate);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      COLLECTED:        'status-collected',
      READY_FOR_PICKUP: 'status-ready',
      VENDOR_ACCEPTED:  'status-accepted',
      PENDING_VENDOR:   'status-pending',
      VENDOR_DECLINED:  'status-declined',
      CANCELLED:        'status-cancelled'
    };
    return map[status] ?? '';
  }
}
