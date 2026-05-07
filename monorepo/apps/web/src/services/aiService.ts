// Service module: aiService
// Purpose: API calls and server communication helpers.

const API_URL = "http://localhost:8001";

const CACHE_TTL = {
    items: 30_000,
    profile: 60_000,
    settings: 60_000,
    userItems: 30_000,
    notifications: 15_000,
};

type CacheEntry<T> = {
    data: T;
    expiresAt: number;
};

export interface ItemMatch {
    _id: string;
    name: string;
    description: string;
    category: string;
    image_path: string;
    image_url?: string;
    final_score: number;
    score_breakdown?: {
        base_score: number;
        visual_score: number;
        text_logic_score: number;
        location_score: number;
        color_score: number;
        time_score: number;
        ocr_boost: number;
        multiplier: number;
        clash_penalty: number;
    };
    // Add other fields from mongo doc
    [key: string]: any;
}

export interface AdminStats {
    total_posts: number;
    pending_review: number;
    rejected_posts: number;
    total_users: number;
    open_reports: number;
}

export interface UserReport {
    _id: string;
    item_id: string;
    reporter_uid: string;
    reason: string;
    status: "pending" | "resolved" | "rejected";
    item?: ItemMatch;
    [key: string]: any;
}

export interface UserNotification {
    _id: string;
    uid: string;
    title: string;
    message: string;
    type: "match" | "system" | "update" | "alert" | string;
    read: boolean;
    created_at?: string;
    match_id?: string;
    matched_item_id?: string;
    match_status?: string;
    match_action?: string;
    counterpart_uid?: string;
    counterpart_name?: string;
    counterpart_phone?: string;
    counterpart_location?: string;
    counterpart_role?: string;
    counterpart_item_name?: string;
    [key: string]: any;
}

export interface MatchRecord {
    _id: string;
    requester_uid: string;
    target_uid: string;
    matched_item_id: string;
    requester_post_type: "lost" | "found" | string;
    requester_item_name: string;
    matched_item_name: string;
    status: "confirmed" | "accepted" | "rejected" | "completed" | string;
    timeline?: Array<{
        status: string;
        by_uid: string;
        note?: string;
        at?: string;
    }>;
    [key: string]: any;
}

let globalItemsCache: CacheEntry<{ items: ItemMatch[] }> | null = null;
const userProfileCache = new Map<string, CacheEntry<any>>();
const userSettingsCache = new Map<string, CacheEntry<any>>();
const userItemsCache = new Map<string, CacheEntry<{ items: ItemMatch[] }>>();
const userNotificationsCache = new Map<string, CacheEntry<{ notifications: UserNotification[] }>>();

function isCacheValid<T>(entry: CacheEntry<T> | null | undefined) {
    return !!entry && entry.expiresAt > Date.now();
}

function setCacheEntry<T>(ttl: number, data: T): CacheEntry<T> {
    return {
        data,
        expiresAt: Date.now() + ttl,
    };
}

