$(function() {
  // Require authentication - redirect to login if not authenticated
  if (!Auth.requireUser()) {
    return;
  }
  const user = Auth.getUser();
  Auth.updateNavigation();

  // Fetch delivered orders and products
  $.ajax({
    url: 'http://localhost:4000/api/v1/orders',
    type: 'GET',
    headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
    success: function(orders) {
      const deliveredOrders = orders.filter(o => o.status === 'Delivered');
      if (deliveredOrders.length === 0) {
        $('#deliveredProducts').html('<div class="alert alert-info">You have no delivered orders yet.</div>');
        return;
      }
      let html = '<div class="table-responsive"><table class="table table-bordered table-hover align-middle"><thead class="table-dark"><tr><th>Order ID</th><th>Date</th><th>Product</th><th>Qty</th><th>Action</th></tr></thead><tbody>';
      let productRows = 0;
      deliveredOrders.forEach(order => {
        $.ajax({
          url: `http://localhost:4000/api/v1/orderlines?order_id=${order.id}`,
          type: 'GET',
          headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
          async: false,
          success: function(lines) {
            lines.forEach(line => {
              html += `<tr><td>${order.id}</td><td>${order.order_date ? order.order_date.replace('T', ' ').slice(0, 19) : ''}</td><td>${line.product_name}</td><td>${line.quantity}</td><td><button class="btn btn-sm btn-outline-primary leave-review-btn" data-product-id="${line.product_id}" data-product-name="${line.product_name}">Leave a Review</button></td></tr>`;
              productRows++;
            });
          }
        });
      });
      html += '</tbody></table></div>';
      if (productRows === 0) {
        html = '<div class="alert alert-info">No products found in delivered orders.</div>';
      }
      $('#deliveredProducts').html(html);
    },
    error: function() {
      $('#deliveredProducts').html('<div class="alert alert-danger">Could not fetch delivered products.</div>');
    }
  });

  // Show review modal on button click
  $(document).on('click', '.leave-review-btn, .update-review-btn', function() {
    const productId = $(this).data('product-id');
    const productName = $(this).data('product-name');
    // Check if user already has a review for this product
    $.ajax({
      url: `http://localhost:4000/api/v1/reviews/my?product_id=${productId}`,
      type: 'GET',
      headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
      success: function(existingReview) {
        showReviewModal(productId, productName, existingReview);
      },
      error: function() {
        showReviewModal(productId, productName, null);
      }
    });
  });

  function showReviewModal(productId, productName, existingReview) {
    const isUpdate = !!existingReview;
    const modalHtml = `
      <div class="modal fade" id="reviewModal" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="reviewModalLabel">${isUpdate ? 'Update' : 'Leave'} a Review for ${productName}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="submitReviewForm">
                <div class="mb-3">
                  <label for="reviewRating" class="form-label">Rating</label>
                  <select class="form-select" id="reviewRating" name="rating" required>
                    <option value="">Select rating</option>
                    <option value="1"${existingReview && existingReview.rating == 1 ? ' selected' : ''}>1</option>
                    <option value="2"${existingReview && existingReview.rating == 2 ? ' selected' : ''}>2</option>
                    <option value="3"${existingReview && existingReview.rating == 3 ? ' selected' : ''}>3</option>
                    <option value="4"${existingReview && existingReview.rating == 4 ? ' selected' : ''}>4</option>
                    <option value="5"${existingReview && existingReview.rating == 5 ? ' selected' : ''}>5</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="reviewComment" class="form-label">Comment</label>
                  <textarea class="form-control" id="reviewComment" name="comment" rows="3" maxlength="500">${existingReview ? (existingReview.comment || '') : ''}</textarea>
                </div>
                <input type="hidden" name="product_id" value="${productId}">
                <button type="submit" class="btn btn-primary">${isUpdate ? 'Update Review' : 'Submit Review'}</button>
              </form>
              <div id="reviewResult"></div>
            </div>
          </div>
        </div>
      </div>`;
    // Remove any existing modal
    $('#reviewModal').remove();
    $('body').append(modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    modal.show();
    // Store update state
    $('#submitReviewForm').data('is-update', isUpdate);
    // Store productId for button update
    $('#submitReviewForm').data('product-id', productId);
  }

  // Handle review form submission
  $(document).on('submit', '#submitReviewForm', function(e) {
    e.preventDefault();
    const isUpdate = $(this).data('is-update');
    const formData = $(this).serialize();
    const productId = $(this).find('input[name="product_id"]').val();
    const $form = $(this);
    if (isUpdate) {
      // Update review
      $.ajax({
        url: `http://localhost:4000/api/v1/reviews/${productId}`,
        type: 'PUT',
        data: formData,
        headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
        success: function() {
          $('#reviewResult').html('<div class="alert alert-success">Review updated!</div>');
          setTimeout(() => {
            $('#reviewModal').modal('hide');
            updateReviewButton(productId, true);
            // Accessibility: move focus to the update button or body
            const $btn = $(`button[data-product-id='${productId}']`);
            if ($btn.length) {
              $btn.focus();
            } else {
              $('body').focus();
            }
          }, 1200);
        },
        error: function(xhr) {
          $('#reviewResult').html('<div class="alert alert-danger">' + (xhr.responseJSON?.error || 'Failed to update review.') + '</div>');
        }
      });
    } else {
      // Create review
      $.ajax({
        url: 'http://localhost:4000/api/v1/reviews',
        type: 'POST',
        data: formData,
        headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
        success: function() {
          $('#reviewResult').html('<div class="alert alert-success">Review submitted!</div>');
          setTimeout(() => {
            $('#reviewModal').modal('hide');
            updateReviewButton(productId, true);
            // Accessibility: move focus to the update button or body
            const $btn = $(`button[data-product-id='${productId}']`);
            if ($btn.length) {
              $btn.focus();
            } else {
              $('body').focus();
            }
          }, 1200);
        },
        error: function(xhr) {
          $('#reviewResult').html('<div class="alert alert-danger">' + (xhr.responseJSON?.error || 'Failed to submit review.') + '</div>');
        }
      });
    }
  });

  // Update the review button for a product (after submit/update)
  function updateReviewButton(productId, hasReview) {
    // Find the button in the table and update it
    const $btn = $(`button[data-product-id='${productId}']`);
    if (hasReview) {
      $btn.removeClass('leave-review-btn btn-outline-primary').addClass('update-review-btn btn-warning').text('Update Review');
    } else {
      $btn.removeClass('update-review-btn btn-warning').addClass('leave-review-btn btn-outline-primary').text('Leave a Review');
    }
  }

  // On page load, update all buttons to reflect review state
  function updateAllReviewButtons() {
    $("button.leave-review-btn, button.update-review-btn").each(function() {
      const productId = $(this).data('product-id');
      $.ajax({
        url: `http://localhost:4000/api/v1/reviews/my?product_id=${productId}`,
        type: 'GET',
        headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
        success: (existingReview) => {
          if (existingReview) {
            updateReviewButton(productId, true);
          } else {
            updateReviewButton(productId, false);
          }
        }
      });
    });
  }

  // After loading delivered products, update all review buttons
  $(document).ajaxStop(function() {
    updateAllReviewButtons();
  });
}); 