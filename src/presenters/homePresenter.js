import { addStory, getAllStories } from '../utils/indexeddB.js';

class HomePresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this._initialStories = [];

    this._init();
  }

  async _init() {
    this.view.showLoading(); 
    let stories = [];

    try {
      // Try to fetch stories from the API
      stories = await this._fetchStoriesFromAPI();
      console.log('[HomePresenter] Cerita berhasil dimuat dari API.');

      await this._saveStoriesToIndexedDB(stories);

    } catch (apiError) {
      console.error('[HomePresenter] Gagal memuat cerita dari API, mencoba dari IndexedDB:', apiError);
      
      stories = await this._fetchStoriesFromIndexedDB();
    } finally {
      this.view.hideLoading(); 
    }

    this._renderStories(stories);
  }

  async _fetchStoriesFromAPI() {
    try {
      const stories = await this.model.getStories();
      return stories;
    } catch (apiError) {
      throw new Error('API tidak tersedia, coba lagi nanti.');
    }
  }

  async _saveStoriesToIndexedDB(stories) {
    try {
      for (const story of stories) {
        await addStory(story);
      }
      console.log('[HomePresenter] Cerita berhasil disimpan ke IndexedDB.');
    } catch (error) {
      console.error('[HomePresenter] Gagal menyimpan cerita ke IndexedDB:', error);
    }
  }

  async _fetchStoriesFromIndexedDB() {
    let stories = [];
    try {
      stories = await getAllStories();
      if (stories.length > 0) {
        this.view.showMessage('Anda sedang offline. Menampilkan cerita dari penyimpanan lokal.', 'info');
        console.log('[HomePresenter] Cerita berhasil dimuat dari IndexedDB (offline).');
      } else {
        this.view.showError('Tidak ada cerita yang tersedia, baik online maupun offline.');
        console.log('[HomePresenter] Tidak ada cerita di IndexedDB.');
      }
    } catch (indexedDBError) {
      console.error('[HomePresenter] Gagal memuat cerita dari IndexedDB:', indexedDBError);
      this.view.showError('Gagal memuat cerita. Silakan cek koneksi internet Anda atau coba lagi nanti.');
    }
    return stories;
  }

  _renderStories(stories) {
    this._initialStories = stories;
    this.view.render(stories);
    this._bindEvents();
  }

  _bindEvents() {
    this.view.bindSearchInput(this._handleSearchInput.bind(this));
  }

  _handleSearchInput(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    const filteredStories = this._initialStories.filter((story) =>
      story.name.toLowerCase().includes(lowerKeyword) ||
      story.description.toLowerCase().includes(lowerKeyword)
    );

    this.view.renderStories(filteredStories);
  }
}

export default HomePresenter;
