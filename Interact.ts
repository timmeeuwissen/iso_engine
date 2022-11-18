class Interact 
    mouseDown: (e) ->
    mouseUp: (e) ->
    mouseMove: (e) ->

    attach: ->
        canvas.bind 'mousedown', mouseDown
        canvas.bind 'mouseup', mouseUp
        canvas.bind 'mousedown', mouseDown
