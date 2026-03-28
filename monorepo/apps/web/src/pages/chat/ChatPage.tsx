import { useState } from "react";
import { Send, User, MoreVertical, Search, Phone, Video } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Jane Smith",
      message:
        "Hi! I found a wallet that matches your description. Could you confirm the details?",
      timestamp: "2:30 PM",
      isUser: false,
    },
    {
      id: 2,
      sender: "You",
      message:
        "Yes! It's a brown leather wallet. Does it have a driver's license for John Doe?",
      timestamp: "2:32 PM",
      isUser: true,
    },
    {
      id: 3,
      sender: "Jane Smith",
      message: "Yes, it does! Where would you like to meet to get it back?",
      timestamp: "2:35 PM",
      isUser: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "You",
          message: newMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isUser: true,
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] gap-3 sm:gap-6">
        {/* Sidebar List (Conversations) */}
        <Card className="w-80 hidden md:flex flex-col border-none shadow-sm h-full bg-white border-r">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DD6B20]/20 text-slate-900 placeholder-slate-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg cursor-pointer">
                <div className="relative">
                  <div className="h-10 w-10 bg-slate-200 rounded-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop"
                      alt="Jane"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      Jane Smith
                    </h4>
                    <span className="text-xs text-orange-500 font-medium">
                      2:35 PM
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">
                    Yes, it does! Where would...
                  </p>
                </div>
              </div>
              {/* Placeholder Chats */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-sm font-semibold text-slate-700 truncate">
                        User {i}
                      </h4>
                      <span className="text-xs text-slate-500">Yesterday</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      Is this still available?
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col border-none shadow-sm h-full bg-slate-50">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop"
                  alt="Jane"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Jane Smith</h3>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-500">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-500">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-500">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                {!msg.isUser && (
                  <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden mr-2 mt-auto">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop"
                      alt="Jane"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    msg.isUser
                      ? "bg-[#DD6B20] text-white rounded-br-none"
                      : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <span
                    className={`text-[10px] mt-1 block text-right ${msg.isUser ? "text-orange-100" : "text-slate-400"}`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                className="shadow-orange-100 px-3 sm:px-4"
              >
                <Send className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
