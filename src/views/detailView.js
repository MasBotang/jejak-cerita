import DetailPresenter from '../presenters/detailPresenter.js';
import storyApi from '../model/storyApi.js';

const DetailView = {
  _mapInstance: null,

  render() {
    return `
      <section id="detail-page-content" class="container my-5">
        <div class="row">
          <div class="col-md-8 offset-md-2">
            <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div class="card-body p-4 text-center">
                <p class="text-muted">Memuat detail cerita...</p>
                <div class="spinner-border text-primary" role="status" aria-label="Loading">
                  <span class="visually-hidden">Memuat...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  displayStory(story) {
    const container = document.getElementById('app');
    container.innerHTML = `
      <section class="container my-5">
        <div class="row">
          <div class="col-md-8 offset-md-2">
            <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
              <img src="${story.photoUrl}" class="card-img-top object-fit-cover" style="height: 350px;" alt="Foto oleh ${story.name}" />
              <div class="card-body p-4">
                <h2 class="card-title fw-bold mb-3">${story.name}</h2>
                <p class="card-text text-muted mb-4">${story.description}</p>
                <p class="text-secondary small mb-2">Dibuat pada: ${new Date(story.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p class="text-secondary small">📍 Lokasi: ${story.lat ?? '-'}, ${story.lon ?? '-'}</p>
                ${story.lat && story.lon ? `<div id="detailMap" class="mt-4 rounded shadow-sm" style="height: 300px;" aria-label="Peta Lokasi Cerita"></div>` : ''}
                <div class="d-flex justify-content-between align-items-center mt-4">
                  <a href="#/" class="btn btn-outline-secondary fw-bold">← Kembali</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.initMap(story.lat, story.lon);
  },

  async initMap(lat, lon) {
    if (this._mapInstance) {
      this._mapInstance.remove();
      this._mapInstance = null;
    }

    if (lat && lon) {
      try {
        this._mapInstance = L.map('detailMap').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(this._mapInstance);

        L.marker([lat, lon])
          .addTo(this._mapInstance)
          .bindPopup(`<b>${lat}, ${lon}</b>`);
      } catch (error) {
        console.error('[Map Error] ', error);
        this.showError('Gagal memuat peta.');
      }
    }
  },

  showLoading() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <section class="container d-flex justify-content-center align-items-center" style="min-height: 80vh;">
        <div class="spinner-border text-primary" role="status" aria-label="Loading">
          <span class="visually-hidden">Memuat detail cerita...</span>
        </div>
        <p class="ms-3">Memuat detail cerita...</p>
      </section>
    `;
  },
  
  hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
    console.log('[DetailView] Loading overlay removed.');
  },

  showError(message) {
    const container = document.getElementById('app');
    container.innerHTML = `
      <section class="container mt-5">
        <div class="alert alert-danger text-center shadow-sm" role="alert">
          Gagal memuat detail cerita: ${message || 'Terjadi kesalahan tidak dikenal.'}
        </div>
      </section>
    `;
  },

  showMessage(message, type = 'info') {
    const container = document.getElementById('app');
    let messageElement = document.getElementById('appMessageContainer');

    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'appMessageContainer';
      messageElement.style.position = 'fixed';
      messageElement.style.top = '10px';
      messageElement.style.right = '10px';
      messageElement.style.zIndex = '1000';
      container.appendChild(messageElement);
    }

    messageElement.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

    setTimeout(() => {
      const alert = messageElement.querySelector('.alert');
      if (alert) {
        alert.classList.remove('show');
        alert.classList.add('fade');
        alert.addEventListener('transitionend', () => alert.remove());
      }
    }, 5000);
  },

  async afterRender() {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const storyId = urlParams.get('id');

    if (storyId) {
      const model = storyApi;
      const presenter = new DetailPresenter(this, model);
      await presenter.loadStory(storyId);
    } else {
      this.showError('ID cerita tidak ditemukan di URL.');
    }
  },

  teardown() {
    if (this._mapInstance) {
      this._mapInstance.remove();
      this._mapInstance = null;
      console.log('DetailView: Peta dihapus.');
    }
  },
};

export default DetailView;
