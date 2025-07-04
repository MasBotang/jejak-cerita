import { subscribeUserForPush } from '../main.js';

class LoginPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;

    this._checkLoginStatus(); 
    this._bindEvents(); 
  }

  _checkLoginStatus() {
    const token = this.model.getToken();

    if (token) {
      this._redirectHome(); 
    } else {
      this._redirectLogin(); 
    }
  }

  _redirectHome() {
    console.log('LoginPresenter: Pengguna sudah login, mengarahkan ke halaman utama...');
    setTimeout(() => {
      location.hash = '/';
    }, 0);
  }

  _redirectLogin() {
    if (location.hash !== '#/login' && location.hash !== '#/register' && location.hash !== '') {
      this.model.logout();
      console.warn('LoginPresenter: Token tidak ditemukan. Melakukan logout paksa dan mengarahkan ke halaman login.');
      location.hash = '#/login';
    }
  }

  _bindEvents() {
    this.view.bindLoginHandler(this.handleLogin.bind(this)); 
  }

  async handleLogin({ email, password }) {
  console.log('LoginPresenter: handleLogin dipanggil dengan email:', email);
  try {
    const loginResult = await this.model.login(email, password);
    console.log('LoginPresenter: this.model.login berhasil, hasilnya:', loginResult);

    localStorage.setItem('authToken', loginResult.token);  

    this.view.showMessage('Login berhasil! Mengarahkan...', 'success');
    await subscribeUserForPush();

    setTimeout(() => {
      location.hash = '/';
    }, 1000);
  } catch (err) {
    console.error('LoginPresenter: handleLogin gagal:', err.message);
    this.view.showMessage(err.message || 'Login gagal. Cek kembali email dan password.');
  }
}


  async _subscribeUserForPush() {
    try {
      await subscribeUserForPush();
      console.log('LoginPresenter: Pengguna berhasil di-subscribe untuk push notifications.');
    } catch (err) {
      console.error('LoginPresenter: Gagal subscribe pengguna untuk push notifications:', err.message);
    }
  }
}

export default LoginPresenter;
