import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/talk")({
  component: TalkPage,
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function TalkPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "I am here, Arjuna. What weighs upon your heart today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env["VITE_SUPABASE_ANON_KEY"]}`,
        },
        body: JSON.stringify({
          message: input,
          conversation_id: "default",
          language: "en"
        }),
      });

      if (!response.ok) throw new Error("Connection lost");

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const content = line.replace("data: ", "").trim();
            if (content === "[DONE]") continue;
            
            fullContent += content;
            setMessages(prev => prev.map(msg => 
              msg.id === assistantId ? { ...msg, content: fullContent } : msg
            ));
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("I could not reach the divine silence. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      <header className="h-16 border-b border-slate-800/50 flex items-center px-8 bg-slate-900/30 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-blue-900/20">K</div>
          <span className="font-bold text-lg tracking-tight text-white italic">KrishnaGPT</span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full px-4 py-8" ref={scrollRef}>
          <div className="max-w-2xl mx-auto space-y-8">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-slate-800" : "bg-blue-600/20 text-blue-400"
                }`}>
                  {msg.role === "user" ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-slate-900 border border-slate-800/50 text-slate-300"
                }`}>
                  {msg.content || (isLoading && "...") }
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 shrink-0">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
          <Input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your question, Arjuna..."
            className="bg-slate-950 border-slate-800 focus-visible:ring-blue-600"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
