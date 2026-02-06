
import { Component, signal, inject, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.3s ease-out forwards;
    }
    .font-michroma { font-family: 'Michroma', sans-serif; }
    .font-montserrat { font-family: 'Montserrat', sans-serif; }
  `]
})
export class ChatbotComponent {
  private geminiService = inject(GeminiService);
  
  isOpen = signal(false);
  messages = signal<Message[]>([
    { text: "Welcome to Alexis Autos. I'm your virtual assistant. Ask me about our premium services, booking availability, or maintenance advice.", sender: 'bot' }
  ]);
  userInput = signal('');
  isLoading = signal(false);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    effect(() => {
      // Auto-scroll when messages change
      const msgs = this.messages(); 
      if (this.scrollContainer?.nativeElement) {
        setTimeout(() => {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }, 50);
      }
    });
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  async sendMessage() {
    const text = this.userInput().trim();
    if (!text || this.isLoading()) return;

    this.messages.update(msgs => [...msgs, { text, sender: 'user' }]);
    this.userInput.set('');
    this.isLoading.set(true);

    const response = await this.geminiService.generateResponse(text);
    this.messages.update(msgs => [...msgs, { text: response, sender: 'bot' }]);
    
    this.isLoading.set(false);
  }
}
