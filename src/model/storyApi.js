// src/model/storyApi.js
import authModel from './authModel.js';
import { getStoryById as getStoryByIdIndexedDB, 
         putStory as putStoryIndexedDB } from '../utils/indexeddB.js';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

const fetchWithAuth = async (url, options = {}) => {
  const token = authModel.getToken();

  if (!token) {
    throw new Error('AUTH_ERROR: Token tidak ditemukan. Silakan login kembali.');
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('AUTH_ERROR: Sesi berakhir atau tidak valid. Silakan login ulang.');
      }
      throw new Error(data.message || `Terjadi kesalahan: ${res.status}`);
    }

    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error instanceof TypeError) {
      throw new Error('NETWORK_ERROR: Gagal terhubung ke server.');
    }
    throw error;
  }
};

const storyApi = {
  async getStories() {
    const data = await fetchWithAuth(`${BASE_URL}/stories`);
    return data.listStory; 
  },

  async getStoryById(id) {
    try {
      const data = await fetchWithAuth(`${BASE_URL}/stories/${id}`);
      await putStoryIndexedDB(data.story); 
      return { story: data.story, isOffline: false };
    } catch (error) {
      if (error.message.includes('NETWORK_ERROR') || error.message.includes('AUTH_ERROR')) {
        const offlineStory = await getStoryByIdIndexedDB(id); 
        if (offlineStory) {
          return { story: offlineStory, isOffline: true };
        }
      }
      throw new Error(error.message || 'Gagal memuat cerita.');
    }
  },

  async addStory(formData) {
    const data = await fetchWithAuth(`${BASE_URL}/stories`, {
      method: 'POST',
      body: formData,
    });
    return data; 
  },
};

export default storyApi;
