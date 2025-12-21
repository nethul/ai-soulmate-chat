import React, { useState, useRef, useEffect } from 'react';
import { Character, Message, MessageRole, MessageType } from '../../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { sendMessage } from '../../app/actions/soulmateActions';

interface ChatInterfaceProps {
    character: Character;
    onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ character, onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const isSendingRef = useRef(false);

    const handleSend = async () => {
        if (!inputText.trim() || isSendingRef.current) return;

        isSendingRef.current = true;
        setIsTyping(true);

        const content = inputText.trim();
        setInputText(''); // Clear immediately

        const userMessage: Message = {
            id: Date.now().toString(),
            role: MessageRole.USER,
            type: MessageType.TEXT,
            content: content,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            // Call server action
            const response = await sendMessage(messages, character, userMessage.content, voiceMode);

            if (response.error) {
                console.error("Server Action failed:", response.error);
                // Optionally show UI error
                return;
            }

            if (response.text) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: MessageRole.MODEL,
                    type: MessageType.TEXT,
                    content: response.text,
                    timestamp: Date.now(),
                    audio: response.audio || undefined
                };
                setMessages(prev => [...prev, aiMessage]);

                // Auto-play audio if present
                if (response.audio) {
                    const audio = new Audio(response.audio);
                    audio.play().catch(e => console.error("Audio play failed:", e));
                }
            }

            if (response.image) {
                const imageMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    role: MessageRole.MODEL,
                    type: MessageType.IMAGE,
                    content: response.image,
                    timestamp: Date.now(),
                };
                setMessages(prev => [...prev, imageMessage]);
            }

        } catch (error) {
            console.error('Failed to send message:', error);
            // Optional: Show error toast
        } finally {
            setIsTyping(false);
            isSendingRef.current = false;
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-stone-900 border-b border-stone-800">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={character.avatarUrl}
                                alt={character.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-stone-900"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-orange-50">{character.name}</h3>
                            <p className="text-xs text-orange-400">Online now</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setVoiceMode(!voiceMode)}
                        className={`p-2 rounded-full transition-colors ${voiceMode ? 'bg-orange-600 text-white' : 'hover:bg-stone-800 text-stone-400 hover:text-white'}`}
                        title={voiceMode ? "Voice Mode On" : "Voice Mode Off"}
                    >
                        {/* Speaker Icon */}
                        {voiceMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H6.75c-.621 0-1.125-.504-1.125-1.125v-5.25c0-.621.504-1.125 1.125-1.125h2.25z" />
                            </svg>
                        )}
                    </button>
                    <button className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-950/50 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-stone-500 space-y-4">
                        <img
                            src={character.avatarUrl}
                            alt={character.name}
                            className="w-24 h-24 rounded-full object-cover opacity-50 grayscale"
                        />
                        <p className="text-sm">Start a conversation with {character.name}</p>
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {isTyping && (
                    <div className="flex justify-start mb-4">
                        <div className="flex items-end gap-2">
                            <img
                                src={character.avatarUrl}
                                alt={character.name}
                                className="w-6 h-6 rounded-full object-cover mb-1"
                            />
                            <TypingIndicator />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-stone-900 border-t border-stone-800">
                <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-full px-4 py-2 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all">
                    <button className="p-2 text-stone-500 hover:text-orange-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={`Message ${character.name}...`}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-orange-50 placeholder:text-stone-600 py-2"
                        disabled={isTyping}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isTyping}
                        className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
