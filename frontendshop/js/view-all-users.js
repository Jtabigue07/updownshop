$(function() {
  // Require admin authentication - redirect to login if not authenticated or not admin
  if (!Auth.requireAdmin()) {
    return; // Stop execution if not authenticated or not admin
  }

  // Fetch all users
  $.ajax({
    url: 'http://localhost:4000/api/v1/users/all',
    type: 'GET',
    headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
    success: function(res) {
      const users = res.users || [];
      let rows = '';
      users.forEach(function(user) {
        const photo = user.image_path ? `<img src="http://localhost:4000/${user.image_path}" class="rounded-circle user-photo border border-2" alt="User Photo">` : `<img src="https://via.placeholder.com/60" class="rounded-circle user-photo border border-2" alt="No Photo">`;
        rows += `<tr>
          <td class="text-center">${photo}</td>
          <td>${user.fname || ''} ${user.lname || ''}</td>
          <td>${user.email || ''}</td>
          <td>${user.title || ''}</td>
          <td>${user.addressline || ''}</td>
          <td>${user.town || ''}</td>
          <td>${user.zipcode || ''}</td>
          <td>${user.phone || ''}</td>
          <td>${user.role || ''}</td>
        </tr>`;
      });
      $('#usersTable tbody').html(rows);
    },
    error: function(xhr) {
      $('#usersTable tbody').html('<tr><td colspan="9" class="text-center text-danger">Failed to load users.</td></tr>');
    }
  });
}); 