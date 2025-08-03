import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { QuestionDto } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}api/chatbot`;

  constructor(private http: HttpClient) {}

  processMessage(message: string): Observable<string> {
    const body: QuestionDto = { question: message };

     return this.http.post<string>(`${this.apiUrl}`, body, {
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'text' as 'json'
    });
  }
}