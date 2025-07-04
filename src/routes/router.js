import authModel from '../model/authModel.js';
import Navbar from '../utils/navbar.js';

import HomeView from '../views/homeView.js';
import AddView from '../views/addView.js'; 
import DetailView from '../views/detailView.js';
import LoginView from '../views/loginView.js';
import RegisterView from '../views/registerView.js';

const routes = {
  '/': HomeView,
  '/tambah': AddView,
  '/detail': DetailView,
  '/login': LoginView,
  '/register': RegisterView,
};

let currentViewInstance = null;

const safeViewTransition = async (callback) => {
  if (document.startViewTransition) {
    await document.startViewTransition(callback);
  } else {
    await callback();
  }
};

const router = async () => {
  const hash = location.hash.slice(1) || '/';
  const routeKey = hash.split('?')[0];
  let targetView = routes[routeKey];

  const publicRoutes = ['/login', '/register'];
  const token = authModel.getToken();

  if (!token && !publicRoutes.includes(routeKey)) {
    location.hash = '/login';
    return;
  }

  await safeViewTransition(async () => {
    const appContainer = document.getElementById('app');

    if (!appContainer) {
      return; 
    }

    // === PENTING: Panggil cleanup() pada view sebelumnya jika ada ===
    if (currentViewInstance && typeof currentViewInstance.cleanup === 'function') {
      currentViewInstance.cleanup();
    }
    // =============================================================

    if (targetView && typeof targetView.render === 'function') {
      // Set currentViewInstance ke view yang baru akan di-render
      currentViewInstance = targetView; 
      
      targetView.render(); // Render view baru

      if (typeof targetView.afterRender === 'function') {
        try {
          await targetView.afterRender();
        } catch (error) {
          console.error('Error during View afterRender:', error);
          appContainer.innerHTML = `<div class="container mt-5"><div class="alert alert-danger text-center">Terjadi kesalahan saat memuat halaman: ${error.message}</div></div>`;
        }
      }
    } else {
      currentViewInstance = null; // Reset jika halaman tidak ditemukan
      appContainer.innerHTML = `
        <div class="container mt-5">
          <div class="alert alert-warning text-center">Halaman tidak ditemukan</div>
        </div>
      `;
    }

    if (Navbar && typeof Navbar.render === 'function') {
      Navbar.render();
    }
  });
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

export default router;