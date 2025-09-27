class WishlistManager {
  constructor() {
    this.storageKey = 'shopify_wishlist';
    this.wishlist = this.loadWishlist();
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateWishlistUI();
    this.updateHeaderIcon();
  }

  loadWishlist() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading wishlist:', error);
      return [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.wishlist));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }

  addToWishlist(productId, productData = {}) {
    if (!this.isInWishlist(productId)) {
      this.wishlist.push({
        id: productId,
        addedAt: new Date().toISOString(),
        ...productData
      });
      this.saveWishlist();
      this.updateWishlistUI();
      this.updateHeaderIcon();
      this.showNotification('Added to wishlist', 'success');
    }
  }

  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    this.saveWishlist();
    this.updateWishlistUI();
    this.updateHeaderIcon();
    this.showNotification('Removed from wishlist', 'info');
  }

  toggleWishlist(productId, productData = {}) {
    if (this.isInWishlist(productId)) {
      this.removeFromWishlist(productId);
    } else {
      this.addToWishlist(productId, productData);
    }
  }

  isInWishlist(productId) {
    return this.wishlist.some(item => item.id === productId);
  }

  getWishlistCount() {
    return this.wishlist.length;
  }

  getWishlist() {
    return this.wishlist;
  }

  clearWishlist() {
    this.wishlist = [];
    this.saveWishlist();
    this.updateWishlistUI();
    this.updateHeaderIcon();
  }

  bindEvents() {
    // Bind wishlist button events
    document.addEventListener('click', (e) => {
      const wishlistBtn = e.target.closest('[data-wishlist-action]');
      if (wishlistBtn) {
        e.preventDefault();
        const productId = wishlistBtn.dataset.productId;
        const productData = this.getProductData(wishlistBtn);
        this.toggleWishlist(productId, productData);
      }
    });

    // Listen for storage changes (for cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.wishlist = this.loadWishlist();
        this.updateWishlistUI();
        this.updateHeaderIcon();
      }
    });
  }

  getProductData(button) {
    // Try to get product data from the page
    const productInfo = document.querySelector('product-info');
    if (productInfo) {
      const productId = productInfo.dataset.productId;
      const productTitle = document.querySelector('.product__title h1, .product__title h2')?.textContent?.trim();
      const productPrice = document.querySelector('.price--large .price-item--regular, .price--large .price-item--sale')?.textContent?.trim();
      const productImage = document.querySelector('.product__media img')?.src;
      
      return {
        title: productTitle || 'Product',
        price: productPrice || '',
        image: productImage || '',
        url: window.location.pathname
      };
    }
    return {};
  }

  updateWishlistUI() {
    // Update all wishlist buttons on the page
    document.querySelectorAll('[data-wishlist-action]').forEach(button => {
      const productId = button.dataset.productId;
      const isInWishlist = this.isInWishlist(productId);
      
      button.setAttribute('data-wishlist-added', isInWishlist);
      button.setAttribute('aria-label', isInWishlist ? 'Remove from wishlist' : 'Add to wishlist');
      
      // Update button text if it exists
      const buttonText = button.querySelector('.button__text');
      if (buttonText) {
        buttonText.textContent = isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
      }
    });
  }

  updateHeaderIcon() {
    const count = this.getWishlistCount();
    const headerIcon = document.querySelector('.wishlist-icon');
    const countBadge = document.querySelector('.wishlist-count');
    
    if (headerIcon) {
      headerIcon.setAttribute('data-count', count);
    }
    
    if (countBadge) {
      countBadge.textContent = count;
      countBadge.style.display = count > 0 ? 'block' : 'none';
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `wishlist-notification wishlist-notification--${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('wishlist-notification--show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('wishlist-notification--show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Public API methods
  static getInstance() {
    if (!WishlistManager.instance) {
      WishlistManager.instance = new WishlistManager();
    }
    return WishlistManager.instance;
  }
}

// Initialize wishlist when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.wishlistManager = WishlistManager.getInstance();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WishlistManager;
}