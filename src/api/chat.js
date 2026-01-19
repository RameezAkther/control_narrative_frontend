import API from "./axiosInstance";

// Added trailing slashes to match FastAPI's strict slash router (fixes 307 redirects)
export const createChat = (payload) => API.post(`/chats/`, payload);
export const getChats = () => API.get(`/chats/`);

// Fixed URL construction
export const getChatMessages = (chatId, params) => API.get(`/chats/${chatId}/history`, { params });

export const sendMessage = (chatId, payload) => {
    if (!chatId) throw new Error("Chat ID is missing");
    return API.post(`/chats/${chatId}/message`, payload);
};

export const updateChatName = (chatId, name) => API.patch(`/chats/${chatId}`, { name });
export const deleteChat = (chatId) => API.delete(`/chats/${chatId}`);

export const listTemplates = () => API.get(`/templates/`);
export const createTemplate = (payload) => API.post(`/templates/`, payload);
export const deleteTemplate = (id) => API.delete(`/templates/${id}`);