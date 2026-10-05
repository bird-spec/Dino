export const EVENTS = Object.freeze({
    GAME_STARTED: 'game:started',
    STATE_CHANGED: 'state_changed',
    ERROR: 'game:error',

    INVENTORY_CHANGED: 'inventory:changed',
    ITEM_ADDED: 'inventory:itemAdded',
    ITEM_REMOVED: 'inventory:itemRemoved',

    RESOURCE_NODE_REGISTERED: 'resource:nodeRegistered',
    RESOURCE_HARVESTED: 'resource:harvested',
    RESOURCE_RESPAWNED: 'resource:respawned',

    QUEST_STARTED: 'quest:started',
    QUEST_PROGRESS: 'quest:progress',
    QUEST_COMPLETED: 'quest:completed',
    QUEST_FAILED: 'quest:failed',

    INTERACTION_REGISTERED: 'interaction:registered',
    INTERACTION_USED: 'interaction:used',

    SAVE_COMPLETED: 'save:completed',
    LOAD_COMPLETED: 'load:completed',

    STORY_FLAG_CHANGED: 'story:flagChanged',
    TIME_ADVANCED: 'time:advanced',
    ERA_CHANGED: 'era:changed',
    ERA_UNLOCKED: 'era:unlocked',

    DIALOGUE_STARTED: 'dialogue:started',
    DIALOGUE_CHOICE: 'dialogue:choice',
    DIALOGUE_ENDED: 'dialogue:ended',

    CRAFTED: 'crafting:crafted',

    ROCKET_PART_INSTALLED: 'rocket:partInstalled',
    ROCKET_LAUNCHED: 'rocket:launched',
    HYPERSPACE_ENTERED: 'hyperspace:entered',
    HYPERSPACE_PHASE_CHANGED: 'hyperspace:phaseChanged',
    HYPERSPACE_EXITED: 'hyperspace:exited', });
