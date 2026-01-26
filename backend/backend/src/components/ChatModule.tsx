
import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { Send, Bot, User, Sparkles, Loader2, RefreshCcw, FileText, X } from 'lucide-react';
import { SOP, SOPStatus, User as UserType } from '../types';

interface ChatModuleProps {
  currentUser: UserType;
  sops: SOP[];
  onClose?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export const ChatModule: React.FC<ChatModuleProps> = ({ currentUser, sops, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter only usable knowledge
  const validSOPs = sops.filter(s =>
    s.status === SOPStatus.PUBLISHED || s.status === SOPStatus.APPROVED
  );

  const generateContext = () => {
    return validSOPs.map(sop => `
ID: ${sop.id}
Title: ${sop.title}
Description: ${sop.shortDescription}
Difficulty: ${sop.difficulty}
Steps:
${sop.steps.map((s, i) => `${i + 1}. ${s.title}: ${JSON.stringify(s.description)}`).join('\n')}
    `).join('\n\n----------------\n\n');
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY || '';
      if (!apiKey) {
        console.error("Missing OpenAI API Key");
        throw new Error("Missing OpenAI API Key");
      }

      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const context = generateContext();
      const systemInstruction = `
        You are the SOP Hub Assistant, a helpful AI expert on the company's internal procedures.
        
        Here is the current knowledge base of Standard Operating Procedures (SOPs):
        ${context}

        Rules:
        1. Answer questions strictly based on the provided SOPs.
        2. If the answer isn't in the SOPs, politely say you don't have that information.
        3. Format answers clearly using bullet points or numbered lists if explaining a process.
        4. Be professional, concise, and helpful.
        5. You are speaking to ${currentUser.name}.
      `;

      const apiMessages = [
        { role: "system" as const, content: systemInstruction },
        ...messages.map(m => ({
          role: m.role === 'model' ? 'assistant' as const : 'user' as const,
          content: m.text
        })),
        { role: "user" as const, content: textToSend }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages
      });

      const text = response.choices[0].message.content;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error connecting to the knowledge base. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "List all safety procedures",
    "How do I request time off?",
    "Summarize server maintenance",
    "Hardest SOPs?"
  ];

  return (
    <div className="flex flex-col h-full bg-white relative animate-fadeIn">
      {/* Header */}
      <div className="h-14 border-b border-monday-border flex items-center justify-between px-4 bg-gradient-to-r from-indigo-600 to-purple-600 shrink-0 text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <Sparkles size={16} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-sm font-bold leading-none">AI Assistant</h2>
            <p className="text-[10px] text-white/80 mt-0.5">{validSOPs.length} docs indexed</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMessages([])}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <RefreshCcw size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#F5F7FA]">
        <div className="space-y-4">

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-0 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                <Bot size={24} className="text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Hi, {currentUser.firstName}!</h3>
              <p className="text-xs text-gray-500 mb-6 max-w-xs">Ask me anything about your team's procedures and guidelines.</p>

              <div className="grid grid-cols-1 gap-2 w-full">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="p-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all text-left flex items-center gap-2 group"
                  >
                    <FileText size={14} className="text-gray-400 group-hover:text-indigo-500" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-indigo-600" />
                </div>
              )}

              <div className={`
                max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}
              `}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-indigo-600" />
              </div>
              <div className="bg-white border border-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-indigo-500" />
                <span className="text-xs text-gray-500 font-medium">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-monday-border">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question..."
            className="w-full pl-3 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
            rows={1}
            style={{ minHeight: '46px', maxHeight: '100px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
