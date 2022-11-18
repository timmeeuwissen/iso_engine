class Draw 
    constructor: (@canvas, {@level, @tile, @dims}, @width, @height) ->
        window.canvas = $('#drawn').get(0)
        @ctx = canvas.getContext('2d')
        
        # TODO: calculate the actual movement when the tile is projected in iso perspective
        # TODO: the incline of the perspective should be 30 percent
        @tile_draw_x = 12
        @tile_draw_y = 12 / 3 * 2
        
        @start_pos = {x: width / 2, y: height}
    
    load_map: (@map) ->
        redraw
    
    set_interact_strategy: (@interact_strategy) ->        
    
    draw_grid: ({x, z}) -> 
        @ctx.lineJoin = "round";
        @ctx.lineCap = "round";
        @ctx.strokeStyle = "#000";
        @ctx.lineWidth = 1;
        
        # draw an isometric square
        ctx.moveTo @start_pos.x + (x - 1) * @tile_draw_x, @start_pos.y + (z - 1) * @tile_draw_y
        ctx.lineTo @start_pos.x + x * 0.5 * @tile_draw_x, @start_pos.y + z * 0.5 * @tile_draw_y
        ctx.lineTo @start_pos.x + (x - 1) * @tile_draw_x, @start_pos.y + z * @tile_draw_y
        ctx.lineTo @start_pos.x - x * 0.5 * @tile_draw_x, @start_pos.y + z * 0.5 * @tile_draw_y
        ctx.lineTo @start_pos.x + (x - 1) * @tile_draw_x, @start_pos.y + (z - 1) * @tile_draw_y
        
    redraw: ->
        for x in [1..@dims.x] 
            for z in [1..@dims.z]
                draw_grid x,z
        if @interact_strategy
            @interact_strategy.attach canvas
            