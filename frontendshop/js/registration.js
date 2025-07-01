$(function() {
  // Registration
  $('#registerForm').on('submit', function(e) {
    e.preventDefault();
    $('#registerResult').html('');
    $.ajax({
      url: 'http://localhost:4000/api/v1/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: $('#regName').val(),
        email: $('#regEmail').val(),
        password: $('#regPassword').val(),
        role: $('#regRole').val()
      }),
      success: function(res) {
        $('#registerResult').html('<p style="color:green;">Registration successful! You can now <a href="index.html">log in</a>.</p>');
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
}); 