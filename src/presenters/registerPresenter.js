class RegisterPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this._bindEvents();
  }

  _bindEvents() {
    this.view.bindRegisterHandler(this.handleRegister.bind(this));
  }

  async handleRegister({ name, email, password }) {
    try {
      if (!this._validateInputs(name, email, password)) {
        return;
      }

      await this.model.register(name, email, password);
      this.view.showMessage('Registrasi berhasil! Silakan login.', 'success');

      this.view.resetForm();
      setTimeout(() => {
        location.hash = '/login';
      }, 1000);
    } catch (err) {
      console.error('RegisterPresenter: Registrasi gagal:', err);
      this.view.showMessage(err.message || 'Registrasi gagal. Terjadi kesalahan server.');
    }
  }

  _validateInputs(name, email, password) {
    if (!name || !email || !password) {
      this.view.showMessage('Semua kolom harus diisi.');
      return false;
    }

    if (password.length < 6) {
      this.view.showMessage('Password minimal 6 karakter.');
      return false;
    }

    return true;
  }
}

export default RegisterPresenter;
