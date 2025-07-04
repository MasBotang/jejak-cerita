import LoginPresenter from '../presenters/loginPresenter.js';
import authModel from '../model/authModel.js';

const LoginView = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <section class="container mt-5" style="max-width: 500px;">
        <h2 class="mb-4 text-center">Login</h2>
        <form id="loginForm">
          <div class="mb-3">
            <label for="email" class="form-label">Email:</label>
            <input type="email" id="email" class="form-control" placeholder="Masukkan email" required aria-label="Email" />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password:</label>
            <input type="password" id="password" class="form-control" placeholder="Masukkan password" required aria-label="Password" />
          </div>
          <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>

        <div id="loginMessage" class="mt-3"></div>

        <p class="text-center mt-4">
          Belum punya akun?
          <a href="#/register" class="text-decoration-none">Daftar di sini</a>
        </p>
      </section>
    `;
  },

  bindLoginHandler(handler) {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      handler({ email, password });
    });
  },

  showMessage(msg, type = 'danger') {
    const messageEl = document.getElementById('loginMessage');
    messageEl.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  },

  showLoading() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <section class="container d-flex justify-content-center align-items-center" style="min-height: 80vh;">
        <div class="spinner-border text-primary" role="status" aria-label="Memverifikasi informasi...">
          <span class="visually-hidden">Memverifikasi informasi...</span>
        </div>
        <p class="ms-3">Memverifikasi informasi...</p>
      </section>
    `;
  },

  resetForm() {
    const form = document.getElementById('loginForm');
    form.reset();
    const messageEl = document.getElementById('loginMessage');
    if (messageEl) messageEl.innerHTML = '';
  },

  async afterRender() {
    this.render();
    const model = authModel;
    new LoginPresenter(this, model);
  },

  cleanup() {
    console.log('LoginView: Cleaning up.');
  }
};

export default LoginView;
