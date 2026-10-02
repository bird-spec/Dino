# Week 2 Progress – Dino: 4D Hyperspace

This document is the Week 2 continuation of the Week 1 README. It records the gameplay/core systems work completed during Week 2, the integration approach, the Week 1 tests that were added and debugged, and the current test status.

## Project Context

**Game:** Dino: 4D Hyperspace
**Role:** Gameplay / Systems
**Main focus:** Gameplay state, progression, interactions, resources, quests, inventory, time/era systems, rocket progression, hyperspace, saving, and clean integration with the rest of the project.

The gameplay code is kept isolated under the gameplay/core game code so that it can be merged with the other team members' work without requiring changes to their rendering, world, or runtime systems.

---

# Week 2 Work

## 1. Gameplay Systems Architecture

Week 2 continued the modular gameplay architecture established during Week 1.

The systems communicate through shared game state and the `EventBus` rather than depending directly on the rendering/world implementation.

Key principles used:

* Systems are separated into individual classes.
* Game state is centralized in `GameState`.
* Events are centralized in `src/game/core/events.js`.
* Data definitions are kept separate from system logic.
* The public interface is exposed through `GameAPI`.
* Gameplay systems do not need to know about Three.js objects.
* State can be serialized and restored for save/load.
* Systems use IDs and plain data objects for communication.

## 2. Central Game API

`src/game/api/GameAPI.js` was used as the main public entry point for the gameplay systems.

The API provides access to systems such as:

* Inventory
* Resources
* Quests
* Interactions
* Save/load
* Story flags
* World time
* Eras
* NPCs
* Dialogue
* Crafting
* Rocket progression
* Hyperspace

This keeps the underlying systems modular while giving the rest of the game one consistent interface.

## 3. Game State

`GameState` provides the shared state used by the gameplay systems.

The state contains sections for:

* Player data and XP
* Inventory
* Resource nodes
* Active/completed/failed quests
* Interactions
* Story flags
* Era/progression state
* World time
* Rocket progression
* Dialogue state
* Hyperspace state
* World/NPC discovery data

The state system also validates required state sections and supports snapshots, mutations, replacement, and event emission.

## 4. Event System

The `EventBus` and centralized `EVENTS` definitions were used to decouple gameplay systems.

Examples of events defined for the project include:

* `game:started`
* `inventory:changed`
* `inventory:itemAdded`
* `inventory:itemRemoved`
* `resource:nodeRegistered`
* `resource:harvested`
* `resource:respawned`
* `quest:started`
* `quest:progress`
* `quest:completed`
* `quest:failed`
* `interaction:registered`
* `interaction:used`
* `save:completed`
* `load:completed`
* `story:flagChanged`
* `time:advanced`
* `era:changed`
* `era:unlocked`
* `crafting:crafted`
* Rocket and hyperspace events

This allows systems to react to gameplay events without directly coupling to each other.

## 5. Interaction System

The interaction system was implemented as a data-driven system.

Interactions can:

* Be registered and unregistered.
* Have an ID and type.
* Run a handler.
* Have custom conditions.
* Require inventory items.
* Require story flags.
* Require completed quests.
* Be one-time interactions.
* Use cooldowns.
* Track the number of times they have been used.

The public API exposes interaction registration, lookup, checking whether an interaction can be used, using an interaction, and reading its usage count.

## 6. Resource System

The resource system manages world resource nodes such as stone, water, plants, obsidian, and resin.

Resource nodes contain:

* ID
* Resource type
* Current quantity
* Maximum quantity
* Respawn information
* Metadata

The system supports:

* Registering resource nodes
* Getting nodes
* Reading node quantities
* Harvesting resources
* Adding harvested items to the inventory
* Limiting harvesting to the quantity remaining
* Respawning resources
* Preventing respawns above the maximum

Resource definitions are stored separately from the system logic.

## 7. Quest System

The quest system supports data-driven progression.

Implemented functionality includes:

* Starting quests
* Tracking active quests
* Tracking completed and failed quests
* Quest prerequisites
* Objective progress
* Automatic progress from gameplay events
* Manual objective updates
* Automatic completion
* Item rewards
* XP rewards
* Story flag rewards
* Quest state retrieval

