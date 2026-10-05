@'
import { EventBus } from "./core/EventBus.js";
import { EVENTS } from "./core/events.js";
import { GameState } from "./core/GameState.js";
import { Inventory } from "./systems/Inventory.js";
import { QuestSystems } from "./systems/QuestSystems.js";
import { ResourceSystem } from "./systems/ResourceSystem.js";
import { QUESTS } from "./data/quests.js";
import { RESOURCE_TYPES } from "./data/resources.js";
import * as ITEMS_MODULE from "./core/items.js";

const ITEMS = ITEMS_MODULE.ITEMS ?? ITEMS_MODULE.ITEM_DEFINITIONS ?? ITEMS_MODULE.default;

if (!ITEMS) {
  throw new Error(
    "Could not find an item catalog export in src/game/core/items.js."
  );
}

export function createGame() {
  const events = new EventBus();

  const state = new GameState({
    eventBus: events,
  });

  const inventory = new Inventory({
    state,
    eventBus: events,
    itemCatalog: ITEMS,
  });

  const quests = new QuestSystems({
    state,
    eventBus: events,
    inventory,
    questCatalog: QUESTS,
  });

  const resources = new ResourceSystem({
    state,
    eventBus: events,
    inventory,
    resourceCatalog: RESOURCE_TYPES,
  });

  return {
    events,
    state,
    inventory,
    quests,
    resources,

    constants: {
      EVENTS,
      QUESTS,
      RESOURCE_TYPES,
      ITEMS,
    },

    getState() {
      return state.getSnapshot();
    },
  };
}

export { EVENTS };
'@ | Set-Content .\src\game\index.js