function invalidateUserScopedCache(uid?: string) {
    if (!uid) return;
    userProfileCache.delete(uid);
    userSettingsCache.delete(uid);
    userItemsCache.delete(uid);
    userNotificationsCache.delete(uid);
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

export const confirmMatch = async (
    requesterUid: string,
    matchedItemId: string,
    requesterPostType: "lost" | "found",
    requesterItemName: string,
) => {
    const res = await fetch(`${API_URL}/matches/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            requester_uid: requesterUid,
            matched_item_id: matchedItemId,
            requester_post_type: requesterPostType,
            requester_item_name: requesterItemName,
        }),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to confirm match");
    }
    userNotificationsCache.delete(requesterUid);
    return res.json();
};

export const acceptMatch = async (uid: string, matchId: string) => {
    const res = await fetch(`${API_URL}/matches/${matchId}/accept?uid=${encodeURIComponent(uid)}`, {
        method: "POST",
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to accept match");
    }
    userNotificationsCache.delete(uid);
    return res.json();
};

export const rejectMatch = async (uid: string, matchId: string) => {
    const res = await fetch(`${API_URL}/matches/${matchId}/reject?uid=${encodeURIComponent(uid)}`, {
        method: "POST",
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to reject match");
    }
    userNotificationsCache.delete(uid);
    return res.json();
};

export const completeMatch = async (uid: string, matchId: string) => {
    const res = await fetch(`${API_URL}/matches/${matchId}/complete?uid=${encodeURIComponent(uid)}`, {
        method: "POST",
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to complete match");
    }
    userNotificationsCache.delete(uid);
    return res.json();
};

export const getMatch = async (uid: string, matchId: string): Promise<{ match: MatchRecord }> => {
    const res = await fetch(`${API_URL}/matches/${matchId}?uid=${encodeURIComponent(uid)}`);
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to fetch match");
    }
    return res.json();
};

export const checkHealth = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_URL}/`);
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const fetchAllItems = async (forceRefresh = false): Promise<{ items: ItemMatch[] }> => {
    if (!forceRefresh && isCacheValid(globalItemsCache)) {
        return globalItemsCache!.data;
    }
    
    try {
        const response = await fetch(`${API_URL}/items`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch items: ${errorText}`);
        }
        const data = await response.json();
        globalItemsCache = setCacheEntry(CACHE_TTL.items, data);
        return data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const getUserItems = async (uid: string, forceRefresh = false): Promise<{ items: ItemMatch[] }> => {
    const cached = userItemsCache.get(uid);
    if (!forceRefresh && isCacheValid(cached)) {
        return cached!.data;
    }
    const res = await fetch(`${API_URL}/user/items?uid=${uid}`);
    if (!res.ok) throw new Error("Failed to fetch user items");
    const data = await res.json();
    userItemsCache.set(uid, setCacheEntry(CACHE_TTL.userItems, data));
    return data;
};

// --- User Profile & Settings ---

export const getUserProfile = async (uid: string, forceRefresh = false) => {
    const cached = userProfileCache.get(uid);
    if (!forceRefresh && isCacheValid(cached)) {
        return cached!.data;
    }
    const res = await fetch(`${API_URL}/user/profile?uid=${uid}`);
    if (!res.ok) throw new Error("Failed to fetch profile");
    const data = await res.json();
    userProfileCache.set(uid, setCacheEntry(CACHE_TTL.profile, data));
    return data;
};

export const updateUserProfile = async (uid: string, data: any) => {
    const res = await fetch(`${API_URL}/user/profile?uid=${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    const result = await res.json();
    userProfileCache.delete(uid);
    return result;
};

export const getUserSettings = async (uid: string, forceRefresh = false) => {
    const cached = userSettingsCache.get(uid);
    if (!forceRefresh && isCacheValid(cached)) {
        return cached!.data;
    }
    const res = await fetch(`${API_URL}/user/settings?uid=${uid}`);
    if (!res.ok) throw new Error("Failed to fetch settings");
    const data = await res.json();
    userSettingsCache.set(uid, setCacheEntry(CACHE_TTL.settings, data));
    return data;
};

export const updateUserSettings = async (uid: string, data: any) => {
    const res = await fetch(`${API_URL}/user/settings?uid=${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    const result = await res.json();
    userSettingsCache.delete(uid);
    return result;
};

export const deleteItem = async (itemId: string) => {
    const res = await fetch(`${API_URL}/items/${itemId}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete item");
    globalItemsCache = null; // reset cache
    userItemsCache.clear();
    return res.json();
};

export const reportItem = async (itemId: string, reporterUid: string, reason: string) => {
    const res = await fetch(`${API_URL}/items/${itemId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reporter_uid: reporterUid, reason }),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to report item");
    }
    userNotificationsCache.delete(reporterUid);
    return res.json();
};

// --- Admin API ---

export const getAdminStats = async (adminUid: string): Promise<AdminStats> => {
    const res = await fetch(`${API_URL}/admin/stats?uid=${adminUid}`);
    if (!res.ok) throw new Error("Failed to fetch admin stats");
    return res.json();
};

export const getPendingPosts = async (adminUid: string): Promise<{ items: ItemMatch[] }> => {
    const res = await fetch(`${API_URL}/admin/posts/pending?uid=${adminUid}`);
    if (!res.ok) throw new Error("Failed to fetch pending posts");
    return res.json();
};

export const approvePost = async (adminUid: string, itemId: string) => {
    const res = await fetch(`${API_URL}/admin/posts/${itemId}/approve?uid=${adminUid}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to approve post");
    globalItemsCache = null;
    userItemsCache.clear();
    userNotificationsCache.clear();
    return res.json();
};

export const rejectPost = async (adminUid: string, itemId: string, reason = "") => {
    const params = new URLSearchParams({ uid: adminUid, reason });
    const res = await fetch(`${API_URL}/admin/posts/${itemId}/reject?${params.toString()}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reject post");
    globalItemsCache = null;
    userItemsCache.clear();
    userNotificationsCache.clear();
    return res.json();
};

export const getRecycledPosts = async (adminUid: string): Promise<{ items: ItemMatch[] }> => {
    const res = await fetch(`${API_URL}/admin/posts/recycled?uid=${adminUid}`);
    if (!res.ok) throw new Error("Failed to fetch recycled posts");
    return res.json();
};

export const restorePost = async (adminUid: string, itemId: string) => {
    const res = await fetch(`${API_URL}/admin/posts/${itemId}/restore?uid=${adminUid}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to restore post");
    globalItemsCache = null;
    userItemsCache.clear();
    return res.json();
};

export const permanentlyDeletePost = async (adminUid: string, itemId: string) => {
    const res = await fetch(`${API_URL}/admin/posts/${itemId}/permanent?uid=${adminUid}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to permanently delete post");
    globalItemsCache = null;
    userItemsCache.clear();
    userNotificationsCache.clear();
    return res.json();
};

export const getAllUsers = async (adminUid: string): Promise<{ users: any[] }> => {
    const res = await fetch(`${API_URL}/admin/users?uid=${adminUid}`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
};

export const suspendUser = async (adminUid: string, targetUid: string) => {
    const res = await fetch(`${API_URL}/admin/users/${targetUid}/suspend?uid=${adminUid}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to suspend user");
    return res.json();
};

export const unsuspendUser = async (adminUid: string, targetUid: string) => {
    const res = await fetch(`${API_URL}/admin/users/${targetUid}/unsuspend?uid=${adminUid}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to unsuspend user");
    return res.json();
};

export const deleteUserByAdmin = async (adminUid: string, targetUid: string) => {
    const res = await fetch(`${API_URL}/admin/users/${targetUid}?uid=${adminUid}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete user");
    invalidateUserScopedCache(targetUid);
    return res.json();
};

export const getReports = async (adminUid: string): Promise<{ reports: UserReport[] }> => {
    const res = await fetch(`${API_URL}/admin/reports?uid=${adminUid}`);
    if (!res.ok) throw new Error("Failed to fetch reports");
    return res.json();
};

export const resolveReport = async (adminUid: string, reportId: string) => {
    const res = await fetch(`${API_URL}/admin/reports/${reportId}/resolve?uid=${adminUid}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to resolve report");
    return res.json();
};

export const rejectReport = async (adminUid: string, reportId: string) => {
    const res = await fetch(`${API_URL}/admin/reports/${reportId}/reject?uid=${adminUid}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reject report");
    return res.json();
};

export const removeReportedItem = async (adminUid: string, reportId: string) => {
    const res = await fetch(`${API_URL}/admin/reports/${reportId}/remove-item?uid=${adminUid}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to remove reported item");
    globalItemsCache = null;
    userItemsCache.clear();
    userNotificationsCache.clear();
    return res.json();
};

// --- Notifications ---

export const getUserNotifications = async (uid: string, forceRefresh = false): Promise<{ notifications: UserNotification[] }> => {
    const cached = userNotificationsCache.get(uid);
    if (!forceRefresh && isCacheValid(cached)) {
        return cached!.data;
    }
    const res = await fetch(`${API_URL}/user/notifications?uid=${uid}`);
    if (!res.ok) throw new Error("Failed to fetch notifications");
    const data = await res.json();
    userNotificationsCache.set(uid, setCacheEntry(CACHE_TTL.notifications, data));
    return data;
};

export const markNotificationRead = async (uid: string, notificationId: string) => {
    const res = await fetch(`${API_URL}/user/notifications/${notificationId}/read?uid=${uid}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to mark notification as read");
    const result = await res.json();
    userNotificationsCache.delete(uid);
    return result;
};

export const markAllNotificationsRead = async (uid: string) => {
    const res = await fetch(`${API_URL}/user/notifications/read-all?uid=${uid}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to mark all notifications as read");
    const result = await res.json();
    userNotificationsCache.delete(uid);
    return result;
};

export const clearUserNotifications = async (uid: string) => {
    const res = await fetch(`${API_URL}/user/notifications/clear?uid=${uid}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to clear notifications");
    const result = await res.json();
    userNotificationsCache.delete(uid);
    return result;
};



