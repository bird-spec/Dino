import { EVENTS } from "../game/index.js";

export class FrontendBridge {
  constructor({
    api,
    ui,
  }) {

    if (!api) {
      throw new Error(
        "FrontendBridge requires a game API.",
      );
    }

    if (!ui) {
      throw new Error(
        "FrontendBridge requires a UIManager.",
      );
    }

    this.api = api;
    this.ui = ui;

    this.lastDialogueNode =
      null;

    this.unsubscribe = [];

    this.bind();
    this.syncFromState();
  }


  // =========================================================
  // BIND GAME EVENTS
  // =========================================================

  bind() {

    this.listen(
      EVENTS.QUEST_STARTED,
      () => {

        this.syncQuest();

        this.ui.notify(
          "New quest started",
          "quest",
        );

      },
    );


    this.listen(
      EVENTS.QUEST_PROGRESS,
      () => {

        this.syncQuest();

      },
    );


    this.listen(
      EVENTS.QUEST_COMPLETED,
      (payload) => {

        this.syncQuest();

        this.ui.notify(
          `Quest complete: ${
            this.questTitle(
              payload?.questId,
            )
          }`,
          "success",
          4000,
        );

      },
    );


    this.listen(
      EVENTS.QUEST_FAILED,
      (payload) => {

        this.syncQuest();

        this.ui.notify(
          `Quest failed: ${
            this.questTitle(
              payload?.questId,
            )
          }`,
          "error",
          4000,
        );

      },
    );


    this.listen(
      EVENTS.INVENTORY_CHANGED,
      () => {

        this.syncInventory();

      },
    );


    this.listen(
      EVENTS.ITEM_ADDED,
      (payload) => {

        this.syncInventory();

        if (
          payload?.itemId &&
          payload?.quantity
        ) {

          this.ui.notify(
            `+${payload.quantity} ${
              this.formatItem(
                payload.itemId,
              )
            }`,
            "success",
            2200,
          );

        }

      },
    );


    this.listen(
      EVENTS.ITEM_REMOVED,
      () => {

        this.syncInventory();

      },
    );


    this.listen(
      EVENTS.ERA_CHANGED,
      (payload) => {

        const eraId =
          payload?.eraId ??
          this.api.era.currentId();

        this.syncEra(
          eraId,
        );

        this.ui.notify(
          `Era changed: ${
            this.formatItem(
              eraId,
            )
          }`,
          "warning",
          3500,
        );

      },
    );


    this.listen(
      EVENTS.DIALOGUE_STARTED,
      () => {

        this.syncDialogue();

      },
    );


    this.listen(
      EVENTS.DIALOGUE_CHOICE,
      () => {

        queueMicrotask(
          () => {
            this.syncDialogue();
          },
        );

      },
    );


    this.listen(
      EVENTS.DIALOGUE_ENDED,
      () => {

        this.lastDialogueNode =
          null;

        this.ui.hideDialogue();

      },
    );


    this.listen(
      EVENTS.HYPERSPACE_ENTERED,
      () => {

        this.ui.setTimelineStability(
          60,
        );

        this.ui.notify(
          "Entering Hyperspace",
          "warning",
          3500,
        );

      },
    );


    this.listen(
      EVENTS.HYPERSPACE_PHASE_CHANGED,
      (payload) => {

        const phase =
          payload?.phase ??
          "unknown";


        const stability =
          this.phaseToStability(
            phase,
          );


        this.ui.setTimelineStability(
          stability,
        );

        this.ui.notify(
          `Hyperspace phase: ${
            phase
          }`,
          "info",
          2200,
        );

      },
    );


    this.listen(
      EVENTS.HYPERSPACE_EXITED,
      (payload) => {

        this.ui.setTimelineStability(
          payload?.success === false
            ? 25
            : 100,
        );

      },
    );


    this.listen(
      EVENTS.ROCKET_PART_INSTALLED,
      (payload) => {

        this.ui.notify(
          `Rocket component installed: ${
            this.formatItem(
              payload?.partId ??
                "unknown",
            )
          }`,
          "success",
          3000,
        );

      },
    );


    this.listen(
      EVENTS.ROCKET_LAUNCHED,
      () => {

        this.ui.notify(
          "Rocket launched",
          "warning",
          4000,
        );

      },
    );


    this.listen(
      EVENTS.SAVE_COMPLETED,
      () => {

        this.ui.notify(
          "Game saved",
          "success",
          2200,
        );

      },
    );


    this.listen(
      EVENTS.LOAD_COMPLETED,
      () => {

        this.syncFromState();

        this.ui.notify(
          "Game loaded",
          "success",
          2200,
        );

      },
    );


    this.listen(
      EVENTS.ERROR,
      (payload) => {

        console.error(
          "Game system error:",
          payload,
        );

        this.ui.notify(
          "A game system error occurred.",
          "error",
          4500,
        );

      },
    );


    window.addEventListener(
      "ui:saveRequested",
      () => {

        this.saveGame();

      },
    );


    window.addEventListener(
      "ui:loadRequested",
      () => {

        this.loadGame();

      },
    );


    window.addEventListener(
      "ui:dialogueCloseRequested",
      () => {

        this.closeDialogue();

      },
    );
  }


