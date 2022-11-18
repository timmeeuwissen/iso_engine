# maintains the state of the map

class Map 
    @map = {}
    @EntityMemory = new EntityMemory

    # maintains properties of a tile in the map
    set_map_position: (x, z, height = null, sizeX = 1, sizeZ = 1, entityObject) ->
        entityMemoryReference = @EntityMemory.add_entity(entityObject) if entityObject?
        @map[x] = [] unless x of @map
        @map[x][z] = {height, sizeX, sizeZ, entityMemoryReference}
        if sizeX > 1 || sizeZ > 1
            for refTargetX in [0..sizeX-1]
                for refTargetZ in [0..sizeZ-1]
                    set_reference x+refTargetX, z+refTargetZ, x, z if refTargetX || refTargetZ

    # when tiles are bigger, reference resolvers are introduced.
    set_reference: (x, z, refX, refZ) ->
        @map[x] = [] unless x of @map
        @map[x][z] = {resolver = (callback) => {callback refX, refZ}, refX, refZ}

    # gets the item on a map, even if it is part of an earlier, bigger structure.
    # when that is the case you get where your exact hit was, but also obtain the higher structure.
    get_map_at: (x, z) ->
        unless @map[x]?[z]? return null # no map specifications means default initial draw
        exactPosition = @map[x][z]
        if 'resolver' of exactPosition
            parentPosition = exactPosition.resolver get_map_at
            return {...parentPosition, exact: exactPosition}
        else return exactPosition