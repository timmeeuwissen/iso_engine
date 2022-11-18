# for now a multiton
class EntityMemory 
    @entities = {}
    
    add_entity: (entity) ->
        unique = entity.get_unique
        @entities[unique] = entity unless unique of @entities 
        unique
    
    get_entity: (unique) -> 
        @entities[unique]