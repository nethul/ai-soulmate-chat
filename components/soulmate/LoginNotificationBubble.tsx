import React, { useEffect, useState } from 'react';

const LoginNotificationBubble: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // slight delay to catch attention after age verification transition
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed top-20 right-10 md:right-10 z-50 animate-bounce-in max-w-xs">
            <div className="relative bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-red-500/20 border border-red-500">
                {/* Triangle pointer pointing up/right */}
                <div className="absolute -top-2 right-5 w-4 h-4 bg-red-600 rotate-45 border-l border-t border-red-500 transform"></div>

                <div className="relative z-10">
                    <p className="text-sm font-medium leading-relaxed">
                        Please login to save your chats and characters
                    </p>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-2 -left-2 bg-stone-800 rounded-full p-1 border border-stone-700 text-stone-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default LoginNotificationBubble;
