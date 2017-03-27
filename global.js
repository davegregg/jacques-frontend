//TODO: cleanup, re-order, standardize, & refactor (particularly the modal templates)

var siteTitle = 'Notemeister 5000'

/*
    Handlebars Templates
                          */

var template = Handlebars.compile($("#notes-template").html())
var errorsTemplate = Handlebars.compile($("#errors-template").html())
var modalsTemplate = Handlebars.compile($("#modal-template").html())
var noteModalTemplate = Handlebars.compile($("#note-modal-template").html())


$(document).ready(function() {

    apiBase = (window.location.hostname === 'localhost') ? (
        "http://localhost:3000/api"
    ) : (
        "https://deadbeatjacques.herokuapp.com/api"
    )


    /*
        Utilities
                   */

    function set_storage(token, username) {
        localStorage.setItem('token', token)
        localStorage.setItem('username', username)
    }

    function get_token() {
        return localStorage.getItem('token')
    }

    function get_username() {
        return localStorage.getItem('username')
    }

    function log_out() {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
    }

    function signed_in() {
        return (localStorage.getItem('token') === null) ? false : true
    }

    function toggle_sign_in() {
        if (signed_in()) {
            $('.logged-out').hide()
            $('.logged-in').show()
            $('#nav-username').html(`${get_username()} <span class="caret"></span>`)
            $('#new-note-row').show()
        } else {
            $('.logged-in').hide()
            $('.logged-out').show()
            $('#nav-username').html('User <span class="caret"></span>')
            $('#new-note-row').hide()
        }
    }

    function reset_form(form_id) {
        $(form_id)[0].reset()
    }


    /*
        Load notes
                    */

    $.ajax({
            url: apiBase + '/notes',
            data_type: 'json'
        })
        .done((response) => {
            $('#main-content').append(
                template(response)
            )
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
            $('#main-content').html(errorsTemplate(error))
        })


    /*
        New Note Form
                       */

    $('#new_note_form').on('submit', (ev) => {
        ev.preventDefault()
        $.post(`${apiBase}/notes?api_token=${get_token()}`, $('#new_note_form').serialize())
            .done((response) => {
                response.notes = [response.note]
                delete response.note
                $('#main-content').prepend(
                    template(response)
                )
                reset_form('#new_note_form')
                $('#new-note-tags').tagsinput('removeAll')
            })
    })



    $('#logout-link').on('click', (ev) => {
        ev.preventDefault()
        log_out()
        toggle_sign_in()
    })



    /*
        Modals
                */

    function buildModal(name, bindModalFormSubmission) {
        $(`#${name}-modal-container`).html(modalsTemplate({
            modal_name: name,
            modal_body: new Handlebars.SafeString($(`#${name}-modal-body`).html()),
            modal_footer: new Handlebars.SafeString($(`#${name}-modal-footer`).html())
        }))
        $(`#${name}-link`).on('shown.bs.modal', () => { // modal trigger
            $(`#${name}-modal`).focus()
        })
        if (typeof bindModalFormSubmission !== 'undefined') { // if arg supplied
            bindModalFormSubmission()
        }
    }

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
                        $('#main-content').html(errorsTemplate(error))
                    } else {
                        set_storage(response.user.api_token, response.user.username)
                        toggle_sign_in()
                    }
                    reset_form('#login-form')
                })
                .fail((status, textStatus, xhr) => {
                    error = {
                        code: status,
                        textStatus: textStatus,
                        message: xhr
                    }
                    $('#main-content').html(errorsTemplate(error))
                })
            $('#login-modal').modal('hide')
        })
    }

    function bindSignupSubmissionEvent() {
        $('#signup-form').on('submit', (ev) => {
            ev.preventDefault()
            $.post(apiBase + '/users', $('#signup-form').serialize())
                .done(function(response) {
                    set_storage(response.user.api_token, response.user.username)
                    toggle_sign_in()
                })
                .fail((status, textStatus, xhr) => {
                    error = {
                        code: status,
                        textStatus: textStatus,
                        message: xhr
                    }
                    $('#main-content').html(errorsTemplate(error))
                })
            $('#signup-modal').modal('hide')
        })
    }

    buildModal('login', bindLoginSubmissionEvent)
    buildModal('signup', bindSignupSubmissionEvent)

    toggle_sign_in()

})

function showTag(anchor) {
    tag = $(anchor).html()
    $('#banner-heading').html(`${siteTitle}: <span class="text-capitalize">${tag}</span>`)
    $.get(`${apiBase}/notes/tag/${tag}`)
        .done((response) => {
            $('#main-content').html(
                template(response.tag)
            )
        })
}

$(function(){

  $(window).on('hashchange', (ev)=> {
      ev.preventDefault()
      noteID = location.hash.substring(1)
      $.get(`${apiBase}/notes/${noteID}`)
          .done((response)=> {
              $('#note-modal-container').html(
                noteModalTemplate(response.note)
              )
              $('#note-modal').modal('show')
          })
  })

})
