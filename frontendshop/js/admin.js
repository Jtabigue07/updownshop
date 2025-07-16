let yearlySalesChartInstance = null;
let monthlySalesChartInstance = null;
let salesPieChartInstance = null;

function resetCanvas(canvasId) {
  const oldCanvas = document.getElementById(canvasId);
  const parent = oldCanvas.parentNode;
  parent.removeChild(oldCanvas);
  const newCanvas = document.createElement('canvas');
  newCanvas.id = canvasId;
  parent.appendChild(newCanvas);
  return newCanvas;
}

$(function() {
  // Require admin authentication - redirect to login if not authenticated or not admin
  if (!Auth.requireAdmin()) {
    return; // Stop execution if not authenticated or not admin
  }

  // Update navigation
  Auth.updateNavigation();

  // View Profile
  $(document).on('click', '#viewProfileBtn', function(e) {
    e.preventDefault();
    window.location.href = 'admin-profile.html';
  });

  // Manage Orders button opens modal and loads orders
  $(document).on('click', '#manageOrdersBtn', function() {
    $('#ordersModal').modal('show');
    loadOrdersTable();
  });

  function loadOrdersTable() {
    const token = localStorage.getItem('token');
    $.ajax({
      url: 'http://localhost:4000/api/v1/admin/orders',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function(orders) {
        const tbody = $('#ordersTable tbody');
        tbody.empty();
        orders.forEach(order => {
          const statusOptions = ['Pending', 'Verified', 'Shipped', 'Delivered'].map(s =>
            `<option value="${s}"${order.status === s ? ' selected' : ''}>${s}</option>`
          ).join('');
          const row = `<tr data-id="${order.id}">
            <td>${order.id}</td>
            <td>${order.user_name}</td>
            <td>${order.user_email}</td>
            <td>${order.order_date ? order.order_date.replace('T', ' ').slice(0, 19) : ''}</td>
            <td>${order.total}</td>
            <td><span class="order-status">${order.status}</span></td>
            <td>
              <select class="form-select form-select-sm order-status-select">
                ${statusOptions}
              </select>
            </td>
          </tr>`;
          tbody.append(row);
        });
        // Destroy and re-initialize DataTable
        if ($.fn.DataTable.isDataTable('#ordersTable')) {
          $('#ordersTable').DataTable().destroy();
        }
        $('#ordersTable').DataTable({
          responsive: true,
          autoWidth: false,
          order: [[0, 'desc']],
          pageLength: 10,
          lengthMenu: [5, 10, 25, 50],
          language: { search: "Filter:" }
        });
      },
      error: function(xhr) {
        alert('Failed to load orders: ' + (xhr.responseJSON?.error || xhr.statusText));
      }
    });
  }

  // Handle status change
  $(document).on('change', '.order-status-select', function() {
    const row = $(this).closest('tr');
    const orderId = row.data('id');
    const newStatus = $(this).val();
    const token = localStorage.getItem('token');
    $.ajax({
      url: `http://localhost:4000/api/v1/admin/orders/${orderId}/status`,
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      data: JSON.stringify({ status: newStatus }),
      success: function() {
        row.find('.order-status').text(newStatus);
      },
      error: function(xhr) {
        alert('Failed to update status: ' + (xhr.responseJSON?.error || xhr.statusText));
      }
    });
  });

  // Manage Reviews button opens modal and loads reviews
  $(document).on('click', '.dashboard-actions .btn:contains("Manage Reviews")', function() {
    $('#reviewsModal').modal('show');
    loadReviewsTable();
  });

  function loadReviewsTable() {
    const token = localStorage.getItem('token');
    const table = $('#reviewsTable');
    // Destroy DataTable if already initialized
    if ($.fn.DataTable.isDataTable(table)) {
      table.DataTable().destroy();
    }
    $.ajax({
      url: 'http://localhost:4000/api/v1/reviews/moderate',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function(reviews) {
        const tbody = table.find('tbody');
        tbody.empty();
        reviews.forEach(review => {
          const delBtn = `<button class="btn btn-danger btn-sm delete-review" data-id="${review.id}"><i class="bi bi-trash"></i> Delete</button>`;
          const row = `<tr>
            <td>${review.id}</td>
            <td>${review.product_name}</td>
            <td>${review.user_name}</td>
            <td>${review.rating}</td>
            <td>${review.comment || ''}</td>
            <td>${review.status}</td>
            <td>${review.created_at ? review.created_at.replace('T', ' ').slice(0, 19) : ''}</td>
            <td>${delBtn}</td>
          </tr>`;
          tbody.append(row);
        });
        table.DataTable({
          responsive: true,
          autoWidth: false,
          order: [[0, 'desc']],
          pageLength: 10,
          lengthMenu: [5, 10, 25, 50],
          language: { search: "Filter:" }
        });
      },
      error: function(xhr) {
        alert('Failed to load reviews: ' + (xhr.responseJSON?.error || xhr.statusText));
      }
    });
  }

  // Delete review
  $(document).on('click', '.delete-review', function() {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const id = $(this).data('id');
    const token = localStorage.getItem('token');
    $.ajax({
      url: `http://localhost:4000/api/v1/reviews/${id}`,
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function() {
        loadReviewsTable();
      },
      error: function(xhr) {
        alert('Failed to delete review: ' + (xhr.responseJSON?.error || xhr.statusText));
      }
    });
  });

  // --- CHARTS ---

  function loadYearlySalesChart() {
    const token = localStorage.getItem('token');
    $.ajax({
      url: 'http://localhost:4000/api/v1/analytics/yearly-sales',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function(res) {
        const labels = res.data.map(row => row.year);
        const data = res.data.map(row => row.sales);
        if (yearlySalesChartInstance) yearlySalesChartInstance.destroy();
        const canvas = resetCanvas('yearlySalesChart');
        setTimeout(() => {
          const ctx = canvas.getContext('2d');
          yearlySalesChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: 'Yearly Sales',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
              }]
            }
          });
        }, 0);
      }
    });
  }

  function loadMonthlySalesChart() {
    const token = localStorage.getItem('token');
    $.ajax({
      url: 'http://localhost:4000/api/v1/analytics/monthly-sales',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function(res) {
        const labels = res.data.map(row => row.month);
        const data = res.data.map(row => row.sales);
        if (monthlySalesChartInstance) monthlySalesChartInstance.destroy();
        const canvas = resetCanvas('monthlySalesChart');
        setTimeout(() => {
          const ctx = canvas.getContext('2d');
          monthlySalesChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
              labels: labels,
              datasets: [{
                label: 'Monthly Sales',
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.4)',
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: true
              }]
            }
          });
        }, 0);
      }
    });
  }

  function loadSalesPieChart() {
    const token = localStorage.getItem('token');
    $.ajax({
      url: 'http://localhost:4000/api/v1/analytics/sales-pie',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token },
      success: function(res) {
        const labels = res.data.map(row => row.product);
        const data = res.data.map(row => row.sales);
        if (salesPieChartInstance) salesPieChartInstance.destroy();
        const canvas = resetCanvas('salesPieChart');
        setTimeout(() => {
          const ctx = canvas.getContext('2d');
          salesPieChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: labels,
              datasets: [{
                label: 'Sales by Product',
                data: data,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.6)',
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)',
                  'rgba(153, 102, 255, 0.6)',
                  'rgba(255, 159, 64, 0.6)'
                ]
              }]
            }
          });
        }, 0);
      }
    });
  }

  // Only load these three charts
  loadYearlySalesChart();
  loadMonthlySalesChart();
  loadSalesPieChart();
}); 