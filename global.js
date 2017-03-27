//TODO: cleanup, re-order, standardize, & refactor (particularly the modal templates)

let siteTitle = 'Notemeister 5000'

let apiBase = window.location.hostname === 'localhost' // following the AirBnB styleguide here
  ? 'http://localhost:3000/api'
  : 'https://deadbeatjacques.herokuapp.com/api'

/*
    Handlebars Templates
                          */

function adopt(el) {
  return Handlebars.compile($(`${el}`).html())
}

let template = {
  notes:     adopt('#notes-template'),
  error:     adopt('#errors-template'),
  modal:     adopt('#modal-template'),
  noteModal: adopt('#note-modal-template')
}

/*
    Misc. Functions
                     */

function showTag(anchor) {
  tag = $(anchor).html()
  $('#banner-heading').html(`${siteTitle}: <span class="text-capitalize">${tag}</span>`)
  $.get(`${apiBase}/notes/tag/${tag}`)
    .done((response) => {
      $('#main-content').html(
          template.notes(response.tag)
        )
    })
}
