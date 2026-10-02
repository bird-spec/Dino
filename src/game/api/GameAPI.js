import { EventBus} from "../core/EventBus.js";
import {createDefaultState, GameState} from "../core/GameState.js";
import { EVENTS} from "../core/events.js";

import {ITEMS} from "../core/items.js";
import {RESOURCE_TYPES} from "../data/resources.js";
import {QUESTS} from "../data/quests.js";
import {NPCS} from "../data/npcs.js";
import {DIALOGUES} from "../data/dialogues.js";
import { RECIPES} from "../data/recipes.js";
import {ROCKET_PARTS} from "../data/rocket.js";
import {ERAS} from "../data/eras.js";

import{Inventory} from "../systems/Inventory.js";
import {ResourceSystem} from "../systems/ResourceSystem.js";
import {QuestSystems} from "../systems/QuestSystems.js";
import{InteractionSystem} from "../systems/InteractionSystem.js";
import {
    SaveSystem,
    LocalStorageAdapter,
    MemoryStorageAdapter
} from "../systems/SaveSystem.js";

import {StoryFlagSystem} from "../systems/StoryFlagSystem.js";

import { WorldTimeSystem} from "../systems/WorldTimeSystem.js";

import {EraSystem} from "../systems/EraSystem.js";
import {NpcSystem} from "../systems/NpcSystem.js";
import { DialogueSystem} from "../systems/DialogueSystem.js";
import {CraftingSystem} from "../systems/CraftingSystem.js";

import {HyperspaceSystem} from "../systems/HyperspaceSystem.js";

import { RocketSystem} from "../systems/RocketSystem.js";

