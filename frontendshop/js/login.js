$(function() {
  // Auto-redirect if already logged in
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'home.html';
    }
    return; // Prevent further execution
  }

  // Login
  $('#loginForm').on('submit', function(e) {
    e.preventDefault();
    $('#result').html('');
    $.ajax({
      url: 'http://localhost:4000/api/v1/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        email: $('#email').val(),
        password: $('#password').val()
      }),
      success: function(res) {
        if (res.user && res.user.role) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          if (res.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'home.html';
          }
        } else {
          $('#result').html('<p class="error">Login succeeded, but no role found.</p>');
        }
      },
      error: function(xhr) {
        let msg = 'Login failed';
        if (xhr.responseJSON && xhr.responseJSON.message) {
          msg = xhr.responseJSON.message;
        }
        $('#result').html('<p class="error">' + msg + '</p>');
      }
    });
  });

  // Registration
  $('#registerForm').on('submit', function(e) {
    e.preventDefault();
    $('#registerResult').html('');
    $.ajax({
      url: 'http://localhost:3000/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: $('#regName').val(),
        email: $('#regEmail').val(),
        password: $('#regPassword').val(),
        role: $('#regRole').val()
      }),
      success: function(res) {
        $('#registerResult').html('<p style="color:green;">Registration successful! You can now log in.</p>');
      },
      error: function(xhr) {
        let msg = 'Registration failed';
        if (xhr.responseJSON && xhr.responseJSON.error) {
          msg = xhr.responseJSON.error;
        }
        $('#registerResult').html('<p style="color:red;">' + msg + '</p>');
      }
    });
  });

  // Profile update
  $('#updateProfileForm').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      url: 'http://localhost:4000/api/v1/update-profile',
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
      contentType: 'application/json',
      data: JSON.stringify({
        name: $('#profileName').val(),
        email: $('#profileEmail').val()
      }),
      success: function(res) {
        $('#profileResult').html('<p style="color:green;">Profile updated!</p>');
      },
      error: function() {
        $('#profileResult').html('<p style="color:red;">Update failed.</p>');
      }
    });
  });

  // View orders
  $('#viewOrdersBtn').on('click', function() {
    $.ajax({
      url: 'http://localhost:4000/api/v1/orders', // Adjust endpoint as needed
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
      success: function(res) {
        let html = '<h3>Your Orders</h3><ul>';
        if (res.orders && res.orders.length > 0) {
          res.orders.forEach(order => {
            html += `<li>Order #${order.id}: ${order.status}</li>`;
          });
        } else {
          html += '<li>No orders found.</li>';
        }
        html += '</ul>';
        $('#ordersResult').html(html);
      },
      error: function() {
        $('#ordersResult').html('<p style="color:red;">Could not fetch orders.</p>');
      }
    });
  });

  // Show/hide UI based on role
  function showRoleSections(user) {
    $('#profileSection').show();
    if (user.role === 'admin') {
      $('#adminSection').show();
      $('#userSection').hide();
    } else {
      $('#adminSection').hide();
      $('#userSection').show();
    }
  }

  // Show homepage after login
  function showHomepage(user) {
    let content = '<p>Hello, <b>' + user.name + '</b>!</p>';
    if (user.role === 'admin') {
      content += '<p>You are an <b>Admin</b>. Manage products, view orders, and more.</p>';
      content += '<nav><a href="#">Admin Dashboard</a> | <a href="#">Manage Products</a> | <a href="#">View Orders</a></nav>';
    } else {
      content += '<p>You are a <b>Customer</b>. Browse and purchase items below.</p>';
      content += '<nav><a href="#">Shop</a> | <a href="#">My Orders</a> | <a href="#">Profile</a></nav>';
    }
    $('#homepageContent').html(content);
  }

  // Logout functionality
  $(document).on('click', '#logoutBtn', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    $('#homepage').hide();
    $('#loginForm').show();
    $('#result').html('');
  });

  // Navigation handlers
  $(document).on('click', '#navShop', function(e) {
    e.preventDefault();
    loadProducts();
  });
  $(document).on('click', '#navHome', function(e) {
    e.preventDefault();
    $('#mainContent').html('<h2>Welcome to UpDownShop!</h2><p>Browse our latest gadgets and deals!</p>');
  });
  $(document).on('click', '#navCart', function(e) {
    e.preventDefault();
    $('#mainContent').html('<h2>Your Cart</h2><p>Cart functionality coming soon.</p>');
  });
  $(document).on('click', '#navProfile', function(e) {
    e.preventDefault();
    $('#mainContent').html('<h2>Your Profile</h2><p>Profile management coming soon.</p>');
  });

  // Load products and render grid
  function loadProducts() {
    $.get('http://localhost:4000/api/v1/products', function(products) {
      renderProductGrid(products);
    }).fail(function() {
      $('#mainContent').html('<div class="alert alert-danger">Failed to load products.</div>');
    });
  }

  // Render product grid
  function renderProductGrid(products) {
    let html = '<div class="row">';
    products.forEach(product => {
      html += `
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <img src="${product.image || 'https://via.placeholder.com/200'}" class="card-img-top" alt="${product.name}">
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.specs || ''}</p>
              <p class="card-text"><b>$${product.price}</b></p>
              <button class="btn btn-primary addToCartBtn" data-id="${product.id}">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    $('#mainContent').html(html);
  }

  // Optionally, load products after login
  // loadProducts();
});
