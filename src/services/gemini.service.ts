
import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

declare var process: any;

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env['API_KEY'] : '';
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey: apiKey });
    } else {
      console.warn('Gemini API Key is missing. Chatbot will not function.');
    }
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      if (!this.ai) {
         // Attempt re-init if somehow key appeared, or just fail gracefully
         const apiKey = (typeof process !== 'undefined' && process.env) ? process.env['API_KEY'] : '';
         if (apiKey) {
           this.ai = new GoogleGenAI({ apiKey: apiKey });
         } else {
           return "System Error: API Key is missing. Please contact administration.";
         }
      }

      const model = 'gemini-2.5-flash';
      const prompt = `You are "Alexis", the advanced AI virtual assistant for Alexis Autos Limited, a premium high-performance automotive center in Loughborough. 
      
      Brand Voice: Professional, efficient, knowledgeable about luxury and sports cars.
      Services We Offer:
      - Car Tyres (Performance & Standard)
      - Servicing (Full & Interim)
      - Batteries
      - Suspension & Shock Absorbers
      - Engine Work (Diagnostics & Repair)
      - Brakes (Discs & Pads)
      - Clutch Replacement
      
      Location: Unit C5, Cumberland Trading Estate, Loughborough, LE11 5DF.
      
      Your goal is to assist customers with booking inquiries, diagnosing basic car issues based on their descriptions, and guiding them to the right service. Keep responses concise (under 100 words) unless detailed technical advice is needed. 
      
      Note: You cannot generate images. If asked, politely decline and offer to describe the vehicle or part instead.

      User Query: ${userMessage}`;

      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      return response.text || "I apologize, I'm having trouble connecting to the diagnostic server. Please try again.";
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "I encountered a technical error. Please call our center directly.";
    }
  }
}
