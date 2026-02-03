const API_URL = "http://localhost:8000";

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
