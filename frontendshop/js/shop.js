$(function() {
  // Require authentication - redirect to login if not authenticated
  if (!Auth.requireAuth()) {
    return; // Stop execution if not authenticated
  }

  const user = Auth.getUser();
  
  // Show admin controls if user is admin
  if (user.role === 'admin') {
    $('.admin-only').show();
  }

  // Update navigation
  Auth.updateNavigation();

  // Pagination variables
  let allProducts = [];
  let currentPage = 1;
  let itemsPerPage = 9;
  let totalPages = 1;
  let currentMode = 'pagination'; // 'pagination' or 'infinite'
  
  // Infinite scroll variables
  let infinitePage = 1;
  let infiniteItemsPerPage = 9;
  let isLoading = false;
  let hasMoreProducts = true;

  // Helper for backend URL
  const BACKEND_URL = 'http://localhost:4000';

  // Load all products
  function loadAllProducts() {
    $.get(BACKEND_URL + '/api/v1/products', function(products) {
      allProducts = products;
      if (currentMode === 'pagination') {
        renderPagination();
      } else {
        resetInfiniteScroll();
        loadInfiniteProducts();
      }
    }).fail(function() {
      $('#productList').html('<div class="alert alert-danger">Failed to load products.</div>');
    });
  }

  // Initialize
  loadAllProducts();

  // Toggle between pagination and infinite scroll
  $('#toggleInfiniteScroll').on('click', function() {
    if (currentMode === 'pagination') {
      switchToInfiniteScroll();
    } else {
      switchToPagination();
    }
  });

  function switchToInfiniteScroll() {
    currentMode = 'infinite';
    $('#toggleInfiniteScroll').html('<i class="bi bi-list-ul"></i> Switch to Pagination');
    $('.pagination-info').parent().hide();
    $('#paginationControls').parent().hide();
    $('#itemsPerPage').parent().hide();
    resetInfiniteScroll();
    loadInfiniteProducts();
  }

  function switchToPagination() {
    currentMode = 'pagination';
    $('#toggleInfiniteScroll').html('<i class="bi bi-arrow-down-circle"></i> Switch to Infinite Scroll');
    $('.pagination-info').parent().show();
    $('#paginationControls').parent().show();
    $('#itemsPerPage').parent().show();
    renderPagination();
  }

  // Pagination functionality
  function renderPagination() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = allProducts.slice(startIndex, endIndex);
    
    totalPages = Math.ceil(allProducts.length / itemsPerPage);
    
    // Update pagination info
    $('#startRecord').text(allProducts.length > 0 ? startIndex + 1 : 0);
    $('#endRecord').text(Math.min(endIndex, allProducts.length));
    $('#totalRecords').text(allProducts.length);
    
    // Render products
    renderProductGrid(pageProducts);
    
    // Render pagination controls
    renderPaginationControls();
  }

  function renderPaginationControls() {
    let controls = '';
    
    // First page
    controls += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="1"><i class="bi bi-chevron-double-left"></i></a>
    </li>`;
    
    // Previous page
    controls += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}"><i class="bi bi-chevron-left"></i></a>
    </li>`;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      controls += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    }
    
    // Next page
    controls += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}"><i class="bi bi-chevron-right"></i></a>
    </li>`;
    
    // Last page
    controls += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${totalPages}"><i class="bi bi-chevron-double-right"></i></a>
    </li>`;
    
    $('#paginationControls').html(controls);
  }

  // Pagination click handlers
  $(document).on('click', '#paginationControls .page-link', function(e) {
    e.preventDefault();
    const page = parseInt($(this).data('page'));
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      currentPage = page;
      renderPagination();
      // Scroll to top of product list
      $('html, body').animate({ scrollTop: $('#productList').offset().top - 100 }, 500);
    }
  });

  // Items per page change
  $('#itemsPerPage').on('change', function() {
    itemsPerPage = parseInt($(this).val());
    currentPage = 1;
    renderPagination();
  });

  // Infinite scroll functionality
  function resetInfiniteScroll() {
    infinitePage = 1;
    isLoading = false;
    hasMoreProducts = true;
    $('#productList').empty();
    $('#infiniteLoadingIndicator').hide();
    $('#noMoreProducts').hide();
  }

  function loadInfiniteProducts() {
    if (isLoading || !hasMoreProducts) return;
    
    isLoading = true;
    $('#infiniteLoadingIndicator').show();
    
    // Simulate pagination by slicing the allProducts array
    const startIndex = (infinitePage - 1) * infiniteItemsPerPage;
    const endIndex = startIndex + infiniteItemsPerPage;
    const pageProducts = allProducts.slice(startIndex, endIndex);
    
    // Simulate API delay
    setTimeout(() => {
      if (pageProducts.length > 0) {
        // Append products to existing grid
        const productHtml = pageProducts.map(product => `
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <img src="${product.image ? (BACKEND_URL + '/' + product.image) : 'no-image.png'}" class="card-img-top" alt="${product.name}" style="height:200px;object-fit:cover;">
              <div class="card-body d-flex flex-column">
                <h5 class="product-title">${product.name}</h5>
                <div class="text-secondary mb-1" style="font-size:0.98em;"><i class="bi bi-tags"></i> ${product.category || ''}</div>
                <span class="badge bg-secondary mb-2 d-block">Stock: ${product.stock}</span>
                <p class="card-text text-muted mb-2" style="min-height:40px;">${product.specs || ''}</p>
                <div class="mt-auto">
                  <span class="product-price mb-2 d-block">$${product.price}</span>
                  <button class="btn btn-primary addToCartBtn" data-id="${product.id}"><i class="bi bi-cart-plus"></i> Add to Cart</button>
                </div>
              </div>
            </div>
          </div>
        `).join('');
        
        $('#productList').append(productHtml);
        infinitePage++;
        hasMoreProducts = endIndex < allProducts.length;
      } else {
        hasMoreProducts = false;
      }
      
      isLoading = false;
      $('#infiniteLoadingIndicator').hide();
      
      if (!hasMoreProducts) {
        $('#noMoreProducts').show();
      }
    }, 500);
  }

  // Infinite scroll detection
  $(window).on('scroll', function() {
    if (currentMode !== 'infinite') return;
    
    const scrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();
    const documentHeight = $(document).height();
    
    if (scrollTop + windowHeight >= documentHeight - 200) { // Load when 200px from bottom
      loadInfiniteProducts();
    }
  });

  // Render product grid (for pagination mode)
  function renderProductGrid(products) {
    let html = '<div class="row">';
    products.forEach(product => {
      html += `
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <img src="${product.image ? (BACKEND_URL + '/' + product.image) : 'no-image.png'}" class="card-img-top" alt="${product.name}" style="height:200px;object-fit:cover;">
            <div class="card-body d-flex flex-column">
              <h5 class="product-title">${product.name}</h5>
              <div class="text-secondary mb-1" style="font-size:0.98em;"><i class="bi bi-tags"></i> ${product.category || ''}</div>
              <span class="badge bg-secondary mb-2 d-block">Stock: ${product.stock}</span>
              <p class="card-text text-muted mb-2" style="min-height:40px;">${product.specs || ''}</p>
              <div class="mt-auto">
                <span class="product-price mb-2 d-block">$${product.price}</span>
                <button class="btn btn-primary addToCartBtn" data-id="${product.id}"><i class="bi bi-cart-plus"></i> Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    $('#productList').html(html);
  }

  // Add to Cart
  $(document).on('click', '.addToCartBtn', function() {
    const id = $(this).data('id');
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  });

  // Place Order (example logic, adjust as needed)
  $(document).on('submit', '#checkoutForm', function(e) {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.length) return alert('Your cart is empty!');
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    $.ajax({
      url: BACKEND_URL + '/api/v1/create-order',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ cart, total }),
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
      success: function(res) {
        alert('Order placed successfully!');
        localStorage.removeItem('cart');
        // Reload products to show updated stock
        loadAllProducts();
      },
      error: function(xhr) {
        alert('Order failed: ' + (xhr.responseJSON?.error || xhr.statusText));
      }
    });
  });

  // --- Category Filter ---
  function loadCategories() {
    $.get(BACKEND_URL + '/api/v1/categories', function(categories) {
      const options = ['<option value="">All Categories</option>']
        .concat(categories.map(c => `<option value="${c.id}">${c.name}</option>`));
      $('#categoryFilter').html(options.join(''));
    });
  }
  loadCategories();

  // --- Autocomplete Search ---
  let searchTimeout = null;
  $('#productSearch').on('input', function() {
    const query = $(this).val().trim();
    const category = $('#categoryFilter').val();
    clearTimeout(searchTimeout);
    if (!query) {
      $('#searchSuggestions').empty().hide();
      if (category) {
        // Filter all products by category only
        $.get(BACKEND_URL + '/api/v1/products/search?category=' + encodeURIComponent(category), function(products) {
          renderProductGrid(products);
        });
      } else {
        loadAllProducts();
      }
      return;
    }
    searchTimeout = setTimeout(function() {
      $.get(BACKEND_URL + '/api/v1/products/search?q=' + encodeURIComponent(query) + (category ? ('&category=' + encodeURIComponent(category)) : ''), function(products) {
        if (products.length === 0) {
          $('#searchSuggestions').html('<div class="list-group-item">No results</div>').show();
          return;
        }
        const suggestions = products.map(p => `<button type="button" class="list-group-item list-group-item-action" data-id="${p.id}">${p.name}</button>`).join('');
        $('#searchSuggestions').html(suggestions).show();
      });
    }, 200);
  });

  // Category filter change
  $('#categoryFilter').on('change', function() {
    const query = $('#productSearch').val().trim();
    const category = $(this).val();
    if (query) {
      // Trigger search with current query and new category
      $('#productSearch').trigger('input');
    } else if (category) {
      // Filter all products by category only
      $.get(BACKEND_URL + '/api/v1/products/search?category=' + encodeURIComponent(category), function(products) {
        renderProductGrid(products);
      });
    } else {
      loadAllProducts();
    }
  });

  // Handle suggestion click
  $(document).on('click', '#searchSuggestions .list-group-item', function() {
    const id = $(this).data('id');
    $('#searchSuggestions').empty().hide();
    $('#productSearch').val($(this).text());
    // Fetch and show only the selected product
    $.get(BACKEND_URL + '/api/v1/products/' + id, function(product) {
      renderProductGrid([product]);
      // Hide pagination and infinite scroll controls
      $('#paginationControls').parent().hide();
      $('#toggleInfiniteScroll').hide();
      $('.pagination-info').parent().hide();
    });
  });

  // Hide suggestions on blur (with delay for click)
  $('#productSearch').on('blur', function() {
    setTimeout(function() { $('#searchSuggestions').empty().hide(); }, 200);
  });

  // Show all products and controls if search is cleared
  $('#productSearch').on('input', function() {
    if (!$(this).val().trim()) {
      $('#paginationControls').parent().show();
      $('#toggleInfiniteScroll').show();
      $('.pagination-info').parent().show();
    }
  });

  // --- End Autocomplete Search ---
}); 