import authModel from '../model/authModel.js';

const Navbar = {
  render() {
    const menu = document.getElementById('navbar-menu');
    if (!menu) return;

    menu.innerHTML = '';

    const token = authModel.getToken();
    console.log('Token:', token);

    if (token) {
      menu.innerHTML = `
        <li class="nav-item mx-4">
          <a class="nav-link fw-medium fs-6" href="#/">Beranda</a>
        </li>
        <li class="nav-item mx-2">
          <a class="nav-link fw-medium fs-6" href="#/tambah">Tambah Cerita</a>
        </li>
        <li class="nav-item mx-2">
          <button class="btn btn-sm btn-outline-danger fw-medium" id="logoutBtn">Logout</button>
        </li>
      `;

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          console.log('Logging out...');
          authModel.logout();
          location.hash = '/login';
        });
      }

    } else {
      menu.innerHTML = `
        <li class="nav-item mx-2">
          <a class="btn btn-outline-primary fw-medium me-2" href="#/login">Login</a>
        </li>
        <li class="nav-item mx-2">
          <a class="btn btn-outline-success fw-medium" href="#/register">Daftar</a>
        </li>
      `;
    }
  }
};

export default Navbar;