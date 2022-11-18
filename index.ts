canvas = $('#drawn').get(0)

interact_strategy = new Interact

draw = new Draw canvas, config.terrain
draw.load_map map
draw.set_interact_strategy interact_strategy
