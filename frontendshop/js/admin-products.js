$(function() {
  let productsTable;
  let categories = [];

  // Open modal on button click
  $('#manageProductsBtn').on('click', function() {
    $('#productsModal').modal('show');
    loadProducts();
  });

  // Load categories for select
  function loadCategories(selectedId) {
    $.get('http://localhost:4000/api/v1/categories', function(res) {
      categories = res;
      let options = categories.map(c => `<option value="${c.id}"${selectedId==c.id?' selected':''}>${c.name}</option>`).join('');
      $('#productCategory').html(options);
    });
  }

  // Load products into DataTable
  function loadProducts() {
    $.get('http://localhost:4000/api/v1/products', function(res) {
      if (productsTable) productsTable.destroy();
      let rows = res.map(p => [
        p.id,
        p.name,
        p.category || '',
        p.price,
        p.stock,
        p.image ? `<img src='http://localhost:4000/${p.image}' style='max-width:60px;max-height:40px;'>` : '',
        `<button class='btn btn-sm btn-warning editProductBtn' data-id='${p.id}'>Edit</button> <button class='btn btn-sm btn-danger deleteProductBtn' data-id='${p.id}'>Delete</button>`
      ]);
      productsTable = $('#productsTable').DataTable({
        data: rows,
        destroy: true
      });
    });
  }

  // Add Product button
  $('#addProductBtn').on('click', function() {
    $('#productForm')[0].reset();
    $('#productId').val('');
    $('#productImagePreview').hide();
    loadCategories();
    $('#productFormModal').modal('show');
  });

  // Edit Product button
  $(document).on('click', '.editProductBtn', function() {
    const id = $(this).data('id');
    $.get(`http://localhost:4000/api/v1/products/${id}`, function(p) {
      $('#productId').val(p.id);
      $('#productName').val(p.name);
      $('#productPrice').val(p.price);
      $('#productStock').val(p.stock);
      loadCategories(p.category_id);
      $('#productImagePreview').hide();
      $('#productFormModal').modal('show');
    });
  });

  // Image preview
  $('#productImage').on('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        $('#productImagePreview').attr('src', e.target.result).show();
      };
      reader.readAsDataURL(file);
    }
  });

  // Save Product (Add/Edit)
  $('#productForm').on('submit', function(e) {
    e.preventDefault();
    const id = $('#productId').val();
    const formData = new FormData(this);
    const url = id ? `http://localhost:4000/api/v1/products/${id}` : 'http://localhost:4000/api/v1/products';
    const method = id ? 'PUT' : 'POST';
    $.ajax({
      url: url,
      type: method,
      data: formData,
      processData: false,
      contentType: false,
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
      success: function() {
        $('#productFormModal').modal('hide');
        loadProducts();
      },
      error: function(xhr) {
        alert('Error: ' + (xhr.responseJSON?.error || 'Failed to save product.'));
      }
    });
  });

  // Delete Product
  $(document).on('click', '.deleteProductBtn', function() {
    if (!confirm('Delete this product?')) return;
    const id = $(this).data('id');
    $.ajax({
      url: `http://localhost:4000/api/v1/products/${id}`,
      type: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
      success: function() {
        loadProducts();
      },
      error: function(xhr) {
        alert('Error: ' + (xhr.responseJSON?.error || 'Failed to delete product.'));
      }
    });
  });

  // Validation for multiple images (mp1)
  $('#productForm').on('submit', function(e) {
    const files = $('#productImage')[0].files;
    if (files.length === 0) {
      alert('Please select at least one image.');
      e.preventDefault();
      return false;
    }
    // Optionally: check file types/sizes here
  });

  // Preview selected images (multiple)
  $('#productImage').on('change', function() {
    $('#productImagePreview').empty();
    Array.from(this.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        $('#productImagePreview').append(`<img src="${e.target.result}" style="max-width:60px;max-height:40px;margin:2px;">`);
      };
      reader.readAsDataURL(file);
    });
  });

  // Validation for mp4/mp5 files (example for a video input)
  $(document).on('change', '#videoInput', function() {
    const files = this.files;
    for (let file of files) {
      if (!file.name.match(/\.(mp4|mp5)$/i)) {
        alert('Only MP4 and MP5 files are allowed!');
        this.value = '';
        break;
      }
    }
  });
}); 