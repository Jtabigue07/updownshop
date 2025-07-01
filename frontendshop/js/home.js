$(function() {
  // Show admin link if user is admin
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
}); 