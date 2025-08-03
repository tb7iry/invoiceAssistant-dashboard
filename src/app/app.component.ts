import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InvoiceDashboardComponent } from './components/invoice-dashboard/invoice-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InvoiceDashboardComponent],
  template: `
    <app-invoice-dashboard></app-invoice-dashboard>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'invoice-dashboard';
}