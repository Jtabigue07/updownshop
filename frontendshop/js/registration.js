document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const alertContainer = document.getElementById('alertContainer');

    function showAlert(message, type = 'success') {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    function clearAlert() {
        alertContainer.innerHTML = '';
    }

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearAlert();

        const formData = new FormData(registerForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            showAlert('Please fill in all fields.', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match.', 'danger');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters long.', 'danger');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/v1/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Registration successful! You can now log in.', 'success');
                registerForm.reset();
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showAlert(data.message || 'Registration failed. Please try again.', 'danger');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Network error. Please check your connection and try again.', 'danger');
        }
    });
}); 