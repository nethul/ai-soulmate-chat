import React, { useState, useEffect } from 'react';
import { Character } from '../../types';
import { PRESET_CHARACTERS } from '../../constants/soulmate';
import { generateAvatar } from '../../app/actions/soulmateActions';
import { saveCharacter, getUserCharacters } from '../../app/actions/characterActions';
import { useUser, useClerk } from '@clerk/nextjs';

interface CharacterSelectorProps {
    onSelect: (character: Character) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ onSelect }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newChar, setNewChar] = useState<Partial<Character>>({
        name: '',
        age: 25,
        description: '',
        personality: '',
        appearance: '',
    });
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
    const { user, isLoaded } = useUser();
    const { openSignIn } = useClerk();
    const [isSaving, setIsSaving] = useState(false);
    const [userCharacters, setUserCharacters] = useState<Character[]>([]);

    useEffect(() => {
        const fetchUserCharacters = async () => {
            if (user?.id) {
                const chars = await getUserCharacters(user.id);
                setUserCharacters(chars);
            }
        };

        if (isLoaded && user) {
            fetchUserCharacters();
        }
    }, [user, isLoaded]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        if ((newChar.age || 0) < 18) {
            return; // Validation handled by UI
        }

        if (newChar.name && newChar.description && newChar.appearance) {
            const character: Character = {
                id: `custom_${Date.now()}`,
                name: newChar.name || 'Unknown',
                age: newChar.age || 25,
                description: newChar.description || '',
                personality: newChar.personality || 'Friendly',
                appearance: newChar.appearance || '',
                avatarUrl: generatedAvatar || `https://ui-avatars.com/api/?name=${newChar.name}&background=random`,
            };
            onSelect(character);
        }
    };

    const handleGenerateAvatar = async () => {
        if (!newChar.appearance) return;
        setIsGeneratingAvatar(true);
        try {
            const url = await generateAvatar(newChar.appearance);
            setGeneratedAvatar(url);
        } catch (e) {
            console.error("Failed to generate avatar", e);
            alert("Failed to generate avatar. Please try again.");
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            // Not logged in
            const confirmLogin = window.confirm("You need to be signed in to save characters. Sign in now?");
            if (confirmLogin) {
                openSignIn();
            }
            return;
        }

        if (!newChar.name || !newChar.description || !newChar.appearance) {
            alert("Please fill in all fields before saving.");
            return;
        }

        if ((newChar.age || 0) < 18) {
            alert("Character must be 18 or older.");
            return;
        }

        setIsSaving(true);
        const character: Character = {
            id: `custom_${Date.now()}`,
            name: newChar.name || 'Unknown',
            age: newChar.age || 25,
            description: newChar.description || '',
            personality: newChar.personality || 'Friendly',
            appearance: newChar.appearance || '',
            avatarUrl: generatedAvatar || `https://ui-avatars.com/api/?name=${newChar.name}&background=random`,
        };

        const result = await saveCharacter(character, user.id);
        setIsSaving(false);

        if (result.success) {
            alert("Character saved successfully!");
            // Refresh list and go back to selection
            const chars = await getUserCharacters(user.id);
            setUserCharacters(chars);
            setIsCreating(false);
            setNewChar({
                name: '',
                age: 25,
                description: '',
                personality: '',
                appearance: '',
            });
            setGeneratedAvatar(null);
        } else {
            alert(`Failed to save character: ${result.error}`);
        }
    };

    if (isCreating) {
        return (
            <div className="max-w-md mx-auto w-full p-6 animate-fade-in">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => setIsCreating(false)}
                        className="p-2 hover:bg-stone-800/50 rounded-full text-stone-400 hover:text-white transition-colors mr-2"
                        title="Back to selection"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <div className="text-center flex-1">
                        <h2 className="text-2xl font-bold text-orange-50 mb-1">Create Your Spicy Partner</h2>
                        <p className="text-orange-200/70 text-sm">Design their personality and look.</p>
                    </div>
                    <div className="w-10" /> {/* Spacer for visual balance */}
                </div>

                <form onSubmit={handleCreate} className="space-y-4">

                    {/* Avatar Preview Section */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-stone-800 ring-2 ring-orange-900/50 mb-3 shadow-lg group">
                            {generatedAvatar ? (
                                <img src={generatedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                            )}

                            {isGeneratingAvatar && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                    <svg className="animate-spin h-6 w-6 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleGenerateAvatar}
                            disabled={!newChar.appearance || isGeneratingAvatar}
                            className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${newChar.appearance
                                ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20'
                                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                            {generatedAvatar ? 'Regenerate Photo' : 'Generate Photo'}
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-orange-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder-stone-600"
                            placeholder="e.g. Natasha"
                            value={newChar.name}
                            onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Age</label>
                        <input
                            type="number"
                            required
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-orange-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            value={newChar.age}
                            onChange={(e) => setNewChar({ ...newChar, age: parseInt(e.target.value) })}
                        />
                        {(newChar.age || 0) < 18 && (
                            <p className="text-red-500 text-xs mt-1">
                                Age must be 18 or older.
                            </p>
                        )}
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-stone-400">Appearance</label>
                        </div>
                        <textarea
                            required
                            rows={3}
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-orange-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder-stone-600 resize-none"
                            placeholder="Describe hair color, eyes, style, etc. (Required for photo generation)"
                            value={newChar.appearance}
                            onChange={(e) => setNewChar({ ...newChar, appearance: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Personality</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-orange-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder-stone-600"
                            placeholder="e.g. Sassy, intellectual, shy..."
                            value={newChar.personality}
                            onChange={(e) => setNewChar({ ...newChar, personality: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Backstory</label>
                        <textarea
                            required
                            rows={3}
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-orange-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder-stone-600 resize-none"
                            placeholder="A short bio..."
                            value={newChar.description}
                            onChange={(e) => setNewChar({ ...newChar, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="flex-1 px-4 py-3 rounded-xl bg-stone-800 text-stone-300 font-medium hover:bg-stone-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Character'}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20"
                        >
                            Start Chatting
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-4 tracking-tight">
                    AI Spicy Chat
                </h1>
                <p className="text-orange-200/70 text-lg">Choose your partner or imagine someone new.</p>
            </div>

            {userCharacters.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-xl font-semibold text-orange-50 mb-6 pl-2 border-l-4 border-orange-500">Your Characters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userCharacters.map((char) => (
                            <button
                                key={char.id}
                                onClick={() => onSelect(char)}
                                className="group relative overflow-hidden rounded-3xl bg-stone-900 border border-stone-800 hover:border-orange-500/30 transition-all duration-300 cursor-pointer h-80 flex flex-col text-left w-full"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent z-10" />

                                <div className="h-full w-full absolute top-0 left-0">
                                    <img
                                        src={char.avatarUrl}
                                        alt={char.name}
                                        className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                    />
                                </div>

                                <div className="relative z-20 mt-auto p-6 w-full">
                                    <h3 className="text-2xl font-bold text-orange-50 mb-1 group-hover:text-orange-400 transition-colors">{char.name}, {char.age}</h3>
                                    <p className="text-orange-100/70 text-sm line-clamp-3 leading-relaxed drop-shadow-md">{char.description}</p>

                                    <div className="mt-4 flex items-center text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        Chat now
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <h2 className="text-xl font-semibold text-orange-50 mb-6 pl-2 border-l-4 border-red-500">Create or Choose Preset</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Card */}
                <button
                    onClick={() => setIsCreating(true)}
                    className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-stone-800 hover:border-orange-500/50 hover:bg-stone-900/50 transition-all duration-300 h-[480px]"
                >
                    <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-stone-500 group-hover:text-orange-500 transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-stone-400 group-hover:text-orange-50">Create New</h3>
                    <p className="text-stone-600 text-sm mt-2">Design from scratch</p>
                </button>

                {/* Presets */}
                {PRESET_CHARACTERS.map((char) => (
                    <button
                        key={char.id}
                        onClick={() => onSelect(char)}
                        className="group relative overflow-hidden rounded-3xl bg-stone-900 border border-stone-800 hover:border-orange-500/30 transition-all duration-300 cursor-pointer h-[480px] flex flex-col text-left w-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent z-10" />

                        <div className="h-full w-full absolute top-0 left-0">
                            <img
                                src={char.avatarUrl}
                                alt={char.name}
                                className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                            />
                        </div>

                        <div className="relative z-20 mt-auto p-6 w-full">
                            <h3 className="text-2xl font-bold text-orange-50 mb-1 group-hover:text-orange-400 transition-colors">{char.name}, {char.age}</h3>
                            <p className="text-orange-100/70 text-sm line-clamp-3 leading-relaxed drop-shadow-md">{char.description}</p>

                            <div className="mt-4 flex items-center text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                Chat now
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CharacterSelector;
