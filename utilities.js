/*
    Utilities
               */

function setStorage(token, username) {
  localStorage.setItem('token', token)
  localStorage.setItem('username', username)
}

function getToken() {
  return localStorage.getItem('token')
}

function getUsername() {
  return localStorage.getItem('username')
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

function loggedIn() {
  return localStorage.getItem('token') !== null
}

function loginToggle() {
  if (loggedIn()) {
    $('.logged-out').hide()
    $('.logged-in').show()
    $('#nav-username').html(`${getUsername()} <span class="caret"></span>`)
  } else {
    $('.logged-in').hide()
    $('.logged-out').show()
    $('#nav-username').html('User <span class="caret"></span>')
  }
}

function resetForm(form_id) {
  $(form_id)[0].reset()
}
