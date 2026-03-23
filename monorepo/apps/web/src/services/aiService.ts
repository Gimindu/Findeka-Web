const API_URL = "http://localhost:8001";

export interface ItemMatch {
    _id: string;
    name: string;
    description: string;
    category: string;
    image_path: string;
    image_url?: string;
    final_score: number;
    // Add other fields from mongo doc
    [key: string]: any;
}

export const searchItems = async (formData: FormData): Promise<{ matches: ItemMatch[] }> => {
    try {
        const response = await fetch(`${API_URL}/search`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Search failed: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const submitItem = async (formData: FormData) => {
    try {
        const response = await fetch(`${API_URL}/submit`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Submission failed: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const checkHealth = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/`);
        return response.ok;
    } catch (error) {
        return false;
    }
};

let globalItemsCache: { items: ItemMatch[] } | null = null;

export const fetchAllItems = async (forceRefresh = false): Promise<{ items: ItemMatch[] }> => {
    if (!forceRefresh && globalItemsCache) {
        return globalItemsCache;
    }
    
    try {
        const response = await fetch(`${API_URL}/items`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch items: ${errorText}`);
        }
        const data = await response.json();
        globalItemsCache = data;
        return data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

// --- User Profile & Settings ---

export const getUserProfile = async (uid: string) => {
    const res = await fetch(`${API_URL}/user/profile?uid=${uid}`);
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
};

export const updateUserProfile = async (uid: string, data: any) => {
    const res = await fetch(`${API_URL}/user/profile?uid=${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
};

export const getUserSettings = async (uid: string) => {
    const res = await fetch(`${API_URL}/user/settings?uid=${uid}`);
    if (!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
};

export const updateUserSettings = async (uid: string, data: any) => {
    const res = await fetch(`${API_URL}/user/settings?uid=${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    return res.json();
};

export const deleteItem = async (itemId: string) => {
    const res = await fetch(`${API_URL}/items/${itemId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete item");
    globalItemsCache = null; // reset cache
    return res.json();
};

