import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Sparkles, RotateCcw } from "lucide-react";

const AGENT_NAME = "support_status";
const SUGGESTIONS = [
  "What's the status of my tickets?",
  "Check my 'Account Deletion Request' ticket",
  "Do I have any resolved tickets?",
];

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-brand text-white rounded-br-md"
            : "bg-card border border-border text-foreground rounded-bl-md"
        }`}
      >
        {message.content ? (
          isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
              {message.content}
            </ReactMarkdown>
          )
        ) : (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
          </span>
        )}
        {message.tool_calls?.map((tc, idx) => {
          const failed = ["failed", "error"].includes(tc.status) || (tc.results && /error|failed/i.test(String(tc.results)));
          return (
            <div key={idx} className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`w-1.5 h-1.5 rounded-full ${failed ? "bg-destructive" : "bg-brand"}`} />
              {failed ? "Lookup failed" : "Checking tickets..."}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SupportAssistantChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [starting, setStarting] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: "Support Status Assistant" },
        });
        setConversation(conv);
        setMessages(conv.messages || []);
      } catch {
      } finally {
        setStarting(false);
      }
    })();
  }, []);

  const subscribe = useCallback((convId) => {
    return base44.agents.subscribeToConversation(convId, (data) => {
      setMessages(data.messages || []);
    });
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = subscribe(conversation.id);
    return unsub;
  }, [conversation?.id, subscribe]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending || !conversation) return;
    setInput("");
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content });
    } catch {
    } finally {
      setSending(false);
    }
  };

  const reset = async () => {
    setStarting(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: "Support Status Assistant" },
      });
      setConversation(conv);
      setMessages(conv.messages || []);
    } catch {
    } finally {
      setStarting(false);
    }
  };

  return (
    <Card className="flex flex-col h-[60vh] min-h-[420px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {starting ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-brand" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">How can I help with your tickets?</p>
            <p className="text-xs text-muted-foreground mb-4">Try one of these to get started:</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition-colors text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, idx) => (
              <MessageBubble key={idx} message={m} />
            ))}
            <div ref={scrollRef} />
          </>
        )}
      </div>

      <div className="border-t border-border p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about your ticket status..."
          disabled={starting || sending}
          className="flex-1 h-11"
        />
        <Button onClick={() => send()} disabled={starting || sending || !input.trim()} className="bg-brand hover:bg-brand-dark h-11 px-4">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={reset} disabled={starting || sending} className="h-11 w-11">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}