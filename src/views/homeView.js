import HomePresenter from '../presenters/homePresenter.js';
import storyApi from '../model/storyApi.js';

const HomeView = {
  render(stories = []) {
    const container = document.getElementById('app');
    container.innerHTML = `
      <section class="container pb-5">
        <div class="row mb-4 mt-5">
          <div class="col-md-12">
            <div class="input-group">
              <input type="text" id="searchInput" class="form-control shadow-sm p-2" placeholder="🔍 Cari Cerita..." aria-label="Cari cerita">
            </div>
          </div>
        </div>
        
        <div id="storiesContainer" class="row g-4">
          ${stories.length === 0 ? this.noStoriesMessage() : ''}
        </div>
      </section>
    `;

    this.renderStories(stories);
    
    // Langsung inisialisasi tombol setelah render - tanpa setTimeout
    this.initNotificationButtons();
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
          <div class="mt-auto pt-3">
            <div class="d-flex flex-column gap-2">
              <a href="#/detail?id=${story.id}" class="btn btn-outline-success fw-bold">Lihat Detail</a>
              <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm subscribeBtn" data-story-id="${story.id}">🔔 Subscribe</button>
                <button class="btn btn-outline-secondary btn-sm unsubscribeBtn" data-story-id="${story.id}">🚫 Unsubscribe</button>
              </div>
            </div>
          </div>
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
  
  initNotificationButtons() {
    console.log('🔧 Inisialisasi tombol notifikasi...');
    
    // Gunakan class selector karena sekarang ada multiple tombol
    const subscribeButtons = document.querySelectorAll('.subscribeBtn');
    const unsubscribeButtons = document.querySelectorAll('.unsubscribeBtn');

    console.log('🔍 Subscribe buttons found:', subscribeButtons.length);
    console.log('🔍 Unsubscribe buttons found:', unsubscribeButtons.length);

    if (subscribeButtons.length === 0 || unsubscribeButtons.length === 0) {
      console.error('❌ Tombol subscribe/unsubscribe tidak ditemukan di DOM!');
      return;
    }

    console.log('✅ Tombol notifikasi berhasil ditemukan');

    // ✅ Event listeners untuk semua tombol Subscribe
    subscribeButtons.forEach((subscribeBtn) => {
      subscribeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const storyId = subscribeBtn.getAttribute('data-story-id');
        console.log('🔔 Subscribe button clicked for story:', storyId);
        
        try {
          // Cek apakah browser mendukung service worker dan push notification
          if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            this.showMessage('Browser tidak mendukung push notification.', 'warning');
            return;
          }

          // Request permission untuk notifikasi
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            this.showMessage('Permission untuk notifikasi ditolak.', 'danger');
            return;
          }

          // Import fungsi dari main.js
          const { subscribeUserForPush } = await import('../main.js');
          await subscribeUserForPush();
          
          this.showMessage(`Berhasil subscribe notifikasi untuk cerita: ${storyId}!`, 'success');
          
          // Disable tombol subscribe dan enable tombol unsubscribe
          subscribeBtn.disabled = true;
          subscribeBtn.textContent = '✅ Subscribed';
          
        } catch (err) {
          console.error('Gagal subscribe:', err);
          this.showMessage('Gagal subscribe notifikasi: ' + err.message, 'danger');
        }
      });
    });

    // ✅ Event listeners untuk semua tombol Unsubscribe
    unsubscribeButtons.forEach((unsubscribeBtn) => {
      unsubscribeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const storyId = unsubscribeBtn.getAttribute('data-story-id');
        console.log('🚫 Unsubscribe button clicked for story:', storyId);
        
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              const success = await subscription.unsubscribe();
              if (success) {
                this.showMessage(`Berhasil unsubscribe notifikasi untuk cerita: ${storyId}.`, 'warning');
                console.log('Berhasil unsubscribe dari PushManager');
                
                // Re-enable tombol subscribe
                const correspondingSubscribeBtn = document.querySelector(`.subscribeBtn[data-story-id="${storyId}"]`);
                if (correspondingSubscribeBtn) {
                  correspondingSubscribeBtn.disabled = false;
                  correspondingSubscribeBtn.textContent = '🔔 Subscribe';
                }
                
              } else {
                this.showMessage('Gagal unsubscribe notifikasi.', 'danger');
              }
            } else {
              this.showMessage('Kamu belum berlangganan notifikasi.', 'info');
            }
          } catch (err) {
            console.error('Unsubscribe error:', err);
            this.showMessage('Terjadi kesalahan saat unsubscribe.', 'danger');
          }
        } else {
          this.showMessage('Browser tidak mendukung service worker.', 'warning');
        }
      });
    });

    console.log('✅ Event listeners berhasil dipasang pada semua tombol notifikasi');
  }
};

export default HomeView;
