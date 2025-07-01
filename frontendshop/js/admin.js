$(function() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'admin') {
    // Not admin, redirect to home
    window.location.href = 'home.html';
    return;
  }
  // Logout (if you want to add a logout button, you can add an id to a button in the HTML and use this code)
  $(document).on('click', '#logoutBtn', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
  // View Profile
  $(document).on('click', '#viewProfileBtn', function(e) {
    e.preventDefault();
    window.location.href = 'profile.html';
  });
}); 