  // =========================================================
  // EVENT LISTENER HELPER
  // =========================================================

  listen(
    eventName,
    listener,
  ) {

    const unsubscribe =
      this.api.events.on(
        eventName,
        listener,
      );

    this.unsubscribe.push(
      unsubscribe,
    );
  }


  // =========================================================
  // FULL STATE SYNC
  // =========================================================

  syncFromState() {

    const state =
      this.api.getState();


    this.syncEra(
      state.era?.current ??
        "prehistory",
    );


    this.syncInventory(
      state,
    );


    this.syncQuest(
      state,
    );


    this.syncRocket(
      state,
    );


    this.syncHyperspace(
      state,
    );


    if (
      state.dialogue?.active
    ) {

      this.syncDialogue(
        state,
      );

    }
  }


  // =========================================================
  // ERA
  // =========================================================

  syncEra(
    eraId,
  ) {

    const definition =
      this.api.constants
        ?.ERAS?.[eraId];


    this.ui.setEra(
      definition?.name ??
        eraId,
    );
  }


  // =========================================================
  // INVENTORY
  // =========================================================

  syncInventory(
    suppliedState = null,
  ) {

    const state =
      suppliedState ??
      this.api.getState();


    const items =
      state.inventory?.items ??
      this.api.inventory.list();


    const capacity =
      state.inventory?.capacity ??
      this.api.inventory.capacity();


    let usedSlots;

    try {

      usedSlots =
        this.api.inventory.usedSlots();

    } catch {

      usedSlots =
        Object.keys(
          items,
        ).length;

    }


    this.ui.setInventory(
      items,
      capacity,
      usedSlots,
    );
  }


  // =========================================================
  // QUEST
  // =========================================================

  syncQuest(
    suppliedState = null,
  ) {

    const state =
      suppliedState ??
      this.api.getState();


    const active =
      state.quests?.active ??
      {};


    const ids =
      Object.keys(
        active,
      );


    if (
      ids.length ===
      0
    ) {

      this.ui.setQuest(
        "No active quest",
        [],
      );


      this.ui.setObjective(
        "Explore the prehistoric world",
        "Continue exploring to discover the next part of the story.",
      );


      return;
    }


    const questId =
      ids[0];


    const questState =
      active[
        questId
      ];


    const definition =
      this.api.quests.getDefinition(
        questId,
      );


    const objectives =
      definition.objectives.map(
        (definitionObjective) => {

          const current =
            Number(
              questState
                .objectives?.[
                  definitionObjective.id
                ] ??
                0,
            );


          return {
            text:
              definitionObjective.title,

            current,

            target:
              definitionObjective.target,

            completed:
              current >=
              definitionObjective.target,
          };
        },
      );


    this.ui.setQuest(
      definition.title,
      objectives,
    );


    const next =
      objectives.find(
        (objective) =>
          !objective.completed,
      );


    if (
      next
    ) {

      this.ui.setObjective(
        next.text,
        definition.description,
      );

    } else {

      this.ui.setObjective(
        definition.title,
        "Quest objectives complete.",
      );

    }
  }


  // =========================================================
  // ROCKET
  // =========================================================

  syncRocket(
    suppliedState = null,
  ) {

    const state =
      suppliedState ??
      this.api.getState();


    const parts =
      state.progression
        ?.rocket
        ?.parts;


    if (
      !parts
    ) {
      return;
    }


    const installed =
      Object.values(
        parts,
      ).filter(
        Boolean,
      ).length;


    const total =
      Object.keys(
        parts,
      ).length;


    if (
      installed ===
      total
    ) {

      this.ui.notify(
        "Rocket assembly complete",
        "success",
        2500,
      );

    }
  }


