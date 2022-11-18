class Entity
    get_unique: () ->
        @unique = Math.random() unless @unique

    get_state_strategy: () ->
        {}
            