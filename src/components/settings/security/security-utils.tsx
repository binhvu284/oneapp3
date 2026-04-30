import {
    Smartphone, Monitor, Laptop, Tablet, Lock, ShieldCheck, LogOut, Mail, LogIn
} from "lucide-react";

export const mockSessions = [
    { id: "1", device: "Chrome on Windows", icon: "monitor", ip: "192.168.1.100", location: "Ho Chi Minh City, VN", lastActive: "Just now", isCurrent: true },
    { id: "2", device: "Safari on iPhone 15", icon: "smartphone", ip: "10.0.0.52", location: "Ha Noi, VN", lastActive: "2 hours ago", isCurrent: false },
    { id: "3", device: "Firefox on MacBook Pro", icon: "laptop", ip: "172.16.0.88", location: "Da Nang, VN", lastActive: "1 day ago", isCurrent: false },
];

export const mockLoginHistory = [
    { id: "1", time: "2026-02-11 09:32", ip: "192.168.1.100", device: "Chrome on Windows", location: "Ho Chi Minh City", status: "success" as const },
    { id: "2", time: "2026-02-10 22:15", ip: "10.0.0.52", device: "Safari on iPhone", location: "Ha Noi", status: "success" as const },
    { id: "3", time: "2026-02-10 18:44", ip: "203.0.113.42", device: "Unknown Browser", location: "Unknown", status: "failed" as const },
    { id: "4", time: "2026-02-09 14:20", ip: "172.16.0.88", device: "Firefox on Mac", location: "Da Nang", status: "success" as const },
    { id: "5", time: "2026-02-08 08:10", ip: "192.168.1.100", device: "Chrome on Windows", location: "Ho Chi Minh City", status: "success" as const },
];

export const mockTrustedDevices = [
    { id: "1", name: "Windows Desktop - Chrome", icon: "monitor", lastUsed: "Today", addedOn: "Jan 15, 2026" },
    { id: "2", name: "iPhone 15 Pro - Safari", icon: "smartphone", lastUsed: "Yesterday", addedOn: "Dec 20, 2025" },
    { id: "3", name: "iPad Air - Safari", icon: "tablet", lastUsed: "3 days ago", addedOn: "Nov 5, 2025" },
];

export const mockActivityLog = [
    { id: "1", type: "login", description: "Signed in from Chrome on Windows", time: "2 hours ago", ip: "192.168.1.100" },
    { id: "2", type: "password", description: "Password was changed", time: "3 days ago", ip: "192.168.1.100" },
    { id: "3", type: "2fa", description: "Two-factor authentication enabled", time: "1 week ago", ip: "172.16.0.88" },
    { id: "4", type: "session", description: "Session revoked - Firefox on Linux", time: "2 weeks ago", ip: "192.168.1.100" },
    { id: "5", type: "email", description: "Recovery email updated", time: "1 month ago", ip: "10.0.0.52" },
];

export function DeviceIcon({ type, className }: { type: string; className?: string }) {
    const cls = className || "w-4 h-4";
    switch (type) {
        case "smartphone": return <Smartphone className={cls} />;
        case "laptop": return <Laptop className={cls} />;
        case "tablet": return <Tablet className={cls} />;
        default: return <Monitor className={cls} />;
    }
}

export function ActivityIcon({ type, className }: { type: string; className?: string }) {
    const cls = className || "w-4 h-4";
    switch (type) {
        case "password": return <Lock className={cls} />;
        case "2fa": return <ShieldCheck className={cls} />;
        case "session": return <LogOut className={cls} />;
        case "email": return <Mail className={cls} />;
        default: return <LogIn className={cls} />;
    }
}
