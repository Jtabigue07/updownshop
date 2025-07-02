$(function() {
  // Require authentication - redirect to login if not authenticated
  if (!Auth.requireUser()) {
    return; // Stop execution if not authenticated
  }

  // Show admin link if user is admin (shouldn't happen due to requireUser above, but just in case)
  const user = Auth.getUser();
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
    return;
  }

  // Update navigation
  Auth.updateNavigation();

  // Load user-specific content
  loadUserContent();

  // Logout functionality (handled by auth.js, but keeping for compatibility)
  $('#logoutBtn').on('click', function() {
    Auth.logout();
  });

  // Load user-specific content
  function loadUserContent() {
    const user = Auth.getUser();
    if (user) {
      $('#mainContent').html(`
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <h2 class="card-title">Welcome back, ${user.name}!</h2>
                <p class="card-text">Browse our latest gadgets and deals in the shop.</p>
                <a href="shop.html" class="btn btn-primary">Go to Shop</a>
                <a href="cart.html" class="btn btn-outline-primary">View Cart</a>
                <a href="profile.html" class="btn btn-outline-secondary">My Profile</a>
              </div>
            </div>
          </div>
        </div>
      `);
    }
  }
}); 