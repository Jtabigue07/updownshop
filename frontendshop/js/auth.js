// Authentication utility functions
class Auth {
  static isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  static isAdmin() {
    return this.getUserRole() === 'admin';
  }

  static isUser() {
    return this.getUserRole() === 'user';
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }

  static requireAuth(redirectTo = 'login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  static requireRole(role, redirectTo = 'login.html') {
    if (!this.requireAuth(redirectTo)) {
      return false;
    }
    
    const userRole = this.getUserRole();
    if (userRole !== role) {
      // Redirect based on user's actual role
      if (userRole === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'home.html';
      }
      return false;
    }
    return true;
  }

  static requireAdmin(redirectTo = 'login.html') {
    return this.requireRole('admin', redirectTo);
  }

  static requireUser(redirectTo = 'login.html') {
    return this.requireRole('user', redirectTo);
  }

  static redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      const userRole = this.getUserRole();
      if (userRole === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'home.html';
      }
      return true;
    }
    return false;
  }

  static updateNavigation() {
    const user = this.getUser();
    // If on admin dashboard, update only the #adminName span
    if (user && user.role === 'admin' && $('#adminName').length) {
      $('#adminName').text(user.name);
      // Optionally, show/hide admin/user links if needed
      $('.admin-only').show();
      $('.user-only').hide();
      return;
    }
    if (user) {
      // Show user info in navigation
      $('.user-info').text(`Welcome, ${user.name}`);
      
      // Show/hide admin links
      if (user.role === 'admin') {
        $('.admin-only').show();
        $('.user-only').hide();
      } else {
        $('.admin-only').hide();
        $('.user-only').show();
      }
    } else {
      $('.user-info').text('');
      $('.admin-only, .user-only').hide();
    }
  }
}

// Auto-check authentication on page load
$(document).ready(function() {
  // Update navigation based on authentication status
  Auth.updateNavigation();
  
  // Add logout functionality to all pages
  $(document).on('click', '#logoutBtn, #logoutBtnDropdown', function(e) {
    e.preventDefault();
    Auth.logout();
  });
}); 