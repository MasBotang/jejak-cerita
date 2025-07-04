import RegisterPresenter from '../presenters/registerPresenter.js';
import authModel from '../model/authModel.js';

const RegisterView = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <section class="container mt-5" style="max-width: 500px;">
        <h2 class="mb-4 text-center">Registrasi Akun Baru</h2>
        <form id="registerForm" novalidate>
          <div class="mb-3">
            <label for="name" class="form-label">Nama Lengkap:</label>
            <input type="text" id="name" class="form-control shadow-sm" placeholder="Masukkan nama lengkap" required aria-label="Nama Lengkap" />
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email:</label>
            <input type="email" id="email" class="form-control shadow-sm" placeholder="Masukkan email" required aria-label="Email" />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password:</label>
            <input type="password" id="password" class="form-control shadow-sm" placeholder="Masukkan password" required aria-label="Password" />
          </div>
          <button type="submit" class="btn btn-success w-100 shadow-sm">Daftar</button>
        </form>

        <div id="registerMessage" class="mt-3"></div>

        <p class="text-center mt-3">
          Sudah punya akun? <a href="#/login" class="text-decoration-none">Login di sini</a>
        </p>
      </section>
    `;
  },

  bindRegisterHandler(handler) {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      handler({ name, email, password });
    });
  },

  showMessage(msg, type = 'danger') {
    const messageEl = document.getElementById('registerMessage');
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
    const form = document.getElementById('registerForm');
    form.reset();
    const messageEl = document.getElementById('registerMessage');
    if (messageEl) messageEl.innerHTML = '';
  },

  async afterRender() {
    this.render();
    const model = authModel;
    new RegisterPresenter(this, model);
  },

  cleanup() {
    console.log('RegisterView: Cleaning up.');
  }
};

export default RegisterView;
