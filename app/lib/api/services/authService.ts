export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface LoginResponse {
    user: User;
}

// Login fonksiyonu - Cookie tabanlı
export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Cookie'leri dahil et
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Giriş başarısız');
    }

    return data;
};

// Register fonksiyonu
export const register = async (userData: RegisterData): Promise<void> => {
    const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Kayıt başarısız');
    }
};

// Logout fonksiyonu
export const logout = async (): Promise<void> => {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Çıkış başarısız');
    }
};

// Mevcut kullanıcıyı al (token doğrulama)
export const getCurrentUser = async (): Promise<User> => {
    const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Kullanıcı bilgileri alınamadı');
    }

    return data.user;
};

// Token'ı header'a eklemek için utility fonksiyon (eğer API çağrıları yapacaksanız)
export const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json',
        // Cookie otomatik olarak gönderilecek, manual header gerekmez
    };
};