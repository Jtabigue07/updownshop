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

  function renderProfileForm(profile = {}) {
    // Always use the static image element
    const imgElem = document.getElementById('staticProfileImg');
    if (profile.image_path) {
      imgElem.src = `http://localhost:4000/${profile.image_path}`;
      imgElem.style.display = 'inline-block';
    } else {
      imgElem.src = 'https://via.placeholder.com/140';
      imgElem.style.display = 'inline-block';
    }

    // Load draft from localStorage if exists
    let draft = {};
    try {
      draft = JSON.parse(localStorage.getItem('profileDraft') || '{}');
    } catch (e) {}

    // Use draft values if present, else profile values
    function getField(name) {
      return draft[name] !== undefined ? draft[name] : (profile[name] || '');
    }

    let html = `<h2>Your Profile</h2>
      <form id="updateProfileForm" enctype="multipart/form-data" class="mb-4">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label">Title</label>
            <select class="form-select" name="title">
              <option${getField('title') === 'Mr' ? ' selected' : ''}>Mr</option>
              <option${getField('title') === 'Mrs' ? ' selected' : ''}>Mrs</option>
              <option${getField('title') === 'Ms' ? ' selected' : ''}>Ms</option>
              <option${getField('title') === 'Dr' ? ' selected' : ''}>Dr</option>
            </select>
          </div>
          <div class="col-md-5">
            <label class="form-label">First Name</label>
            <input type="text" class="form-control" name="fname" value="${getField('fname')}" required>
          </div>
          <div class="col-md-5">
            <label class="form-label">Last Name</label>
            <input type="text" class="form-control" name="lname" value="${getField('lname')}" required>
          </div>
          <div class="col-md-12">
            <label class="form-label">Address</label>
            <input type="text" class="form-control" name="addressline" value="${getField('addressline')}">
          </div>
          <div class="col-md-4">
            <label class="form-label">Town</label>
            <input type="text" class="form-control" name="town" value="${getField('town')}">
          </div>
          <div class="col-md-4">
            <label class="form-label">Zip Code</label>
            <input type="text" class="form-control" name="zipcode" value="${getField('zipcode')}">
          </div>
          <div class="col-md-4">
            <label class="form-label">Phone</label>
            <input type="text" class="form-control" name="phone" value="${getField('phone')}">
          </div>
          <div class="col-md-12">
            <label class="form-label">Profile Image</label>
            <input type="file" class="form-control" name="image">
          </div>
        </div>
        <input type="hidden" name="userId" value="${user.id}">
        <button type="submit" class="btn btn-primary mt-4">Update Profile</button>
      </form>
      <div id="profileResult"></div>
      <hr>
      <p><b>Email:</b> ${profile.email || user.email}</p>
      <p><b>Role:</b> ${profile.role || user.role}</p>`;
    $('#profileContent').html(html);

    // Save form data to localStorage on change
    $('#updateProfileForm').on('input change', 'input,select', function() {
      const formData = {};
      $('#updateProfileForm').serializeArray().forEach(function(item) {
        formData[item.name] = item.value;
      });
      localStorage.setItem('profileDraft', JSON.stringify(formData));
    });

    // Handle form submission
    $('#updateProfileForm').on('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      $.ajax({
        url: 'http://localhost:4000/api/v1/update-profile',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        success: function(res) {
          $('#profileResult').html('<div class="alert alert-success">Profile updated! Please reload to see changes.</div>');
          localStorage.removeItem('profileDraft');
        },
        error: function(xhr) {
          $('#profileResult').html('<div class="alert alert-danger">Update failed. ' + (xhr.responseJSON?.error || '') + '</div>');
        }
      });
    });
  }

  // Fetch profile details from backend
  $.ajax({
    url: `http://localhost:4000/api/v1/profile/${user.id}`,
    type: 'GET',
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
    success: function(res) {
      renderProfileForm(res.profile || {});
    },
    error: function(xhr) {
      // If not found, show empty form so user can create profile
      renderProfileForm({});
    }
  });
}); 