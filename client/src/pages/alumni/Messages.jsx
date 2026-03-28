import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import api from '../../api/axios';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import useAuthStore from '../../features/authStore';

export default function AlumniMessages() {
  const { getRoleUser } = useAuthStore();
  const user = getRoleUser('alumni');
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchInbox(); }, []);
  useEffect(() => { if (activeChat) fetchConversation(activeChat); }, [activeChat]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchInbox = async () => {
    try { const { data } = await api.get('/messages/inbox'); setConversations(data.data); } catch {}
    setLoading(false);
  };

  const fetchConversation = async (userId) => {
    try { const { data } = await api.get(`/messages/${userId}`); setMessages(data.data.messages); setPartner(data.data.partner); } catch {}
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !activeChat) return;
    setSending(true);
    try { await api.post('/messages/send', { receiverId: activeChat, content: newMsg.trim() }); setNewMsg(''); await fetchConversation(activeChat); await fetchInbox(); } catch {}
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-[calc(100vh-220px)] overflow-hidden">
        <div className={`w-full sm:w-80 border-r border-gray-100 flex flex-col ${activeChat ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-gray-800 text-sm">Inbox</h3></div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="p-4"><CardSkeleton count={3} /></div> : conversations.length === 0 ? <EmptyState title="No messages" description="Students will message you for guidance." icon={MessageSquare} /> : conversations.map((conv) => (
              <button key={conv.partnerId} onClick={() => setActiveChat(conv.partnerId)}
                className={`w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeChat === conv.partnerId ? 'bg-primary-50' : ''}`}>
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">{conv.partnerName[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 truncate">{conv.partnerName}</p>
                    {conv.unreadCount > 0 && <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">{conv.unreadCount}</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden sm:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="sm:hidden text-gray-500 text-sm">← Back</button>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">{partner?.name?.[0] || '?'}</div>
                <div><p className="font-semibold text-sm text-gray-900">{partner?.name}</p><p className="text-xs text-gray-500 capitalize">{partner?.role}</p></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <motion.div key={msg._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.senderId._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.senderId._id === user?._id ? 'bg-primary-700 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId._id === user?._id ? 'text-primary-200' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Type a message..." />
                <button onClick={handleSend} disabled={sending || !newMsg.trim()} className="px-4 py-2.5 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
            </>
          ) : <div className="flex-1 flex items-center justify-center"><EmptyState title="Select a conversation" description="Choose a student conversation to reply to." icon={MessageSquare} /></div>}
        </div>
      </div>
    </div>
  );
}
