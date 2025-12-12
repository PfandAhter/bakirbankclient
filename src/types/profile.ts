export type ProfileTab = "profile" | "password" | "security" | "sessions" | "notifications" | "accounts" | "freeze";

export interface SessionLog {
    device: string;
    location: string;
    ipAddress: string;
    loginTime: string;
    success: boolean;
}

export interface ProfileFormData {
    firstName: string;
    secondName: string;
    lastName: string;
    tckn: string;
    phone: string;
    email: string;
    address: string;
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    birthDate: string;
}

export interface UserApiResponse {
    user: {
        firstName: string;
        secondName: string;
        lastName: string;
        tckn: string;
        phoneNumber: string;
        email: string;
        address: string;
        birthDate: string;
    };
}