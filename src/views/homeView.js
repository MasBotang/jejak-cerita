import HomePresenter from '../presenters/homePresenter.js';
import storyApi from '../model/storyApi.js';

const HomeView = {
  render(stories = []) {
    const container = document.getElementById('app');
    container.innerHTML = `
      <section class="container pb-5">
        <div class="input-group mb-4 w-50 ms-auto">
          <input type="text" id="searchInput" class="form-control shadow-sm p-2 mt-5 mb-3" placeholder="🔍 Cari Cerita..." aria-label="Cari cerita">
        </div>
        <div id="storiesContainer" class="row g-4">
          ${stories.length === 0 ? this.noStoriesMessage() : ''}
        </div>
      </section>
    `;

    this.renderStories(stories);
  },

  noStoriesMessage() {
    return `
      <div class="col-12">
        <div class="alert alert-warning text-center shadow-sm" role="alert">
          Belum ada cerita yang tersedia.
        </div>
      </div>
    `;
  },

  renderStories(stories) {
    const listEl = document.getElementById('storiesContainer');
    if (!listEl) return;

    listEl.innerHTML = '';

    stories.forEach((story) => {
      const card = this.createStoryCard(story);
      listEl.appendChild(card);
    });
  },

  createStoryCard(story) {
    const mapId = `map-${story.id}`;
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';

    card.innerHTML = `
      <div class="card h-100 shadow-lg border-0 rounded-4 overflow-hidden">
        <img src="${story.photoUrl}" class="card-img-top object-fit-cover" style="height: 200px;" alt="Foto oleh ${story.name}" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title fw-semibold">${story.name}</h5>
          <p class="card-text text-muted mb-2">${story.description.slice(0, 100)}...</p>
          <p class="text-secondary small">📍 ${story.lat ?? '-'}, ${story.lon ?? '-'}</p>
          ${story.lat && story.lon ? `<div id="${mapId}" class="mt-2 rounded shadow-sm" style="height: 200px;"></div>` : ''}
          <a href="#/detail?id=${story.id}" class="btn btn-outline-success mt-5 w-50 fw-bold ms-auto">Lihat Detail</a>
        </div>
      </div>
    `;

    if (story.lat && story.lon) {
      this.initMap(mapId, story.lat, story.lon, story.name, story.description);
    }

    return card;
  },

  initMap(mapId, lat, lon, name, description) {
    setTimeout(() => {
      const mapElement = document.getElementById(mapId);
      if (mapElement) {
        const map = L.map(mapId).setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`<b>${name}</b><br>${description}`);
      }
    }, 0);
  },

  showLoading() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <section class="container d-flex justify-content-center align-items-center" style="min-height: 80vh;">
        <div class="spinner-border text-primary" role="status" aria-label="Memuat cerita...">
          <span class="visually-hidden">Memuat cerita...</span>
        </div>
        <p class="ms-3">Memuat cerita...</p>
      </section>
    `;
  },
  
  hideLoading() {
    const container = document.getElementById('app');
    container.innerHTML = '';
  },


  showError(message) {
    const container = document.getElementById('app');
    container.innerHTML = `
      <section class="container mt-5">
        <div class="alert alert-danger text-center shadow-sm" role="alert">
          Gagal memuat cerita: ${message || 'Terjadi kesalahan tidak dikenal.'}
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

  bindSearchInput(handler) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        handler(e.target.value);
      });
    }
  },

  async afterRender() {
    const model = storyApi;
    new HomePresenter(this, model);
  },
};

export default HomeView;
