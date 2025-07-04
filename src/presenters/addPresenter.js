class AddPresenter {
  constructor(view, model) {
      this.view = view;
      this.model = model;
      this._bindEvents();
      this._initializeMap();
  }

  _bindEvents() {
      this.view.onStartCamera(() => this.handleStartCamera());
      this.view.onStopCamera(() => this.handleStopCamera());
      this.view.onCapture((blob) => this.handleCapture(blob)); 
      this.view.onSubmit((data) => this.handleSubmit(data));
  }

  _initializeMap() {
      this.view.initMap((lat, lon) => this.handleMapClick(lat, lon));
  }

  async handleStartCamera() {
      try {
          await this.view.startCamera();
      } catch (err) {
          this.view.showError('Gagal mengakses kamera. Pastikan browser memiliki izin.');
      }
  }

  handleStopCamera() {
      this.view.stopCamera();
  }

  handleCapture(blob) {
      this.view.setCapturedPhotoBlob(blob);
      this.view.showSuccess('Gambar berhasil diambil!');
  }

  handleMapClick(lat, lon) {
      this.view.updateLatLon(lat, lon);
  }

  async handleSubmit({ description, photo, lat, lon }) {
    if (!photo) {
        this.view.showError('Silakan ambil gambar terlebih dahulu.');
        return;
    }
    if (!lat || !lon) {
        this.view.showError('Silakan pilih lokasi pada peta.');
        return;
    }
    if (!description || description.length < 10) {
        this.view.showError('Deskripsi cerita minimal 10 karakter.');
        return;
    }

    this.view.showLoading();

    try {
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);
        formData.append('lat', lat);
        formData.append('lon', lon);

        await this.model.addStory(formData);

        this.view.showSuccess('Cerita berhasil dikirim!');
        this.view.resetForm();
    } catch (err) {
        console.error(err);
        this.view.showError(err.message || 'Gagal mengirim cerita.');
    } finally {
        this.view.hideLoading();
        this.view.cleanup();
    }
}
}

export default AddPresenter;
