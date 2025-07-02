$(function() {
  // Require admin authentication - redirect to login if not authenticated or not admin
  if (!Auth.requireAdmin()) {
    return; // Stop execution if not authenticated or not admin
  }

  let usersTable;

  // Open modal on button click
  $('#manageUsersBtn').on('click', function() {
    $('#usersModal').modal('show');
    loadUsers();
  });

  // Load users into DataTable
  function loadUsers() {
    const token = Auth.getToken();
    console.log('JWT token:', token);
    if (!token) {
      alert('You are not logged in or your session has expired. Please log in as admin.');
      return;
    }
    $.ajax({
      url: 'http://localhost:4000/api/v1/users/all',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function(res) {
        const users = res.users || [];
        let rows = users.map(u => [
          u.id,
          u.name || '',
          u.email,
          `<select class='form-select form-select-sm userRoleSelect' data-id='${u.id}'>
            <option value='user'${u.role==='user'?' selected':''}>User</option>
            <option value='admin'${u.role==='admin'?' selected':''}>Admin</option>
          </select>`,
          `<select class='form-select form-select-sm userStatusSelect' data-id='${u.id}'>
            <option value='active'${u.deleted_at==null?' selected':''}>Active</option>
            <option value='inactive'${u.deleted_at!=null?' selected':''}>Inactive</option>
          </select>`,
          ''
        ]);
        if (usersTable) usersTable.destroy();
        usersTable = $('#usersTable').DataTable({
          data: rows,
          destroy: true
        });
      },
      error: function(xhr) {
        alert('Failed to load users. You may not be authorized.');
      }
    });
  }

  // Update user role
  $(document).on('change', '.userRoleSelect', function() {
    const id = $(this).data('id');
    const role = $(this).val();
    $.ajax({
      url: `http://localhost:4000/api/v1/users/${id}/role`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ role }),
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
      success: function() { loadUsers(); },
      error: function(xhr) { alert('Failed to update role.'); }
    });
  });

  // Update user status
  $(document).on('change', '.userStatusSelect', function() {
    const id = $(this).data('id');
    const status = $(this).val();
    $.ajax({
      url: `http://localhost:4000/api/v1/users/${id}/status`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ status }),
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
      success: function() { loadUsers(); },
      error: function(xhr) { alert('Failed to update status.'); }
    });
  });
}); 