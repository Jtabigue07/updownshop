$(function() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
    return;
  }
  // Logout
  $('#logoutBtn').on('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });

  // Load cart
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (cart.length === 0) {
    $('#cartContent').html('<div class="alert alert-info">Your cart is empty.</div>');
    return;
  }
  // Fetch product details
  $.get('http://localhost:4000/api/v1/products', function(products) {
    renderCart(cart, products);
  });

  function renderCart(cart, products) {
    let html = '<h2>Your Cart</h2><table class="table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead><tbody>';
    let grandTotal = 0;
    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;
      const total = product.price * item.qty;
      grandTotal += total;
      html += `<tr>
        <td>${product.name}</td>
        <td><input type="number" class="form-control qtyInput" data-id="${item.id}" value="${item.qty}" min="1"></td>
        <td>$${product.price}</td>
        <td>$${total.toFixed(2)}</td>
        <td><button class="btn btn-danger btn-sm removeCartBtn" data-id="${item.id}">Remove</button></td>
      </tr>`;
    });
    html += `</tbody></table><h4>Grand Total: $${grandTotal.toFixed(2)}</h4><button class="btn btn-success" id="checkoutBtn">Checkout</button>`;
    $('#cartContent').html(html);
  }

  // Update quantity
  $(document).on('change', '.qtyInput', function() {
    const id = $(this).data('id');
    const qty = parseInt($(this).val());
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(i => i.id === id);
    if (item) {
      item.qty = qty;
      localStorage.setItem('cart', JSON.stringify(cart));
      location.reload();
    }
  });

  // Remove item
  $(document).on('click', '.removeCartBtn', function() {
    const id = $(this).data('id');
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    location.reload();
  });

  // Checkout
  $(document).on('click', '#checkoutBtn', function() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) return;

    // Fetch product details to get price
    $.get('http://localhost:4000/api/v1/products', function(products) {
      let total = 0;
      const orderCart = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return null;
        total += product.price * item.qty;
        return {
          product_id: product.id,
          qty: item.qty,
          price: product.price
        };
      }).filter(Boolean);

      $.ajax({
        url: 'http://localhost:4000/api/v1/orders',
        method: 'POST',
        contentType: 'application/json',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        data: JSON.stringify({ cart: orderCart, total }),
        success: function(res) {
          localStorage.removeItem('cart');
          alert('Thank you for your purchase! Order ID: ' + res.orderId);
          location.reload();
        },
        error: function() {
          alert('Checkout failed.');
        }
      });
    });
  });
}); 