$(function() {
  // Require authentication - redirect to login if not authenticated
  if (!Auth.requireUser()) {
    return; // Stop execution if not authenticated
  }

  const user = Auth.getUser();

  // Update navigation
  Auth.updateNavigation();

  function renderProfileForm(profile = {}) {
    let html = `<div class="card mx-auto" style="max-width:520px;">
      <div class="card-body">
        <div class="profile-title mb-4"><i class="bi bi-person-circle"></i> Your Profile</div>
        <form id="updateProfileForm" enctype="multipart/form-data">
          <div class="mb-3 text-center">
            <img id="staticProfileImg" src="${profile.image_path ? `http://localhost:4000/${profile.image_path}` : 'https://via.placeholder.com/140'}" alt="Profile Photo" class="rounded-circle border border-3 border-primary shadow" style="width:120px;height:120px;object-fit:cover;">
          </div>
          <input type="hidden" name="existingImagePath" value="${profile.image_path || ''}">
          <div class="mb-3">
            <label class="form-label">Title</label>
            <select class="form-select" name="title">
              <option${profile.title === 'Mr' ? ' selected' : ''}>Mr</option>
              <option${profile.title === 'Mrs' ? ' selected' : ''}>Mrs</option>
              <option${profile.title === 'Ms' ? ' selected' : ''}>Ms</option>
              <option${profile.title === 'Dr' ? ' selected' : ''}>Dr</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">First Name</label>
            <input type="text" class="form-control" name="fname" value="${profile.fname || ''}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Last Name</label>
            <input type="text" class="form-control" name="lname" value="${profile.lname || ''}" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Address</label>
            <input type="text" class="form-control" name="addressline" value="${profile.addressline || ''}">
          </div>
          <div class="mb-3">
            <label class="form-label">Town</label>
            <input type="text" class="form-control" name="town" value="${profile.town || ''}">
          </div>
          <div class="mb-3">
            <label class="form-label">Zip Code</label>
            <input type="text" class="form-control" name="zipcode" value="${profile.zipcode || ''}">
          </div>
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input type="text" class="form-control" name="phone" value="${profile.phone || ''}">
          </div>
          <div class="mb-3">
            <label class="form-label">Profile Image</label>
            <input type="file" class="form-control" name="image">
          </div>
          <input type="hidden" name="userId" value="${user.id}">
          <button type="submit" class="btn btn-primary w-100">Update Profile</button>
        </form>
        <div id="profileResult" class="mt-3"></div>
        <hr>
        <p><b>Email:</b> ${profile.email || user.email}</p>
        <p><b>Role:</b> ${profile.role || user.role}</p>
      </div>
    </div>`;
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
      // If no new image is selected, ensure existingImagePath is sent
      if (!formData.get('image') || formData.get('image').name === "") {
        formData.set('existingImagePath', $('input[name="existingImagePath"]').val());
      }
      $.ajax({
        url: 'http://localhost:4000/api/v1/update-profile',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
        success: function(res) {
          $('#profileResult').html('<div class="alert alert-success">Profile updated!</div>');
          localStorage.removeItem('profileDraft');
          // Re-fetch profile data and re-render form
          $.ajax({
            url: `http://localhost:4000/api/v1/profile/${user.id}`,
            type: 'GET',
            headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
            success: function(res) {
              renderProfileForm(res.profile || {});
            }
          });
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
    headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
    success: function(res) {
      renderProfileForm(res.profile || {});
    },
    error: function(xhr) {
      // If not found, show empty form so user can create profile
      renderProfileForm({});
    }
  });
}); 