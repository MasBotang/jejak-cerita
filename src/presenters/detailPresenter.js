class DetailPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.storyId = null;
  }

  async loadStory(id) {
    this.storyId = id;
    this._showLoadingState();
    try {
      const { story, isOffline } = await this.model.getStoryById(id);
      
      this.view.displayStory(story);
      console.log(`[DetailPresenter] Cerita dengan ID ${id} berhasil dimuat.`);
      
      this._handleOffline(isOffline);

    } catch (error) {
      this._handleError(error);
    } finally {
      this._hideLoadingState();
    }
  }

  _showLoadingState() {
    this.view.showLoading();
  }

  _hideLoadingState() {
    this.view.hideLoading();
  }

  _handleOffline(isOffline) {
    if (isOffline) {
      this.view.showMessage('Anda sedang offline. Menampilkan cerita dari penyimpanan lokal.', 'info');
      console.log('[DetailPresenter] Cerita dimuat dari penyimpanan lokal.');
    }
  }

  _handleError(error) {
    console.error(`[DetailPresenter] Gagal memuat cerita ID ${this.storyId}:`, error);
    const errorMessage = error.message || 'Gagal memuat cerita. Periksa koneksi internet Anda atau coba lagi nanti.';
    this.view.showError(errorMessage);
  }
}

export default DetailPresenter;
