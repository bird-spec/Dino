# Dino 4D - Gameplay/Systems
## Week 1 Progress (This is a 2 week project)

Developer: Rishthepro
Role: gameplay,systems, etc.

----

## Week 1 Completed:

The following systems were implemented during the first week:

-GameState
-EventBus
-Inventory
-ResourceSystem
-QuestSystem
-InteractionSystem
-SaveSystem
-Item data
-Resource Data
-Quest Data
-Shared gameplay events
-Error handling
-Input Validation
-Modular ES Module architecture
-Versioned game-state structure
-Save-state structure

---

##Architecture

The gameplay layer follows an event-driven architecture.

```text
GameState
|
+--- Inventory
|
+--- ResourceSystem
|
+--- QuestSystem
|
+--- SaveSystem
|
+--- EventBus

## Week 2 plans:
- Writing tests for all of these to verify proper functioning
- Further developing, adding details and improving these systems to have better gameplay experience.