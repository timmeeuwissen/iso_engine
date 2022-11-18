class Entity {
    private unique: string | void

    get_unique() {
        if (this.unique) { 
            return this.unique
        }
        this.unique = Math.random().toString()
        return this.unique
    }

    get_state_strategy() {}
}

export { Entity }