  // =========================================================
  // HYPERSPACE
  // =========================================================

  syncHyperspace(
    suppliedState = null,
  ) {

    const state =
      suppliedState ??
      this.api.getState();


    const hyperspace =
      state.hyperspace;


    if (
      !hyperspace
    ) {
      return;
    }


    if (
      hyperspace.active
    ) {

      this.ui.setTimelineStability(
        this.phaseToStability(
          hyperspace.phase,
        ),
      );

    } else {

      this.ui.setTimelineStability(
        100,
      );

    }
  }


  phaseToStability(
    phase,
  ) {

    switch (
      String(
        phase,
      )
    ) {

      case "charging":
        return 65;

      case "arrival":
        return 40;

      case "complete":
        return 100;

      case "idle":
        return 100;

      default:
        return 50;
    }
  }


  // =========================================================
  // DIALOGUE
  // =========================================================

  syncDialogue(
    suppliedState = null,
  ) {

    const state =
      suppliedState ??
      this.api.getState();


    const active =
      state.dialogue?.active;


    if (
      !active
    ) {

      this.lastDialogueNode =
        null;

      this.ui.hideDialogue();

      return;
    }


    const dialogueDefinition =
      this.api.constants
        ?.DIALOGUES?.[
          active.dialogueId
        ];


    if (
      !dialogueDefinition
    ) {

      console.warn(
        "Missing dialogue definition:",
        active.dialogueId,
      );

      return;
    }


    const node =
      dialogueDefinition
        .nodes?.[
          active.nodeId
        ];


    if (
      !node
    ) {

      console.warn(
        "Missing dialogue node:",
        active.nodeId,
      );

      return;
    }


    const nodeKey =
      `${active.dialogueId}:${active.nodeId}`;


    if (
      this.lastDialogueNode ===
      nodeKey
    ) {
      return;
    }


    this.lastDialogueNode =
      nodeKey;


    const npcDefinition =
      active.npcId
        ? this.api.constants
            ?.NPCS?.[
              active.npcId
            ]
        : null;


    const speaker =
      npcDefinition?.name ??
      active.npcId ??
      "Unknown";


    this.ui.showDialogueNode(
      {
        speaker,
        text:
          node.text ??
          "",
        choices:
          node.choices ??
          [],
      },

      (choiceId) => {

        try {

          /*
           * The current GameAPI exposes the
           * dialogue choice operation through
           * api.dialogue.current().
           */

          this.api.dialogue.current(
            choiceId,
          );

        } catch (
          error
        ) {

          console.error(
            error,
          );

          this.ui.notify(
            error.message ??
              "Unable to select dialogue choice.",
            "error",
            4000,
          );

        }

      },
    );
  }


  // =========================================================
  // SAVE
  // =========================================================

  saveGame() {

    try {

      this.api.save.save(
        "default",
      );

    } catch (
      error
    ) {

      console.error(
        error,
      );

      this.ui.notify(
        error.message ??
          "Save failed.",
        "error",
        4000,
      );

    }
  }


  // =========================================================
  // LOAD
  // =========================================================

  loadGame() {

    try {

      const result =
        this.api.save.load(
          "default",
        );


      if (
        !result
      ) {

        this.ui.notify(
          "No save found.",
          "warning",
          2500,
        );

      }

    } catch (
      error
    ) {

      console.error(
        error,
      );

      this.ui.notify(
        error.message ??
          "Load failed.",
        "error",
        4000,
      );

    }
  }


  // =========================================================
  // CLOSE DIALOGUE
  // =========================================================

  closeDialogue() {

    try {

      this.api.dialogue.end(
        "ui",
      );

    } catch {
      this.ui.hideDialogue();
    }
  }


  // =========================================================
  // HELPERS
  // =========================================================

  questTitle(
    questId,
  ) {

    try {

      return this.api
        .quests
        .getDefinition(
          questId,
        )
        .title;

    } catch {

      return (
        questId ??
        "Unknown quest"
      );
    }
  }


  formatItem(
    value,
  ) {

    return String(
      value ??
        "unknown",
    )
      .replaceAll(
        "_",
        " ",
      )
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase(),
      );
  }


  destroy() {

    for (
      const unsubscribe
      of this.unsubscribe
    ) {

      try {
        unsubscribe();
      } catch {
        // ignore cleanup failures
      }

    }


    this.unsubscribe =
      [];
  }
}