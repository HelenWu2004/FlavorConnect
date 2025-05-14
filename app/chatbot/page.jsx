"use client";
import ChatBot from "../components/ChatBot";

export default function ChatBotPage() {
  return (
    <main className="bg-gray-100 min-h-screen pb-12">
      <div className="container mx-auto px-4 mt-8">
        <h1 className="text-3xl font-bold text-center mb-8">Personalized Cooking Assistant</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          Tell me about your dietary habits, religious preferences, age, and health conditions, and I'll provide you with personalized recipe recommendations and cooking advice.
        </p>
        <ChatBot />
      </div>
    </main>
  );
} 