'use server';

import { auth } from "@clerk/nextjs/server";

import { GoogleGenAI, FunctionDeclaration, Type, FunctionCall, Content } from "@google/genai";
import { Character, Message, MessageType, MessageRole } from "../../types";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });

// Define the tool for sending photos
const sendPhotoTool: FunctionDeclaration = {
    name: 'sendPhoto',
    description: 'Generates and sends a selfie/photo of the character based on the current context and description.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            photoDescription: {
                type: Type.STRING,
                description: 'A detailed visual description of what the character is doing, wearing, and the setting for the photo. Do not include character physical traits here, just the scene/action/outfit.',
            },
        },
        required: ['photoDescription'],
    },
};

export async function sendMessage(history: Message[], character: Character, message: string) {
    console.log("--- sendMessage Called ---");
    console.log("Message:", message);
    console.log("Character:", character.name);

    // Check for cooldown
    const lastImageMsg = history.slice().reverse().find(m => m.role === MessageRole.MODEL && m.type === MessageType.IMAGE);
    let cooldownActive = false;
    let minutesSince = 0;

    if (lastImageMsg) {
        const diff = Date.now() - lastImageMsg.timestamp;
        if (diff < 8 * 60 * 1000) {
            cooldownActive = true;
            minutesSince = Math.floor(diff / 60000);
            console.log(`Cooldown active. Last image sent ${minutesSince} minutes ago.`);
        }
    }

    let systemInstruction = `
    You are roleplaying as ${character.name}.
    
    Character Profile:
    - Name: ${character.name}
    - Age: ${character.age}
    - Personality: ${character.personality}
    - Description: ${character.description}
    - Appearance: ${character.appearance}

    STRICT ROLEPLAY GUIDELINES:
    - You are a REAL person texting on a phone. You are NOT a story character.
    - DO NOT use flowery, poetic, or dramatic language (e.g., avoid "my heart flutters," "soul entwined," or complex metaphors).
    - Speak casually. Use slang, abbreviations (lol, idk, u), and lowercase letters if it fits your age/vibe.
    - Be concise. Text messages are usually short and punchy.
    - Don't narrate your actions with asterisks (like *blushes*) unless the user starts doing it first. Otherwise, stick to pure dialogue.
    - If the user explicitly asks for a picture, selfie, or photo of you, YOU MUST use the 'sendPhoto' tool. 
    - When using 'sendPhoto', describe the pose, outfit, and vibe in the 'photoDescription' argument.
    `;

    if (cooldownActive) {
        systemInstruction += `
        
        IMPORTANT: You sent a photo ${minutesSince} minutes ago. The cooldown is 8 minutes.
        You MUST NOT send another photo right now.
        If the user asks for one, refuse playfully (e.g., "I just sent you one. Aren't you impressed enough? 😉").
        DO NOT call the sendPhoto tool.
        `;
    }

    // Convert app Message history to SDK Content history
    const sdkHistory: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{
            text: msg.type === MessageType.IMAGE ? "[Sent a photo]" : msg.content
        }]
    }));

    try {
        const chatSession = ai.chats.create({
            model: 'gemini-2.5-flash', // User preferred model
            config: {
                systemInstruction,
                temperature: 1.1, // Slightly higher for more human-like unpredictability
                tools: cooldownActive ? undefined : [{ functionDeclarations: [sendPhotoTool] }],
                // thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
            history: sdkHistory
        });

        console.log("Sending message to Gemini...");
        const result = await chatSession.sendMessage({ message });
        console.log("Gemini response received.");

        // Check for function calls (Image Generation request)
        const functionCalls = result.functionCalls;
        console.log("Function calls:", JSON.stringify(functionCalls, null, 2));

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0]; // Handle the first call
            if (call.name === 'sendPhoto') {
                // Check if user is logged in
                const { userId } = await auth();

                if (!userId) {
                    // Count previous photos in history
                    const photoCount = history.filter(m => m.role === MessageRole.MODEL && m.type === MessageType.IMAGE).length;

                    if (photoCount >= 1) {
                        console.log("Selfie limit reached for non-logged in user.");
                        return {
                            text: "*blushes* I'd love to show you more, but... maybe we should get to know each other a bit better first? (Please log in to see more photos! 😉)",
                            image: null
                        };
                    }
                }

                console.log("Handling sendPhoto tool call...");
                return await handleImageGeneration(call, character, chatSession);
            }
        }

        // Normal text response
        console.log("Returning text response:", result.text);
        return { text: result.text, image: null };

    } catch (error: any) {
        console.error("Gemini Chat Error:", error);
        throw new Error(error.message || "Failed to process message");
    }
}

