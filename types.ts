export interface Character {
    id: string;
    name: string;
    age: number;
    description: string;
    personality: string;
    appearance: string;
    avatarUrl: string;
}

export enum MessageRole {
    USER = 'user',
    MODEL = 'model',
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
}

export interface Message {
    id: string;
    role: MessageRole;
    type: MessageType;
    content: string;
    timestamp: number;
}
