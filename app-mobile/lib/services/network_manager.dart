/**
 * Network state management for offline support
 * Queues requests when offline and retries when connection is restored
 */
class NetworkManager {
  constructor() {
    this.isOnline = true;
    this.requestQueue = [];
    this.listeners = [];
  }

  init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnline(true));
      window.addEventListener('offline', () => this.setOnline(false));
    }
  }

  setOnline(status) {
    this.isOnline = status;
    this.notifyListeners(status);

    if (status && this.requestQueue.length > 0) {
      this.processQueue();
    }
  }

  async queueRequest(request) {
    if (this.isOnline) {
      return this._executeRequest(request);
    } else {
      this.requestQueue.push(request);
      return new Promise((resolve, reject) => {
        request.resolve = resolve;
        request.reject = reject;
      });
    }
  }

  async _executeRequest(request) {
    try {
      const response = await fetch(request.url, request.options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async processQueue() {
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      try {
        const result = await this._executeRequest(request);
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  onStatusChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(status) {
    this.listeners.forEach(listener => listener(status));
  }
}

export default new NetworkManager();
