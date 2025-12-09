import React from 'react';
import { Message, MessageRole, MessageType } from '../../types';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === MessageRole.USER;

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[80%] rounded-2xl p-4 ${isUser
                    ? 'bg-orange-600 text-white rounded-tr-none'
                    : 'bg-stone-800 text-stone-200 rounded-tl-none'
                    }`}
            >
                {message.type === MessageType.IMAGE ? (
                    <div className="rounded-lg overflow-hidden">
                        <img
                            src={message.content}
                            alt="Sent by AI"
                            className="w-full h-auto max-w-sm object-cover"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap leading-normal">{message.content.replace(/\n\s*\n/g, '\n')}</p>
                )}
                <div className={`text-xs mt-1 ${isUser ? 'text-orange-200' : 'text-stone-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
