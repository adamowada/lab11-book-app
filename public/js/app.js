'use strict';

$('.update').on('click', showForm);

function showForm() {
  $(this).hide();
  $(this).next().fadeIn();
}
