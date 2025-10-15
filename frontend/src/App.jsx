import { useEffect, useRef, useState } from 'react';
import { connectWS } from './ws';
import { Send, MessageCircle } from 'lucide-react';

export default function Index() {
  const timer = useRef(null);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [inputName, setInputName] = useState('');
  const [typers, setTypers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    socket.current = connectWS();

    socket.current.on('connect', () => {
      socket.current.on('roomNotice', (userName) => {
        console.log(`${userName} joined to group!`);
      });

      socket.current.on('chatMessage', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.current.on('typing', (userName) => {
        setTypers((prev) => {
          const isExist = prev.find((typer) => typer === userName);
          if (!isExist) {
            return [...prev, userName];
          }
          return prev;
        });
      });

      socket.current.on('stopTyping', (userName) => {
        setTypers((prev) => prev.filter((typer) => typer !== userName));
      });
    });

    return () => {
      socket.current.off('roomNotice');
      socket.current.off('chatMessage');
      socket.current.off('typing');
      socket.current.off('stopTyping');
    };
  }, []);

  useEffect(() => {
    if (text) {
      socket.current.emit('typing', userName);
      if (timer.current) clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      socket.current.emit('stopTyping', userName);
    }, 1000);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function formatTime(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function handleNameSubmit(e) {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) return;

    socket.current.emit('joinRoom', trimmed);
    setUserName(trimmed);
    setShowNamePopup(false);
  }

  function sendMessage() {
    const t = text.trim();
    if (!t) return;

    const msg = {
      id: Date.now(),
      sender: userName,
      text: t,
      ts: Date.now(),
    };
    setMessages((m) => [...m, msg]);
    socket.current.emit('chatMessage', msg);
    setText('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-bg p-4 font-sans overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Name popup */}
      {showNamePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50 p-4">
          <div className="bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-glow max-w-md w-full p-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-gradient-primary">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Join Chat</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your name to start chatting with others in real-time
            </p>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <input
                autoFocus
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-chat-input border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground transition-all"
                placeholder="Your name (e.g. John Doe)"
              />
              <button
                type="submit"
                className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chat window */}
      {!showNamePopup && (
        <div className="w-full max-w-4xl h-[90vh] bg-card/50 backdrop-blur-2xl border border-border rounded-3xl shadow-soft flex flex-col overflow-hidden relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-chat-surface/50 backdrop-blur-xl">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-glow">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-foreground">
                Realtime Group Chat
              </div>
              {typers.length > 0 ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{typers.join(', ')} {typers.length === 1 ? 'is' : 'are'} typing</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse-dot"></div>
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Click to send messages</div>
              )}
            </div>
            <div className="text-sm text-muted-foreground hidden sm:block">
              Signed in as <span className="font-semibold text-foreground">{userName}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-chat-bg/30">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center space-y-2">
                  <MessageCircle className="w-12 h-12 mx-auto opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            )}
            {messages.map((m, idx) => {
              const mine = m.sender === userName;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-slide-up`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div
                    className={`max-w-[75%] sm:max-w-[60%] p-4 rounded-2xl shadow-soft backdrop-blur-sm ${
                      mine
                        ? 'bg-chat-sent text-white rounded-br-md'
                        : 'bg-chat-received text-foreground rounded-bl-md'
                    }`}>
                    <div className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                      {m.text}
                    </div>
                    <div className="flex justify-between items-center mt-2 gap-4">
                      <div className={`text-xs font-semibold ${mine ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {m.sender}
                      </div>
                      <div className={`text-xs ${mine ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {formatTime(m.ts)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-border bg-chat-surface/50 backdrop-blur-xl">
            <div className="flex items-end gap-3">
              <textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 resize-none bg-chat-input border border-border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground transition-all max-h-32"
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="bg-gradient-primary text-white p-3 rounded-xl hover:shadow-glow transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
