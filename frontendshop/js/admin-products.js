$(function() {
  // Require admin authentication - redirect to login if not authenticated or not admin
  if (!Auth.requireAdmin()) {
    return; // Stop execution if not authenticated or not admin
  }

  let categories = [];
  let allProducts = [];
  let currentMode = 'pagination'; // 'pagination' or 'infinite'
  
  // Pagination variables
  let currentPage = 1;
  let itemsPerPage = 10;
  let totalPages = 1;
  
  // Infinite scroll variables
  let infinitePage = 1;
  let infiniteItemsPerPage = 10;
  let isLoading = false;
  let hasMoreProducts = true;

  // Open modal on button click
  $('#manageProductsBtn').on('click', function() {
    $('#productsModal').modal('show');
    loadAllProducts();
  });

  // Mode switching
  $('#paginationModeBtn').on('click', function() {
    switchMode('pagination');
  });

  $('#infiniteScrollModeBtn').on('click', function() {
    switchMode('infinite');
  });

  function switchMode(mode) {
    currentMode = mode;
    
    if (mode === 'pagination') {
      $('#paginationMode').show();
      $('#infiniteScrollMode').hide();
      $('#paginationModeBtn').removeClass('btn-outline-secondary').addClass('btn-outline-primary');
      $('#infiniteScrollModeBtn').removeClass('btn-outline-primary').addClass('btn-outline-secondary');
      renderPagination();
    } else {
      $('#paginationMode').hide();
      $('#infiniteScrollMode').show();
      $('#infiniteScrollModeBtn').removeClass('btn-outline-secondary').addClass('btn-outline-primary');
      $('#paginationModeBtn').removeClass('btn-outline-primary').addClass('btn-outline-secondary');
      resetInfiniteScroll();
      loadInfiniteProducts();
    }
  }

  // Load categories for select
  function loadCategories(selectedId) {
    $.get('http://localhost:4000/api/v1/categories', function(res) {
      categories = res;
      let options = categories.map(c => `<option value="${c.id}"${selectedId==c.id?' selected':''}>${c.name}</option>`).join('');
      $('#productCategory').html(options);
    });
  }

  // Load all products (for pagination)
  function loadAllProducts() {
    $.get('http://localhost:4000/api/v1/products', function(res) {
      allProducts = res;
      if (currentMode === 'pagination') {
        renderPagination();
      }
    });
  }

  // Render pagination table
  function renderPagination() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = allProducts.slice(startIndex, endIndex);
    
    totalPages = Math.ceil(allProducts.length / itemsPerPage);
    
    // Update pagination info
    $('#startRecord').text(allProducts.length > 0 ? startIndex + 1 : 0);
    $('#endRecord').text(Math.min(endIndex, allProducts.length));
    $('#totalRecords').text(allProducts.length);
    $('#currentPage').text(currentPage);
    $('#totalPages').text(totalPages);
    
    // Update pagination buttons
    $('#firstPageBtn, #prevPageBtn').prop('disabled', currentPage === 1);
    $('#lastPageBtn, #nextPageBtn').prop('disabled', currentPage === totalPages);
    
    // Render table
    renderProductsTable(pageProducts, '#productsTableBody');
  }

  // Render products table (shared function)
  function renderProductsTable(products, targetSelector) {
    const rows = products.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.category || ''}</td>
        <td>$${p.price}</td>
        <td>${p.stock}</td>
        <td>${p.image ? `<img src='http://localhost:4000/${p.image}' style='max-width:60px;max-height:40px;'>` : ''}</td>
        <td>
          <button class='btn btn-sm btn-warning editProductBtn' data-id='${p.id}'>Edit</button> 
          <button class='btn btn-sm btn-danger deleteProductBtn' data-id='${p.id}'>Delete</button>
        </td>
      </tr>
    `).join('');
    
    $(targetSelector).html(rows);
  }

  // Pagination event handlers
  $('#firstPageBtn').on('click', function() {
    if (currentPage !== 1) {
      currentPage = 1;
      renderPagination();
    }
  });

  $('#prevPageBtn').on('click', function() {
    if (currentPage > 1) {
      currentPage--;
      renderPagination();
    }
  });

  $('#nextPageBtn').on('click', function() {
    if (currentPage < totalPages) {
      currentPage++;
      renderPagination();
    }
  });

  $('#lastPageBtn').on('click', function() {
    if (currentPage !== totalPages) {
      currentPage = totalPages;
      renderPagination();
    }
  });

  $('#itemsPerPage').on('change', function() {
    itemsPerPage = parseInt($(this).val());
    currentPage = 1;
    renderPagination();
  });

  // Infinite scroll functionality
  function resetInfiniteScroll() {
    infinitePage = 1;
    isLoading = false;
    hasMoreProducts = true;
    $('#productsTableBodyInfinite').empty();
    $('#loadingIndicator').hide();
    $('#noMoreProducts').hide();
  }

  function loadInfiniteProducts() {
    if (isLoading || !hasMoreProducts) return;
    
    isLoading = true;
    $('#loadingIndicator').show();
    
    // Simulate pagination by slicing the allProducts array
    const startIndex = (infinitePage - 1) * infiniteItemsPerPage;
    const endIndex = startIndex + infiniteItemsPerPage;
    const pageProducts = allProducts.slice(startIndex, endIndex);
    
    // Simulate API delay
    setTimeout(() => {
      if (pageProducts.length > 0) {
        // Append to existing table instead of replacing
        const rows = pageProducts.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.category || ''}</td>
            <td>$${p.price}</td>
            <td>${p.stock}</td>
            <td>${p.image ? `<img src='http://localhost:4000/${p.image}' style='max-width:60px;max-height:40px;'>` : ''}</td>
            <td>
              <button class='btn btn-sm btn-warning editProductBtn' data-id='${p.id}'>Edit</button> 
              <button class='btn btn-sm btn-danger deleteProductBtn' data-id='${p.id}'>Delete</button>
            </td>
          </tr>
        `).join('');
        
        $('#productsTableBodyInfinite').append(rows);
        infinitePage++;
        hasMoreProducts = endIndex < allProducts.length;
      } else {
        hasMoreProducts = false;
      }
      
      isLoading = false;
      $('#loadingIndicator').hide();
      
      if (!hasMoreProducts) {
        $('#noMoreProducts').show();
      }
    }, 500);
  }

  // Infinite scroll detection
  $('#productsModal .modal-body').on('scroll', function() {
    if (currentMode !== 'infinite') return;
    
    const scrollTop = $(this).scrollTop();
    const scrollHeight = $(this)[0].scrollHeight;
    const clientHeight = $(this).height();
    
    if (scrollTop + clientHeight >= scrollHeight - 100) { // Load when 100px from bottom
      loadInfiniteProducts();
    }
  });

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
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
      success: function() {
        $('#productFormModal').modal('hide');
        loadAllProducts(); // Reload all products
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
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
      success: function() {
        loadAllProducts(); // Reload all products
      },
      error: function(xhr) {
        alert('Error: ' + (xhr.responseJSON?.error || 'Failed to delete product.'));
      }
    });
  });

  // Initialize with pagination mode
  switchMode('pagination');
}); 