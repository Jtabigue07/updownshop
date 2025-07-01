$(function() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'admin') {
    $('#navAdmin').show();
  }
  // Logout
  $('#logoutBtn').on('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });

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
              <p class="card-text text-muted mb-2" style="min-height:40px;">${product.specs || ''}</p>
              <div class="mt-auto">
                <span class="product-price mb-2 d-block">$${product.price}</span>
                <button class="btn btn-primary addToCartBtn" data-id="${product.id}"><i class="bi bi-cart-plus"></i> Add to Cart</button>
                ${user.role === 'admin' ? `<button class="btn btn-warning ms-2 editProductBtn" data-id="${product.id}">Edit</button><button class="btn btn-danger ms-2 deleteProductBtn" data-id="${product.id}">Delete</button>` : ''}
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

  // TODO: Add edit/delete product logic for admin
}); 