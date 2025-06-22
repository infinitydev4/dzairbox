"use client"

import { Bot, User } from "lucide-react"
import { Message } from "./chat-interface"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-emerald-600" : "bg-gray-100"
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-gray-600" />
          )}
        </div>
        
        {/* Message bubble */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className={`rounded-lg px-3 py-2 break-words ${
            isUser 
              ? "bg-emerald-600 text-white rounded-br-none" 
              : "bg-gray-100 text-gray-900 rounded-bl-none"
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          
          {/* Timestamp */}
          <p className={`text-xs mt-1 ${
            isUser ? "text-right text-gray-500" : "text-left text-gray-500"
          }`}>
            {message.timestamp.toLocaleTimeString("fr-FR", { 
              hour: "2-digit", 
              minute: "2-digit" 
            })}
          </p>
        </div>
      </div>
    </div>
  )
} 