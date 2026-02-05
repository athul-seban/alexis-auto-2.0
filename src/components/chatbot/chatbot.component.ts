
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
  template: `
    <!-- Floating Action Button -->
    <button 
      (click)="toggleChat()"
      class="fixed bottom-6 right-6 z-50 bg-[#E30613] hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border-2 border-white/10"
      [class.rotate-90]="isOpen()"
    >
      @if (!isOpen()) {
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      } @else {
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      }
    </button>

    <!-- Chat Window -->
    @if (isOpen()) {
      <div class="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-black border border-[#333] rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[600px] animate-fade-in-up">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-gray-900 to-black p-4 border-b border-[#E30613] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-[#E30613] flex items-center justify-center text-xs font-bold font-michroma">A</div>
            <div>
              <h3 class="font-michroma text-sm text-white">ALEXIS AI</h3>
              <p class="text-[10px] text-gray-400 font-montserrat uppercase tracking-wider">Virtual Mechanic</p>
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-black/95 min-h-[300px]" #scrollContainer>
          @for (msg of messages(); track $index) {
            <div [class.justify-end]="msg.sender === 'user'" [class.justify-start]="msg.sender === 'bot'" class="flex">
              <div 
                [class.bg-[#E30613]]="msg.sender === 'user'" 
                [class.text-white]="msg.sender === 'user'"
                [class.bg-[#1a1a1a]]="msg.sender === 'bot'"
                [class.text-gray-200]="msg.sender === 'bot'"
                [class.border-l-2]="msg.sender === 'bot'"
                [class.border-[#E30613]]="msg.sender === 'bot'"
                class="max-w-[85%] p-3 rounded-lg text-sm leading-relaxed"
              >
                {{ msg.text }}
              </div>
            </div>
          }
          @if (isLoading()) {
            <div class="flex justify-start">
              <div class="bg-[#1a1a1a] border-l-2 border-[#E30613] p-3 rounded-lg">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                  <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Input Area -->
        <div class="p-3 bg-black border-t border-[#333] flex gap-2">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keyup.enter)="sendMessage()"
            placeholder="Ask about services or car issues..." 
            class="flex-1 bg-[#111] border border-[#333] text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-[#E30613] placeholder-gray-600"
          >
          <button 
            (click)="sendMessage()"
            [disabled]="!userInput() || isLoading()"
            class="bg-[#E30613] hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    }
  `,
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