export function createGameAPI({
    initialState = undefined,
    storage = undefined,
    storagePrefix = 'dino4d',
    clock = () => Date.now(),
    eventBus = undefined,
                              } = {}) {
    const events = eventBus ?? new EventBus();

    const state = new GameState({eventBus: events, initialState});

    const inventory = new Inventory({
        state,
        eventBus: events,
        itemCatalog: ITEMS
    });

    const resources = new ResourceSystem({
        state, eventBus: events, inventory, resourceCatalog: RESOURCE_TYPES
    });

    const quests = new QuestSystems({
        state,eventBus: events,
        inventory,
        questCatalog: QUESTS
    });

    const interactions = new InteractionSystem({state, eventBus: events,inventory, clock});

    const saveStorage = storage ?? ( typeof localStorage !== 'undefined' ? new LocalStorageAdapter(storagePrefix): new MemoryStorageAdapter());

    const save =
        new SaveSystem({
            state,
            eventBus: events,
            storage: saveStorage,
            prefix: storagePrefix
        });

    const storyFlags =
        new StoryFlagSystem({
            state,
            eventBus: events,
        });

    const time =
        new WorldTimeSystem({
            state,
            eventBus: events,
        });

    const era =
        new EraSystem({
            state,
            eventBus: events,
            eraCatalog: ERAS,
            storyFlags
        });

    const npcs =
        new NpcSystem({
            state, npcCatalog: NPCS
        });

    const dialogue =
        new DialogueSystem({
            state,
            eventBus: events,
            dialogueCatalog: DIALOGUES,
            inventory,
            quests,
            storyFlags,
            time,
            npcSystem:
            npcs
        });

    const crafting =
        new CraftingSystem({
            state,
            eventBus: events,
            inventory,
            recipes: RECIPES,
            storyFlags,
            time
        })

    const hyperspace =
        new HyperspaceSystem({
            state,
            eventBus: events,
            eraSystem: era
        });

    const rocket =
        new RocketSystem({
            state, eventBus: events,
            inventory,
            parts: ROCKET_PARTS,
            storyFlags,
            eraSystem: era,
            hyperspace
        });

    const api = {
        getState: () =>
            state.getSnapshot(),

        events: {
            on: (
                name, listener ) =>
                events.on(name, listener),
            once: (
                name, listener) =>
                events.once(name, listener),

            off: (name, listener) =>
                events.off(name, listener
            )
        },

        inventory: {
            get: (
                itemId
            ) =>
                inventory.getQuantity(itemId),
            has: (
                itemId, quantity = 1
            ) =>
                inventory.has (itemId, quantity),

            list: () =>
                inventory.list(),

            capacity: ()=>
                inventory.getCapacity(),

            usedSlots: () =>
                inventory.getUsedSlots(),
            freeSlots: () =>
                inventory.getFreeSlots(),

            add: (
                itemId,
                quantity = 1,
                options = {}
            ) =>
                inventory.add (itemId, quantity, options),

            remove: (
                itemId,
                quantity = 1,
                options = {}
            ) =>
                inventory.remove (itemId, quantity, options)
        },

        resources: {
            registerNode:
                (
                    definition
                ) => resources.registerNode(definition),

            getNode: (
                id
            ) => resources.getNode(id),

            getNodeQuantity: (
                id
            ) => resources.getNodeQuantity(id),

            listNode: () =>
                resources.listNodes(),

            harvest: (
                nodeId,
                units = 1,
                options = {}
            ) =>
                resources.harvest(
                    nodeId,
                    units,
                    options
                ),
            respawn: (
                nodeId,
                quantity
            ) =>
                resources.respawn(
                    nodeId,
                    quantity,
                )
        },

        quests: {
            getDefinition: (
                id
            ) => quests.getDefinition(id),

            start: (
                id
            ) =>
                quests.start(id),
            get: (
                id
            ) =>
                quests.getState(id),
            completed: () =>
                quests.getCompleted(),
            isActive: (
                id
            ) =>
                quests.isActive(id),
            isCompleted: (
                id
            ) =>
                quests.isCompleted(id),

            updateObjective: (
                questId,
                objectiveId,
                amount =1
            ) =>
                quests.updateObjective(
                    questId,
                    objectiveId,
                    amount
                ),

            fail: (
                id,
                reason
            ) =>
                quests.fail(
                    id, reason
                )
        },

        interactions: {
            register:
                (
                    definition
                ) => interactions.register(definition),
            unregister: (
                id
            ) => interactions.unregister(id),
            get: (
                id
            ) =>
                interactions.interact(id),
            canUse: (id,context={}) =>
                interactions.canInteract(id,context),

            use:(id,context = {}) =>
                interactions.interact(id,context),
            uses: (id) =>
                state.read(
                    (gameState) => gameState.interactions[id]?.uses ?? 0
                )
        },

        save: {
            save: (
                slot = 'default'
            ) =>
                save.save(slot),

            has: (
                slot = 'default'
            ) =>
                save.has(slot),
            load: (
                slot = 'default'
            ) => save.load(slot),
            delete: (
                slot = 'default'
            ) =>
                save.delete(slot)
        },
        story: {
            get: (
                key, defaultValue=false
            ) =>
                storyFlags.get(key,defaultValue),
            has: (
                key
            ) =>
                storyFlags.has(key),
            set: (
                key,value = true, options = {}
            ) =>
                storyFlags.set(
                    key,value,options
                ),
            clear: (
                key,
                options = {}
            ) =>
                storyFlags.clear(key, options),

            all: () =>
                storyFlags.all()
        },

        time: {
            get: () =>
                time.get(),

            advance: (
                seconds,options = {}
            ) =>
                time.advance(seconds, options),
            set: (
                seconds,
                options = {}
            ) =>
                time.setElapsedSeconds(seconds, options)
        },

        era: {
            current: () =>
                era.getCurrent(),
            currentId: () =>
                era.getCurrentId(),

            unlock: (
                id,options = {}
            )  =>
            era.setCurrent(id,options)
        },

        npcs: {
            get:(id) => npcs.get(id),

            list: () => npcs.list(),

            register: (
                npc
            ) => npcs.register(npc),

            markDiscovered: (
                id
            ) => npcs.markDiscovered(id),

            isDiscovered: (
                id
            ) => npcs.isDiscovered(id),
        },

        dialogue: {
            start:(
                id, options = {}
            ) =>
                dialogue.start(
                    id,
                    options
                ),

            current: ( choiceId) =>
                dialogue.choose(choiceId),

            end: (
                reason
            ) =>
                dialogue.end(reason)
        },

        crafting: {
            recipe: (id) =>
                crafting.getRecipe(id),
            recipes: () =>
                crafting.listRecipes(),
            canCraft: (
                id,
                quantity = 1,
                options = {}
            ) =>
                crafting.canCraft(
                    id,
                    quantity,
                    options
                ),

            craft: (
                id,
                quantity = 1,
                options = {}
            ) =>
                crafting.craft(
                    id,
                    quantity,
                    options
                )
        },

        rocket: {
            parts: () =>
                rocket.getParts(),
            progress: () =>
                rocket.getProgress(),
            hasAllParts: () =>
                rocket.hasAllParts(),
            canLaunch: () =>
                rocket.canLaunch(),
            installPart: (
                partId
            ) =>
                rocket.installPart(partId),
            launch: (
                options = {}
            ) =>
                rocket.launch(options)
        },

        hyperspace: {
            getState: () =>
                hyperspace.getState(),
            enter: (
                options = {}
            ) =>
                hyperspace.enter(options),

            setPhase: (
                phase
            ) =>
                hyperspace.setPhase(phase),

            onEnter: (
                callback
            ) =>
                hyperspace.registerHook(
                    'onEnter',
                    callback
                ),
            onPhaseChanges:(
                callback
            ) =>
                hyperspace.registerHook(
                    'onPhaseChange',
                    callback
                ),
            onExit: (
                callback
            ) =>
                hyperspace.registerHook(
                    'onExit',
                    callback
                )
        },

        constants: {
            EVENTS,
            ITEMS,
            RESOURCE_TYPES,
            QUESTS,
            NPCS,
            DIALOGUES,
            RECIPES,
            ROCKET_PARTS,
            ERAS
        }
    };

    events.emit(
        EVENTS.GAME_STARTED,
        {
            state:
            state.getSnapshot()
        }
    );
    return api
}