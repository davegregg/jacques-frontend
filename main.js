$(document).ready(function () {

  /*
      Load notes
                  */

  $.ajax({
      url: apiBase + '/notes',
      data_type: 'json'
    })
    .done((response) => {
      $('#main-content').append(template.notes(response))
      $('#new-note-tags').tagsinput({
          trimValue: true,
          maxChars: 40
        })
    })
    .fail((status, textStatus, xhr) => {
      error = {
        code: status,
        textStatus: textStatus,
        message: xhr
      }
      $('#main-content').html(template.error(error))
    })


  /*
      New Note Form
                     */

  $('#new_note_form').on('submit', (ev) => {
      ev.preventDefault()
      $.post(`${apiBase}/notes?api_token=${getToken()}`, $('#new_note_form').serialize())
        .done((response) => {
          response.notes = [response.note]
          delete response.note
          $('#main-content').prepend(template.notes(response))
          resetForm('#new_note_form')
          $('#new-note-tags').tagsinput('removeAll')
        })
    })


  /*
      Modals
              */

  function buildModal(name, bindModalFormSubmission) {
    $(`#${name}-modal-container`).html(
      template.modal({
        modalName:   name,
        modalBody:   new Handlebars.SafeString($(`#${name}-modal-body`).html()),
        modalFooter: new Handlebars.SafeString($(`#${name}-modal-footer`).html())
      })
    )
    $(`#${name}-link`).on('shown.bs.modal', () => { // modal trigger
        $(`#${name}-modal`).focus()
      })
    if (typeof bindModalFormSubmission !== 'undefined') { // if arg supplied
      bindModalFormSubmission()
    }
  }


  /*
      Login/Signup form events
                                */

  function bindLoginSubmissionEvent() {
    $('#login-form').on('submit', (ev) => {
        ev.preventDefault()
        $.post(apiBase + "/login", $('#login-form').serialize())
          .done((response) => {
            if (typeof response.error === 'string') {
              error = {
                code: {
                  status: response.status
                },
                textStatus: 'Unauthorized',
                message: response.error
              }
              $('#main-content').html(template.error(error))
            } else {
              setStorage(response.user.api_token, response.user.username)
              loginToggle()
            }
            resetForm('#login-form')
          })
          .fail((status, textStatus, xhr) => {
            error = {
              code: status,
              textStatus: textStatus,
              message: xhr
            }
            $('#main-content').html(template.error(error))
          })
        $('#login-modal').modal('hide')
      })
  }

  function bindSignupSubmissionEvent() {
    $('#signup-form').on('submit', (ev) => {
        ev.preventDefault()
        $.post(apiBase + '/users', $('#signup-form').serialize())
          .done((response) => {
            setStorage(response.user.api_token, response.user.username)
            loginToggle()
          })
          .fail((status, textStatus, xhr) => {
            error = {
              code: status,
              textStatus: textStatus,
              message: xhr
            }
            $('#main-content').html(template.error(error))
          })
        $('#signup-modal').modal('hide')
      })
  }

  $('#logout-link').on('click', (ev) => {
    ev.preventDefault()
    logout()
    loginToggle()
  })


  /*
      URL hash suffix catcher
                               */

  $(window).on('hashchange', (ev) => {
    ev.preventDefault()
    noteID = location.hash.substring(1)
    $.get(`${apiBase}/notes/${noteID}`)
      .done((response) => {
        $('#note-modal-container').html(
            template.noteModal(response.note)
          )
        $('#note-modal').modal('show')
      })
  })


  /*
      Kick-off
                */

  buildModal('login', bindLoginSubmissionEvent)
  buildModal('signup', bindSignupSubmissionEvent)

  loginToggle()

})
