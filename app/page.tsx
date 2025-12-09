'use client';

import React, { useState } from 'react';
import CharacterSelector from '../components/soulmate/CharacterSelector';
import ChatInterface from '../components/soulmate/ChatInterface';
import AgeVerificationModal from '../components/soulmate/AgeVerificationModal';
import { Character } from '../types';
import { useUser } from '@clerk/nextjs';
import LoginNotificationBubble from '../components/soulmate/LoginNotificationBubble';

export default function Home() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const { isSignedIn, isLoaded } = useUser();
  // Initialize as false, could check sessionStorage here if we wanted persistence per session
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  return (
    <main className="min-h-screen bg-stone-950 text-orange-100 py-24 px-4 flex flex-col items-center">
      {!isAgeVerified && <AgeVerificationModal onVerify={() => setIsAgeVerified(true)} />}

      <div className={`w-full max-w-7xl mx-auto transition-opacity duration-500 ${!isAgeVerified ? 'opacity-0 pointer-events-none overflow-hidden h-screen' : 'opacity-100'}`}>

        {selectedCharacter ? (
          <div className="animate-fade-in w-full">
            <ChatInterface
              key={selectedCharacter.id}
              character={selectedCharacter}
              onBack={() => setSelectedCharacter(null)}
            />
          </div>
        ) : (
          <>
            <CharacterSelector onSelect={setSelectedCharacter} />
            {isLoaded && !isSignedIn && <LoginNotificationBubble />}
          </>
        )}
      </div>
    </main>
  );
}
