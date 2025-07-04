// authModel.js
const BASE_URL = 'https://story-api.dicoding.dev/v1';
const TOKEN_KEY = 'authToken';

const authModel = {
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login gagal');
    }

    sessionStorage.setItem(TOKEN_KEY, data.loginResult.token); 
    return data.loginResult.token; 
  },

  async register(name, email, password) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Registrasi gagal');
    }

    return data;  
  },

  getToken() {
    return sessionStorage.getItem(TOKEN_KEY); 
  },

  logout() {
    sessionStorage.removeItem(TOKEN_KEY); 
  }
};

export default authModel;
