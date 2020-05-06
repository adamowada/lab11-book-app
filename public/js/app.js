'use strict';

$('.update').on('click', showForm);

function showForm() {
  $(this).fadeOut();
  $(this).next().fadeIn();
}

$('.cancel-update').on('click', hideForm);

function hideForm() {
  $(this).parent().fadeIn();
}