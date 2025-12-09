import React from 'react';
import { useRouter } from 'next/navigation';

interface AgeVerificationModalProps {
    onVerify: () => void;
}

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onVerify }) => {
    const router = useRouter();

    const handleExit = () => {
        router.push('/'); // Redirecting to home if exit. In standalone app, this might be loop if home is soulmate.
        // But maybe redirects to google or closes tab? 
        // For now, '/' is fine, assume it might show a landing page or empty state.
        // Or actually, window.location.href = 'https://google.com' etc?
        // Detailed implementation: user asked to move it. 
        // If it's a standalone app, '/' IS the app. 
        // I should probably change this to something else or keep it and ensure '/' handles unverified state.
        // But wait, the soulmate page IS likely '/' in the new app.
        // If they click Exit, they shouldn't be here.
        // I'll leave it as '/' for now or make it reload?
        // Original code: router.push('/'), which went to main hub.
        // Here, I'll set it to window.close or google.
        window.location.href = 'https://www.google.com';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-md" />

            {/* Modal Content */}
            <div className="relative bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-fade-in">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-orange-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-bold text-orange-50 mb-4">Age Verification</h2>

                    <p className="text-orange-100/70 text-lg mb-6">
                        You must be 18 years or older to access the AI Spicy Chat comparison tool.
                    </p>

                    <div className="bg-stone-950/50 p-4 rounded-xl border border-stone-800 mb-8 text-left">
                        <h4 className="text-sm font-semibold text-stone-400 mb-2 uppercase tracking-wider">Legal Disclaimer</h4>
                        <p className="text-stone-500 text-sm leading-relaxed">
                            This tool provides AI-generated interactions for entertainment purposes only.
                            The characters are fictional. By proceeding, you confirm that you are over 18 years of age
                            and agree to our Terms of Service. You assume full responsibility for your interactions.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button
                            onClick={handleExit}
                            className="flex-1 px-6 py-3 rounded-xl bg-stone-800 text-stone-300 font-medium hover:bg-stone-700 transition-colors"
                        >
                            Exit
                        </button>
                        <button
                            onClick={onVerify}
                            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium hover:from-orange-500 hover:to-red-500 transition-all shadow-lg shadow-orange-900/20"
                        >
                            I am 18+ (Enter)
                        </button>
                    </div>

                    <p className="text-xs text-stone-500 mt-6">
                        False verification is a violation of our terms.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AgeVerificationModal;
