import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceDto, InvoiceListViewDto, ApiResponse, PaginatedList } from '../models/invoice.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}api/invoices`;

  constructor(private http: HttpClient) {}

  getInvoicesPaginated(pageIndex: number = 0, pageSize: number = 10): Observable<ApiResponse<PaginatedList<InvoiceListViewDto>>> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<ApiResponse<PaginatedList<InvoiceListViewDto>>>(`${this.apiUrl}/paginated`, { params });
  }

  getInvoiceById(id: number): Observable<ApiResponse<InvoiceDto>> {
    return this.http.get<ApiResponse<InvoiceDto>>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: InvoiceDto): Observable<ApiResponse<InvoiceDto>> {
    return this.http.post<ApiResponse<InvoiceDto>>(this.apiUrl, invoice);
  }

  updateInvoice(id: number, invoice: InvoiceDto): Observable<ApiResponse<InvoiceDto>> {
    return this.http.put<ApiResponse<InvoiceDto>>(`${this.apiUrl}/${id}`, invoice);
  }

  searchInvoices(query: string, pageIndex: number = 0, pageSize: number = 10): Observable<ApiResponse<PaginatedList<InvoiceListViewDto>>> {
    // For now, we'll use the paginated endpoint and filter on frontend
    // You may want to add a search endpoint to your backend
    return this.getInvoicesPaginated(pageIndex, pageSize);
  }
}