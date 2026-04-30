import { Shield, FileText, Mic } from "lucide-react";

export type IntegratedAppField = {
    key: string;
    label: string;
    type: "text" | "password";
    placeholder?: string;
};

export type IntegratedApp = {
    id: string;
    name: string;
    description: string;
    icon: any;
    logoUrl?: string;
    logoBg?: string; // Hex or CSS color for the icon background
    category: string;
    fields: IntegratedAppField[];
};

export const INTEGRATED_APPS: IntegratedApp[] = [
    {
        id: "notion",
        name: "Notion",
        description: "Connect your workspace to use Notion as a data context for AI features.",
        icon: FileText,
        logoUrl: "/logos/notion.png",
        logoBg: "#FFFFFF",
        category: "Productivity",
        fields: [
            { key: "apiKey", label: "Internal Integration Token", type: "password", placeholder: "secret_..." },
            { key: "databaseId", label: "Database ID (Optional)", type: "text", placeholder: "Optional database to sync" }
        ],
    },
    {
        id: "elevenlabs",
        name: "ElevenLabs",
        description: "Integrate premium AI voices and text-to-speech capabilities into your apps.",
        icon: Mic,
        logoUrl: "/logos/elevenlabs.png",
        logoBg: "#FFFFFF",
        category: "AI",
        fields: [
            { key: "apiKey", label: "API Key", type: "password", placeholder: "sk_..." }
        ],
    },
];
