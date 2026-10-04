import { EventBus } from "./core/EventBus.js";
import { GameState } from "./core/GameState.js";
import { ITEMS } from "./core/items.js";
import { StoryFlagSystem } from "./systems/StoryFlagSystem.js";
import { WorldTimeSystem } from "./systems/WorldTimeSystem.js";
import { Inventory } from "./systems/Inventory.js";
import { NpcSystem } from "./systems/NpcSystem.js";
import { QuestSystems } from "./systems/QuestSystems.js";
import { ResourceSystem } from "./systems/ResourceSystem.js";
import { CraftingSystem } from "./systems/CraftingSystem.js";
import { DialogueSystem } from "./systems/DialogueSystem.js";
import { EraSystem } from "./systems/EraSystem.js";
import { HyperspaceSystem } from "./systems/HyperspaceSystem.js";
import { InteractionSystem } from "./systems/InteractionSystem.js";
import { RocketSystem } from "./systems/RocketSystem.js";
import {
  SaveSystem,
  LocalStorageAdapter,
  MemoryStorageAdapter,
} from "./systems/SaveSystem.js";
import { UIManager } from "../frontend/StoryIntro.js";
import { ERAS } from "./data/eras.js";
import { NPCS } from "./data/npcs.js";
import { QUESTS } from "./data/quests.js";
import { DIALOGUES } from "./data/dialogues.js";
import { RESOURCE_TYPES } from "./data/resources.js";
import { RECIPES } from "./data/recipes.js";
import { ROCKET_PARTS } from "./data/rocket.js";

export function bootstrapGame() {
  const eventBus = new EventBus();
  const state = new GameState({ eventBus });
  const storyFlags = new StoryFlagSystem({ state, eventBus });
  const time = new WorldTimeSystem({ state, eventBus });
  const inventory = new Inventory({
    state,
    eventBus,
    itemCatalog: ITEMS,
  });
  const npcSystem = new NpcSystem({ state, npcCatalog: NPCS });
  const quests = new QuestSystems({
    state,
    eventBus,
    inventory,
    questCatalog: QUESTS,
  });
  const resources = new ResourceSystem({
    state,
    eventBus,
    inventory,
    resourceCatalog: RESOURCE_TYPES,
  });
  const crafting = new CraftingSystem({
    state,
    eventBus,
    inventory,
    recipes: RECIPES,
    storyFlags,
    time,
  });
  const dialogue = new DialogueSystem({
    state,
    eventBus,
    dialogueCatalog: DIALOGUES,
    inventory,
    quests,
    storyFlags,
    time,
    npcSystem,
  });
  const eras = new EraSystem({ state, eventBus, eraCatalog: ERAS, storyFlags });
  const hyperspace = new HyperspaceSystem({ state, eventBus, eraSystem: eras });
  const interaction = new InteractionSystem({ state, eventBus, inventory });
  const rocket = new RocketSystem({
    state,
    eventBus,
    inventory,
    parts: ROCKET_PARTS,
    storyFlags,
    eraSystem: eras,
    hyperspace,
  });

  let storage;
  try {
    storage = new LocalStorageAdapter();
  } catch {
    storage = new MemoryStorageAdapter();
  }
  const save = new SaveSystem({ state, eventBus, storage });

  // STEP1: UIManager is inert until StoryIntro.js constructor is fixed.
  let ui = null;
  try {
    ui = new UIManager();
  } catch (e) {
    console.warn("[bootstrap] UI unavailable (Step 1 pending):", e);
  }

  quests.start("gather_stone");

  const game = {
    eventBus,
    state,
    storyFlags,
    time,
    inventory,
    npcSystem,
    quests,
    resources,
    crafting,
    dialogue,
    eras,
    hyperspace,
    interaction,
    rocket,
    save,
    ui,
  };

  if (typeof window !== "undefined") window.__game = game;
  return game;
}