Quest completion is integrated with the inventory and player progression systems.

## 8. Inventory System

The inventory system was completed and integrated with the other gameplay systems.

It supports:

* Adding items
* Removing items
* Checking quantities
* Checking whether enough items are available
* Capacity management
* Used/free slot calculation
* Stack sizes
* Bundle capacity checks
* Clearing the inventory
* Item validation

The inventory is also used by quests, resources, and interactions.

## 9. Save / Load System

Save functionality was integrated through the `GameAPI`.

The save system supports:

* Saving game state to named slots
* Loading saved state
* Checking whether a save exists
* Deleting saves
* Memory storage for tests
* Local storage support

Save/load was tested with inventory state and quest progress.

## 10. Story Flags

Story flags provide a simple state-based progression mechanism.

They can be:

* Set
* Read
* Checked
* Cleared
* Listed

Story flags can also be used as requirements for interactions and can be changed as part of progression.

## 11. World Time

The World Time system was included as a separate gameplay system for tracking game time.

It provides an abstraction for gameplay time rather than tying gameplay logic directly to real-world time.

This keeps time-dependent gameplay systems modular.

## 12. Era / Time-Progression Systems

Era progression was separated from the rest of the gameplay logic.

The system tracks:

* Current era
* Unlocked eras
* Era definitions
* Progression requirements

This provides a foundation for the game's time-travel structure and allows other gameplay systems to react to era changes.

## 13. Rocket Progression

Rocket progression was implemented as a dedicated system.

The rocket system tracks the player's progression toward the rocket launch through:

* Rocket parts
* Part installation
* Rocket completion state
* Fuel cells
* Launch progression
* Launch requirements
* Launch interaction with hyperspace

The rocket uses IDs and state data rather than rendering objects, keeping it independent from the 3D implementation.

## 14. Hyperspace

The hyperspace system was separated from rocket logic.

It tracks:

* Hyperspace active/inactive state
* Current hyperspace phase
* Destination
* Transit count
* Enter/phase/exit hooks

This allows the rendering/runtime side of the project to react to gameplay state without the gameplay system needing direct knowledge of Three.js.

## 15. Crafting

Crafting was included as a separate system using data-driven recipe definitions.

The system provides:

* Recipe lookup
* Recipe listing
* Crafting requirement checks
* Crafting execution
* Integration with inventory
* Story progression requirements

## 16. NPC / Dialogue Integration

NPC and dialogue systems were kept separate from the core gameplay systems.

The gameplay architecture exposes them through the `GameAPI`, while the underlying gameplay systems communicate through IDs and state rather than depending on rendered NPC objects.

This allows the frontend/world team to integrate their own representations independently.

---

# Week 2 Integration Strategy

The main integration goal for Week 2 was to make the gameplay code mergeable without modifying the other developers' systems.

The integration approach is:

```text
Gameplay Systems
       |
       v
    GameState
       |
       +---- EventBus ----> Other Systems
       |
       v
    GameAPI
       |
       v
Main Game / Frontend / World
```

Gameplay logic is kept independent of:

* Three.js objects
* Rendering code
* World implementation details
* Camera/controls
* Frontend UI implementation

The game can therefore call gameplay APIs without importing internal implementation details.

For example, instead of passing a Three.js object to the inventory or quest system, the system works with:

```js
{
    itemId: 'stone',
    quantity; 3
}
```

This makes the gameplay code easier to merge and easier for the other developers to consume.

---

# Week 1 Tests Added During This Work

The Week 1 test suite was written using Node's built-in test runner:

```bash
node --test
```

The final suite contains **32 tests** covering the Week 1/core gameplay systems.

## Interaction Tests

`test/interaction.test.js`

The tests cover:

* Registering and using an interaction
* Tracking interaction usage counts
* One-time interactions
* Item requirements
* Story flag requirements
* Completed quest requirements

## Inventory Tests

`test/inventory.test.js`

The tests cover:

