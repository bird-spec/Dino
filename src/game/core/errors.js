export class GameError extends Error {
    constructor(message, code = 'GAME_ERROR', details = undefined) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;

    }
}
export class ValidationError extends GameError {
    constructor(message,details) {
        super(message, 'VALIDATION_ERROR', details);
    }
}

export class InventoryError extends GameError {
    constructor(message,details) {super(message, 'INVENTORY_ERROR', details);}
}
export class QuestError extends GameError {
    constructor(message,details)
    {super(message, 'QUEST_ERROR', details);}
}
export class InteractionError extends GameError {
    constructor(message,details) {super(message, 'INTERACTION_ERROR', details);}
}
export class NotFoundError extends GameError {
    constructor(message,details) {
        super(message, 'NOT_FOUND', details);
    }
}
export class SaveError extends GameError {
    constructor(message,details) {super(message, 'SAVE_ERROR', details);}
}
