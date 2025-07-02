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

  // Load products
  $.get('http://localhost:4000/api/v1/products', function(products) {
    renderProductGrid(products);
  }).fail(function() {
    $('#productList').html('<div class="alert alert-danger">Failed to load products.</div>');
  });

  // Render product grid
  function renderProductGrid(products) {
    let html = '<div class="row">';
    products.forEach(product => {
      html += `
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" class="card-img-top" alt="${product.name}" style="height:200px;object-fit:cover;">
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
      url: 'http://localhost:4000/api/v1/create-order',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ cart, total }),
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
      success: function(res) {
        alert('Order placed successfully!');
        localStorage.removeItem('cart');
        // Reload products to show updated stock
        $.get('http://localhost:4000/api/v1/products', function(products) {
          renderProductGrid(products);
        });
      },
      error: function(xhr) {
        alert('Order failed: ' + (xhr.responseJSON?.error || xhr.statusText));
      }
    });
  });

  // TODO: Add edit/delete product logic for admin
}); 