* Adding items
* Removing items
* Checking inventory quantities
* Checking whether enough items are available
* Preventing removal of unavailable quantities
* Rejecting invalid quantities
* Default inventory capacity
* Used/free slot calculations
* Rejecting unknown items

## Quest Tests

`test/quest.test.js`

The tests cover:

* Starting quests
* Automatic objective progression
* Automatic quest completion
* Item rewards
* XP rewards
* Quest prerequisites
* Manual objective updates
* Unknown quest handling

## Resource Tests

`test/resource.test.js`

The tests cover:

* Registering resource nodes
* Harvesting resources
* Correct item output
* Preventing harvesting beyond the remaining quantity
* Respawning resources
* Preventing respawn above the maximum quantity
* Unknown resource node handling

## Save Tests

`test/save.test.js`

The tests cover:

* Saving current state
* Checking whether a save exists
* Loading saved state
* Restoring inventory state
* Restoring quest progress
* Rejecting invalid save slot names

The save tests use:

```js
MemoryStorageAdapter
```

so they do not depend on browser local storage during testing.

---

# Testing / Debugging Work

Several shared implementation issues were found and corrected while getting the Week 1 tests working.

Important fixes included:

* Correcting `assertNonEmptyString()` so it validates strings rather than integers.
* Passing `itemCatalog` correctly to `Inventory`.
* Correcting resource state access from `state.resource` to `state.resources`.
* Correcting the `getDefinition` spelling used by the quest completion path.
* Correcting quest and resource error messages.
* Correcting `GameAPI` save/load method mappings.
* Correcting quest state access through `GameAPI`.
* Correcting interaction API mappings.
* Correcting several test assumptions and malformed test assertions.
* Aligning resource yield definitions with the expected harvesting behavior.

The test suite was progressively reduced from widespread failures to a fully passing core suite.

---

# Current Test Command

From the project root:

```bash
node --test
```

The expected final state for the Week 1/core suite is:

```text
tests: 32
pass: 32
fail: 0
```

---

# Week 2 Testing Approach

A separate full Week 2 test suite was not treated as a requirement.

Instead, the Week 2 focus was:

1. Building and debugging the new systems.
2. Keeping the systems modular and mergeable.
3. Running the established Week 1/core test suite after changes.
4. Manually smoke-testing the new Week 2 gameplay paths.
5. Verifying that Week 2 changes do not break the shared gameplay core.

This keeps development focused on implementation and integration while still protecting the existing gameplay foundation.

---

# Files / Areas Worked On

The main gameplay/core areas involved in this work include:

```text
src/game/
├── api/
│   └── GameAPI.js
├── core/
│   ├── EventBus.js
│   ├── GameState.js
│   ├── events.js
│   ├── errors.js
│   └── utils.js
├── data/
│   └── gameplay definitions
└── systems/
    ├── Inventory.js
    ├── InteractionSystem.js
    ├── QuestSystems.js
    ├── ResourceSystem.js
    ├── SaveSystem.js
    ├── StoryFlagSystem.js
    ├── WorldTimeSystem.js
    ├── EraSystem.js
    ├── CraftingSystem.js
    ├── NpcSystem.js
    ├── DialogueSystem.js
    ├── RocketSystem.js
    └── HyperspaceSystem.js
```

Tests:

```text
test/
├── interaction.test.js
├── inventory.test.js
├── quest.test.js
├── resource.test.js
└── save.test.js
```

---

# Summary

Week 2 extended the Week 1 gameplay foundation into a larger modular gameplay framework.

The main result is a set of independent systems that:

* Share a validated central game state.
* Communicate through events.
* Expose a consistent API.
* Keep game logic separate from rendering.
* Support progression through quests, resources, inventory, flags, time, and eras.
* Provide rocket and hyperspace progression for the game's time-travel loop.
* Support save/load through serializable game state.
* Remain structured for easier integration with the rest of the Dino: 4D Hyperspace project.

The Week 1/core test suite provides the regression check for the systems that were already implemented while Week 2 adds the higher-level gameplay and progression systems around them.


# AI usage:
AI was used only for debugging and helping with the readme file nothing else.

Made by: Rishthepro (Azure Team)
