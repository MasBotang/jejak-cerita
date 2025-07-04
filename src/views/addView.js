import AddPresenter from '../presenters/addPresenter.js';
import storyApi from '../model/storyApi.js';

const AddView = {
  _capturedPhotoBlob: null,
  _videoStream: null, // Properti untuk menyimpan stream video
  _mapInstance: null,
  _mapMarker: null,

  render() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <main id="mainContent" tabindex="-1">
        <section class="container py-5">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <div class="card shadow-lg border-0 rounded-4">
                <div class="card-body p-5">
                  <h2 class="text-center fw-bold mb-4 text-success">Tambah Cerita Baru</h2>
                  
                  <form id="storyForm" class="needs-validation" novalidate>
                    <div class="mb-4">
                      <label for="description" class="form-label fw-semibold">📝 Deskripsi Cerita</label>
                      <textarea id="description" class="form-control" rows="4" placeholder="Tulis cerita kamu di sini..." required></textarea>
                    </div>

                    <div class="mb-4">
                      <label class="form-label fw-semibold">📷 Ambil Foto dari Kamera</label>
                      <div class="rounded border p-2">
                        <video id="cameraStream" autoplay playsinline class="w-100 rounded mb-2" style="max-height: 300px;"></video>
                        <div class="d-flex gap-2 mb-2">
                          <button type="button" class="btn btn-outline-success w-100" id="startCameraBtn">🎥 Aktifkan Kamera</button>
                          <button type="button" class="btn btn-outline-danger w-100" id="stopCameraBtn">🛑 Matikan Kamera</button>
                        </div>
                        <button type="button" class="btn btn-outline-primary w-100" id="captureBtn">📸 Ambil Gambar</button>
                        <img id="photoPreview" class="img-fluid rounded mt-3 d-none" alt="Preview foto hasil tangkapan">
                        <canvas id="photoCanvas" style="display:none;"></canvas>
                      </div>
                    </div>

                    <div class="mb-4">
                      <label class="form-label fw-semibold">📍 Pilih Lokasi di Peta</label>
                      <div id="map" class="rounded shadow-sm" style="height: 300px;"></div>
                      <input type="hidden" id="lat" required />
                      <input type="hidden" id="lon" required />
                    </div>

                    <div class="d-grid">
                      <button type="submit" class="btn btn-success btn-lg rounded-pill">🚀 Kirim Cerita</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  },

  initMap(callback) {
    if (this._mapInstance) {
      this._mapInstance.remove();
    }
    this._mapInstance = L.map('map').setView([-6.2, 106.8], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this._mapInstance);

    this._mapInstance.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (this._mapMarker) this._mapMarker.setLatLng(e.latlng);
      else this._mapMarker = L.marker(e.latlng).addTo(this._mapInstance);
      callback(lat, lng);
    });
  },

  showLoading() {
  const existingLoading = document.getElementById('loadingOverlay');
  if (!existingLoading) {
    const container = document.getElementById('app');
    container.innerHTML += `
      <div id="loadingOverlay" class="overlay d-flex justify-content-center align-items-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }
},

  hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  },

  async startCamera() {
    this.stopCamera(); 
    this._videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('cameraStream');
    video.srcObject = this._videoStream;
  },

  stopCamera() {
    const video = document.getElementById('cameraStream');
    if (this._videoStream) {
      this._videoStream.getTracks().forEach(track => track.stop());
      video.srcObject = null; // Penting untuk mengosongkan srcObject
      this._videoStream = null;
    }
  },

  captureImage() {
    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('photoCanvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight); // Gunakan width/height video

    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg');
    });
  },

  setPreview(blobURL) {
    const preview = document.getElementById('photoPreview');
    preview.src = blobURL;
    preview.classList.remove('d-none');
  },

  getCapturedPhotoBlob() {
    return this._capturedPhotoBlob;
  },

  setCapturedPhotoBlob(blob) {
    this._capturedPhotoBlob = blob;
  },

  updateLatLon(lat, lon) {
    document.getElementById('lat').value = lat;
    document.getElementById('lon').value = lon;
  },

  onStartCamera(callback) {
    const btn = document.getElementById('startCameraBtn');
    if (btn) btn.addEventListener('click', callback);
  },

  onStopCamera(callback) {
    const btn = document.getElementById('stopCameraBtn');
    if (btn) btn.addEventListener('click', callback);
  },

  onCapture(callback) {
    document.getElementById('captureBtn').addEventListener('click', async () => {
      const blob = await this.captureImage();
      const previewURL = URL.createObjectURL(blob);
      this.setPreview(previewURL);
      this.setCapturedPhotoBlob(blob);
      // Panggil callback setelah semua proses selesai dan blob sudah diset
      if (callback) callback(blob); 
    });
  },

  onSubmit(callback) {
    document.getElementById('storyForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const description = document.getElementById('description').value.trim();
      const lat = document.getElementById('lat').value;
      const lon = document.getElementById('lon').value;
      const photo = this.getCapturedPhotoBlob();

      callback({
        description,
        photo,
        lat,
        lon,
      });
    });
  },

  showError(message) {
    alert(`❌ ${message}`);
  },

  showSuccess(message) {
    alert(`✅ ${message}`);
  },

  resetForm() {
    document.getElementById('storyForm').reset();
    document.getElementById('photoPreview').classList.add('d-none');
    this.setCapturedPhotoBlob(null);
    this.stopCamera(); // Pastikan kamera dimatikan saat form direset

    if (this._mapInstance) {
      this._mapInstance.remove();
      this._mapInstance = null;
      this._mapMarker = null;
    }
  },

  // === Tambahkan metode cleanup ini ===
  cleanup() {
    console.log('AddView: Cleaning up, stopping camera if active.'); // Untuk debug
    this.stopCamera();
    if (this._mapInstance) { // Juga bersihkan map
      this._mapInstance.remove();
      this._mapInstance = null;
      this._mapMarker = null;
    }
    // Hapus event listener jika perlu, tapi untuk saat ini stopCamera sudah cukup
  },

  async afterRender() {
    // this.render(); // render() sudah dipanggil oleh router.js, tidak perlu di sini
    const model = storyApi;
    new AddPresenter(this, model); 
  }
};

export default AddView;