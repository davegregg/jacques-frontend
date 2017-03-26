$(document).ready(function() {

    apiBase = "http://localhost:3000/api"


    /*
        Utilities
                   */

    function set_token(token) {
        localStorage.setItem('token', token);
    }

    function get_token() {
        return localStorage.getItem('token')
    }

    function log_out() {
        localStorage.removeItem('token')
    }

    function signed_in() {
        return (localStorage.getItem('token') === null) ? false : true
    }

    function toggle_sign_in() {
        if (signed_in()) {
            $('.logged-out').hide()
            $('.logged-in').show()
        } else {
            $('.logged-in').hide()
            $('.logged-out').show()
        }
    }

    function reset_form(form_id) {
        $(form_id)[0].reset()
    }


    /*
        Handlebars Templates
                              */

    var template = Handlebars.compile($("#notes-template").html())
    var errorsTemplate = Handlebars.compile($("#errors-template").html())
    var modalsTemplate = Handlebars.compile($("#modal-template").html())


    /*
        Load notes
                    */

    $.ajax({
            url: apiBase + '/notes',
            data_type: 'json'
        })
        .done((response) => {
            $("#main-content").append(
              template(response)
            )
            $("#main-content").find('.note-tags').tagsinput()
        })
        .fail((status, textStatus, xhr) => {
            error = {
                code: status,
                textStatus: textStatus,
                message: xhr
            }
            $("#main-content").html(errors_template(error))
        })


    $('#new_note_form').on('submit', (ev) => {
        ev.preventDefault()
        $.post(apiBase + '/notes?token=' + get_token(), $(this).serialize())
            .done((note) => {
                $('#note_list').prepend(
                    note_display(note)
                )
                reset_form('#post_note')
            })
    })



    $('#logout').on('click', (ev) => {
        ev.preventDefault()
        log_out()
        toggle_sign_in()
    })

    function bindLoginSubmissionEvent() {
        $('#login-form').on('submit', (ev) => {
            ev.preventDefault()
            alert("We've caught the login form submission and are about to post!")
            $.post(apiBase + "/login", $(this).serialize())
                .done((response) => {
                    set_token(response.token)
                    reset_form('#login')
                    toggle_sign_in()
                })
        })
    }

    function bindSignupSubmissionEvent() {
        $('#signup-form').on('submit', function(ev) {
            ev.preventDefault()
            alert("We've caught a signup submission event!")
            $.post(apiBase + "/users", $(this).serialize())
                .done((response) => {
                    set_token(response.token)
                    toggle_sign_in()
                })
        })
    }


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
        if(typeof bindModalFormSubmission !== 'undefined'){ // if arg supplied
          bindModalFormSubmission()
        }
    }

    buildModal('login', bindLoginSubmissionEvent)
    buildModal('signup', bindSignupSubmissionEvent)

    toggle_sign_in()
})