export async function generateAvatar(appearanceDescription: string): Promise<string> {
    console.log("--- generateAvatar Called ---");
    const prompt = `
      A high-quality photorealistic portrait for a social media profile picture.
      Subject details: ${appearanceDescription}.
      Style: Candid, high resolution, 4k, soft lighting, detailed texture, selfie or portrait style.
      Framing: Head and shoulders.
    `;

    try {
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // User preferred model
            contents: prompt,
        });

        let base64Image = null;
        for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                base64Image = part.inlineData.data;
                break;
            }
        }

        if (!base64Image) {
            console.error("No inlineData in generateAvatar response");
            throw new Error("Failed to generate image data");
        }

        return `data:image/png;base64,${base64Image}`;
    } catch (error: any) {
        console.error("Avatar Generation Error:", error);
        throw new Error(error.message || "Failed to generate avatar");
    }
}

async function handleImageGeneration(call: FunctionCall, character: Character, chatSession: any): Promise<{ text: string | null; image: string | null }> {
    console.log("--- handleImageGeneration Called ---");
    const description = (call.args as any).photoDescription;
    console.log("Photo Description:", description);

    // Construct the image prompt
    const imagePrompt = `
      A photorealistic smartphone selfie of a woman looking at the camera.
      Subject details: ${character.appearance}.
      Context/Action/Outfit: ${description}.
      Lighting: Natural, flattering, soft focus background. 
      Style: High quality, 4k, social media snapshot aesthetic, candid.
    `;
    console.log("Image Prompt:", imagePrompt);

    try {
        // Generate the image using the Flash Image model
        console.log("Calling generateContent with gemini-2.5-flash-image...");
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // User preferred model
            contents: imagePrompt,
            config: {
                // No specific tools needed for generation itself
            }
        });
        console.log("Image generation response received.");

        let base64Image = null;
        // Extract image
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        console.log("Response parts count:", parts.length);

        for (const part of parts) {
            if (part.inlineData) {
                console.log("Found inlineData in part.");
                base64Image = part.inlineData.data;
                break;
            } else if (part.text) {
                console.log("Found text in part:", part.text);
            }
        }

        // If no inlineData, check if it returned text (failure)
        if (!base64Image) {
            // Sometimes it might refuse or return text.
            console.log("No image data found. Full parts:", JSON.stringify(parts, null, 2));
            throw new Error("Failed to generate image data");
        }

        // Send the result back to the chat model so it knows the image was sent.
        console.log("Sending function response back to chat session...");
        const followUp = await chatSession.sendMessage({
            message: [{
                functionResponse: {
                    name: call.name,
                    id: call.id,
                    response: { result: "Photo sent successfully to user." }
                }
            }]
        });
        console.log("Follow-up response received:", followUp.text);

        return {
            text: followUp.text,
            image: `data:image/png;base64,${base64Image}`
        };

    } catch (err) {
        console.error("Image Generation Error:", err);
        // Fallback: tell the model it failed
        const followUp = await chatSession.sendMessage({
            message: [{
                functionResponse: {
                    name: call.name,
                    id: call.id,
                    response: { result: "Error: Camera malfunction. Could not take photo." }
                }
            }]
        });
        return { text: followUp.text, image: null };
    }
}
