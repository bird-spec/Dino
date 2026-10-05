import { EVENTS } from "../game/core/events.js";

export class FrontendGameController {
  constructor({
    game,
    ui,
    elara = null,
  }) {
    if (!game) {
      throw new Error(
        "FrontendGameController requires the game object.",
      );
    }

    if (!ui) {
      throw new Error(
        "FrontendGameController requires UIManager.",
      );
    }

    this.game = game;
    this.ui = ui;
    this.elara = elara;

    this.unsubscribers = [];

    this.started = false;
    this.dialogueOpen = false;

    this.nearElara = false;
    this.elaraTalkDistance = 4.5;

    this.lastQuestId = null;
    this.lastEra = null;
    this.lastHyperspacePhase = null;
    this.lastRocketProgress = null;

    this.createStatusPanel();
    this.createNpcPrompt();
    this.createDialogueOverlay();

    this.bindGameEvents();
    this.bindKeyboard();

    this.syncEverything();
  }


  // =========================================================
  // EVENT SYSTEM
  // =========================================================

  bindGameEvents() {

    this.listen(
      EVENTS.QUEST_STARTED,
      (payload) => {
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

        const title =
          this.getQuestTitle(
            payload?.questId,
          );

        this.ui.notify(
          `Quest complete: ${title}`,
          "success",
          4000,
        );
      },
    );


    this.listen(
      EVENTS.QUEST_FAILED,
      (payload) => {

        this.syncQuest();

        const title =
          this.getQuestTitle(
            payload?.questId,
          );

        this.ui.notify(
          `Quest failed: ${title}`,
          "error",
          4000,
        );
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
            `+${payload.quantity} ${this.formatName(
              payload.itemId,
            )}`,
            "success",
            2200,
          );
        }
      },
    );


    this.listen(
      EVENTS.ITEM_REMOVED,
      (payload) => {

        this.syncInventory();

        if (
          payload?.itemId
        ) {

          this.ui.notify(
            `-${payload.quantity ?? 1} ${this.formatName(
              payload.itemId,
            )}`,
            "info",
            1800,
          );
        }
      },
    );


    this.listen(
      EVENTS.INVENTORY_CHANGED,
      () => {
        this.syncInventory();
      },
    );


    this.listen(
      EVENTS.ERA_CHANGED,
      (payload) => {

        this.syncEra();

        this.ui.notify(
          `Era changed: ${this.formatName(
            payload?.eraId ??
            this.game.eras.getCurrentId(),
          )}`,
          "warning",
          3200,
        );
      },
    );


    this.listen(
      EVENTS.ERA_UNLOCKED,
      (payload) => {

        this.ui.notify(
          `New era unlocked: ${this.formatName(
            payload?.eraId,
          )}`,
          "success",
          3500,
        );
      },
    );


    this.listen(
      EVENTS.HYPERSPACE_ENTERED,
      (payload) => {

        this.syncHyperspace();

        this.ui.notify(
          "4D Hyperspace entered",
          "warning",
          3200,
        );
      },
    );


    this.listen(
      EVENTS.HYPERSPACE_PHASE_CHANGED,
      (payload) => {

        this.syncHyperspace();

        const phase =
          payload?.phase ??
          "unknown";

        this.ui.notify(
          `Hyperspace: ${this.formatName(
            phase,
          )}`,
          "info",
          1800,
        );
      },
    );


    this.listen(
      EVENTS.HYPERSPACE_EXITED,
      () => {

        this.syncHyperspace();

        this.ui.notify(
          "Hyperspace transition complete",
          "success",
          2500,
        );
      },
    );


    this.listen(
      EVENTS.ROCKET_PART_INSTALLED,
      (payload) => {

        this.syncRocket();

        this.ui.notify(
          `Rocket part installed: ${
            this.formatName(
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

        this.syncRocket();

        this.ui.notify(
          "Rocket launched",
          "warning",
          4000,
        );
      },
    );


    this.listen(
      EVENTS.DIALOGUE_STARTED,
      () => {

        this.openBackendDialogue();
      },
    );


    this.listen(
      EVENTS.DIALOGUE_CHOICE,
      () => {

        window.setTimeout(
          () => {
            this.renderBackendDialogue();
          },
          0,
        );
      },
    );


    this.listen(
      EVENTS.DIALOGUE_ENDED,
      () => {

        this.closeBackendDialogue();
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

        this.syncEverything();

        this.ui.notify(
          "Game loaded",
          "success",
          2500,
        );
      },
    );


    this.listen(
      EVENTS.STORY_FLAG_CHANGED,
      (payload) => {

        if (
          payload?.key
        ) {

          this.updateStatusPanel();
        }
      },
    );


    this.listen(
      EVENTS.CRAFTED,
      (payload) => {

        this.syncInventory();

        this.ui.notify(
          `Crafted: ${
            this.formatName(
              payload?.recipeId ??
              "item",
            )
          }`,
          "success",
          2500,
        );
      },
    );


    this.listen(
      EVENTS.ERROR,
      (payload) => {

        console.error(
          "[FrontendGameController]",
          payload,
        );

      },
    );
  }


  listen(
    eventName,
    callback,
  ) {

    const unsubscribe =
      this.game.eventBus.on(
        eventName,
        callback,
      );

    if (
      typeof unsubscribe ===
      "function"
    ) {

      this.unsubscribers.push(
        unsubscribe,
      );
    }
  }


  // =========================================================
  // KEYBOARD
  // =========================================================

  bindKeyboard() {

    window.addEventListener(
      "keydown",
      (event) => {

        const target =
          event.target;

        const typing =
          target instanceof
            HTMLInputElement ||
          target instanceof
            HTMLTextAreaElement;

        if (
          typing
        ) {
          return;
        }


        // Talk to Elara

        if (
          event.key.toLowerCase() ===
            "e" &&
          this.nearElara &&
          !this.dialogueOpen &&
          !event.repeat
        ) {

          this.startElaraDialogue();

          return;
        }


        // Save

        if (
          event.key.toLowerCase() ===
            "p" &&
          !event.repeat
        ) {

          this.saveGame();

          return;
        }


        // Load

        if (
          event.key.toLowerCase() ===
            "l" &&
          !event.repeat
        ) {

          this.loadGame();

          return;
        }
      },
    );
  }


  // =========================================================
  // SAVE / LOAD
  // =========================================================

  saveGame() {

    try {

      this.game.save.save(
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
        "Could not save game.",
        "error",
        4000,
      );
    }
  }


  loadGame() {

    try {

      if (
        !this.game.save.has(
          "default",
        )
      ) {

        this.ui.notify(
          "No save file exists yet.",
          "warning",
          2500,
        );

        return;
      }


      this.game.save.load(
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
        "Could not load game.",
        "error",
        4000,
      );
    }
  }


  // =========================================================
  // QUEST
  // =========================================================

  syncQuest() {

    const active =
      this.game.quests.getActive();

    const ids =
      Object.keys(
        active,
      );


    if (
      ids.length ===
      0
    ) {

      this.lastQuestId =
        null;

      this.ui.setQuest(
        "No active quest",
        [],
      );

      this.ui.setObjective(
        "Explore the prehistoric world",
        "Continue exploring to discover what is happening.",
      );

      this.updateStatusPanel();

      return;
    }


    const questId =
      ids[0];


    const definition =
      this.game.quests.getDefinition(
        questId,
      );


    const state =
      active[
        questId
      ];


    const objectives =
      definition.objectives.map(
        (objective) => {

          const current =
            Number(
              state.objectives?.[
                objective.id
              ] ??
              0,
            );


          return {
            text:
              objective.title ??
              objective.id,

            completed:
              current >=
              objective.target,
          };
        },
      );


    this.lastQuestId =
      questId;


    this.ui.setQuest(
      definition.title ??
      questId,
      objectives,
    );


    const nextObjective =
      definition.objectives.find(
        (objective) => {

          const current =
            Number(
              state.objectives?.[
                objective.id
              ] ??
              0,
            );

          return (
            current <
            objective.target
          );
        },
      );


    if (
      nextObjective
    ) {

      this.ui.setObjective(
        nextObjective.title ??
        nextObjective.id,

        definition.description ??
        "",
      );

    } else {

      this.ui.setObjective(
        definition.title ??
        questId,

        "Quest objectives complete.",
      );
    }
  }


  getQuestTitle(
    questId,
  ) {

    if (
      !questId
    ) {
      return "Unknown";
    }


    try {

      return (
        this.game.quests
          .getDefinition(
            questId,
          )
          .title ??
        questId
      );

    } catch {

      return questId;
    }
  }


  // =========================================================
  // INVENTORY
  // =========================================================

  syncInventory() {

    const items =
      this.game.inventory.list();


    const capacity =
      this.game.inventory.getCapacity();


    const usedSlots =
      this.game.inventory.getUsedSlots();


    this.updateInventoryPanel(
      items,
      capacity,
      usedSlots,
    );

    this.updateStatusPanel();
  }


  // =========================================================
  // ERA
  // =========================================================

  syncEra() {

    const eraId =
      this.game.eras.getCurrentId();


    const definition =
      this.game.eras.getCurrent();


    this.lastEra =
      eraId;


    this.ui.setEra(
      definition?.name ??
      eraId,
    );


    this.updateStatusPanel();
  }


  // =========================================================
  // HYPERSPACE
  // =========================================================

  syncHyperspace() {

    const state =
      this.game.hyperspace.getState();


    let stability =
      100;


    switch (
      state.phase
    ) {

      case "charging":
        stability = 72;
        break;

      case "arrival":
        stability = 42;
        break;

      case "complete":
        stability = 100;
        break;

      case "idle":
      default:
        stability = 100;
        break;
    }


    if (
      state.active
    ) {

      stability -=
        Math.min(
          state.transitCount * 5,
          25,
        );
    }


    this.ui.setTimelineStability(
      stability,
    );


    this.lastHyperspacePhase =
      state.phase;


    this.updateStatusPanel();
  }


  // =========================================================
  // ROCKET
  // =========================================================

  syncRocket() {

    const progress =
      this.game.rocket.getProgress();


    this.lastRocketProgress =
      progress;


    this.updateStatusPanel();


    if (
      progress.percentage >=
      100
    ) {

      this.ui.notify(
        "Rocket assembly complete",
        "success",
        3500,
      );
    }
  }


  // =========================================================
  // FULL SYNC
  // =========================================================

  syncEverything() {

    this.syncEra();

    this.syncQuest();

    this.syncInventory();

    this.syncHyperspace();

    this.syncRocket();

    this.updateStatusPanel();
  }


  // =========================================================
  // ELARA
  // =========================================================

  setElara(
    elara,
  ) {

    this.elara =
      elara;

  }


  updatePlayerPosition(
    player,
  ) {

    if (
      !player
    ) {
      return;
    }


    this.ui.setCoordinates(
      player.position.x,
      player.position.y,
      player.position.z,
    );


    this.checkElaraDistance(
      player,
    );
  }


  checkElaraDistance(
    player,
  ) {

    if (
      !this.elara
    ) {
      return;
    }


    const dx =
      player.position.x -
      this.elara.position.x;


    const dz =
      player.position.z -
      this.elara.position.z;


    const distance =
      Math.hypot(
        dx,
        dz,
      );


    const nearby =
      distance <=
      this.elaraTalkDistance;


    if (
      nearby &&
      !this.nearElara &&
      !this.dialogueOpen
    ) {

      this.nearElara =
        true;

      this.npcPrompt.classList.add(
        "visible",
      );

    }


    if (
      !nearby &&
      this.nearElara
    ) {

      this.nearElara =
        false;

      this.npcPrompt.classList.remove(
        "visible",
      );
    }
  }


  startElaraDialogue() {

    if (
      this.dialogueOpen
    ) {
      return;
    }


    try {

      this.game.dialogue.start(
        "elara_intro",
        {
          npcId:
            "elara",
        },
      );

    } catch (
      error
    ) {

      console.error(
        error,
      );

      this.ui.notify(
        error.message ??
        "Could not start dialogue.",
        "error",
        3500,
      );
    }
  }


  // =========================================================
  // BACKEND DIALOGUE
  // =========================================================

  createDialogueOverlay() {

    this.dialogueRoot =
      document.createElement(
        "div",
      );


    this.dialogueRoot.id =
      "frontend-dialogue-overlay";


    this.dialogueRoot.innerHTML = `
      <div class="frontend-dialogue-card">

        <div class="frontend-dialogue-header">

          <div>

            <div class="frontend-dialogue-label">
              NPC TRANSMISSION
            </div>

            <div
              class="frontend-dialogue-speaker"
              id="frontend-dialogue-speaker"
            >
              Unknown
            </div>

          </div>

          <div
            class="frontend-dialogue-close"
            id="frontend-dialogue-close"
          >
            ESC
          </div>

        </div>


        <div
          class="frontend-dialogue-text"
          id="frontend-dialogue-text"
        ></div>


        <div
          class="frontend-dialogue-choices"
          id="frontend-dialogue-choices"
        ></div>

      </div>
    `;


    document.body.appendChild(
      this.dialogueRoot,
    );


    this.dialogueSpeaker =
      this.dialogueRoot.querySelector(
        "#frontend-dialogue-speaker",
      );


    this.dialogueText =
      this.dialogueRoot.querySelector(
        "#frontend-dialogue-text",
      );


    this.dialogueChoices =
      this.dialogueRoot.querySelector(
        "#frontend-dialogue-choices",
      );


    this.dialogueRoot
      .querySelector(
        "#frontend-dialogue-close",
      )
      .addEventListener(
        "click",
        () => {
          this.endDialogue();
        },
      );
  }


  createNpcPrompt() {

    this.npcPrompt =
      document.createElement(
        "div",
      );


    this.npcPrompt.id =
      "frontend-npc-prompt";


    this.npcPrompt.innerHTML = `
      <span class="frontend-npc-key">
        E
      </span>

      <span>
        TALK TO ELARA
      </span>
    `;


    document.body.appendChild(
      this.npcPrompt,
    );
  }


  openBackendDialogue() {

    this.dialogueOpen =
      true;

    this.nearElara =
      false;


    this.npcPrompt.classList.remove(
      "visible",
    );


    this.dialogueRoot.classList.add(
      "visible",
    );


    this.renderBackendDialogue();
  }


  renderBackendDialogue() {

    if (
      !this.dialogueOpen
    ) {
      return;
    }


    const current =
      this.game.dialogue.getCurrent();


    if (
      !current
    ) {

      this.closeBackendDialogue();

      return;
    }


    const npc =
      this.game.npcSystem.get(
        current.npcId,
      );


    this.dialogueSpeaker.textContent =
      npc?.name ??
      current.npcId ??
      "Unknown";


    this.dialogueText.textContent =
      current.text ??
      "";


    this.dialogueChoices.innerHTML =
      "";


    for (
      const choice
      of current.choices ??
      []
    ) {

      const button =
        document.createElement(
          "button",
        );


      button.type =
        "button";


      button.className =
        "frontend-dialogue-choice";


      button.textContent =
        choice.text ??
        "Continue";


      button.addEventListener(
        "click",
        () => {

          try {

            this.game.dialogue.choose(
              choice.id,
            );

          } catch (
            error
          ) {

            console.error(
              error,
            );

            this.ui.notify(
              error.message ??
              "Dialogue choice failed.",
              "error",
              3500,
            );
          }
        },
      );


      this.dialogueChoices.appendChild(
        button,
      );
    }


    if (
      (
        current.choices ??
        []
      ).length ===
      0
    ) {

      const close =
        document.createElement(
          "button",
        );


      close.type =
        "button";


      close.className =
        "frontend-dialogue-choice";


      close.textContent =
        "CLOSE";


      close.addEventListener(
        "click",
        () => {
          this.endDialogue();
        },
      );


      this.dialogueChoices.appendChild(
        close,
      );
    }
  }


  endDialogue() {

    try {

      this.game.dialogue.end(
        "frontend",
      );

    } catch (
      error
    ) {

      console.error(
        error,
      );
    }


    this.closeBackendDialogue();
  }


  closeBackendDialogue() {

    this.dialogueOpen =
      false;


    this.dialogueRoot.classList.remove(
      "visible",
    );


    this.dialogueChoices.innerHTML =
      "";
  }


  // =========================================================
  // STATUS PANEL
  // =========================================================

  createStatusPanel() {

    this.statusPanel =
      document.createElement(
        "div",
      );


    this.statusPanel.id =
      "frontend-status-panel";


    this.statusPanel.innerHTML = `
      <div class="frontend-status-header">

        <span>
          GAME SYSTEMS
        </span>

        <span
          class="frontend-status-live"
        >
          LIVE
        </span>

      </div>


      <div class="frontend-status-row">
        <span>ERA</span>

        <strong
          id="frontend-status-era"
        >
          PREHISTORY
        </strong>
      </div>


      <div class="frontend-status-row">
        <span>QUEST</span>

        <strong
          id="frontend-status-quest"
        >
          NONE
        </strong>
      </div>


      <div class="frontend-status-row">
        <span>INVENTORY</span>

        <strong
          id="frontend-status-inventory"
        >
          0 / 20
        </strong>
      </div>


      <div class="frontend-status-row">
        <span>ROCKET</span>

        <strong
          id="frontend-status-rocket"
        >
          0%
        </strong>
      </div>


      <div class="frontend-status-row">
        <span>HYPERSPACE</span>

        <strong
          id="frontend-status-hyperspace"
        >
          IDLE
        </strong>
      </div>


      <div class="frontend-status-row">
        <span>LEVEL</span>

        <strong
          id="frontend-status-level"
        >
          1
        </strong>
      </div>


      <div class="frontend-status-footer">
        P = SAVE
        <span>·</span>
        L = LOAD
      </div>
    `;


    document.body.appendChild(
      this.statusPanel,
    );


    this.statusEra =
      this.statusPanel.querySelector(
        "#frontend-status-era",
      );


    this.statusQuest =
      this.statusPanel.querySelector(
        "#frontend-status-quest",
      );


    this.statusInventory =
      this.statusPanel.querySelector(
        "#frontend-status-inventory",
      );


    this.statusRocket =
      this.statusPanel.querySelector(
        "#frontend-status-rocket",
      );


    this.statusHyperspace =
      this.statusPanel.querySelector(
        "#frontend-status-hyperspace",
      );


    this.statusLevel =
      this.statusPanel.querySelector(
        "#frontend-status-level",
      );
  }


  updateStatusPanel() {

    if (
      !this.statusPanel
    ) {
      return;
    }


    const state =
      this.game.state.getSnapshot();


    this.statusEra.textContent =
      this.formatName(
        state.era?.current ??
        "unknown",
      );


    const activeQuests =
      Object.keys(
        state.quests?.active ??
        {},
      );


    if (
      activeQuests.length > 0
    ) {

      this.statusQuest.textContent =
        this.getQuestTitle(
          activeQuests[0],
        );

    } else {

      this.statusQuest.textContent =
        "NONE";
    }


    const used =
      this.game.inventory.getUsedSlots();


    const capacity =
      this.game.inventory.getCapacity();


    this.statusInventory.textContent =
      `${used} / ${capacity}`;


    const rocket =
      this.game.rocket.getProgress();


    this.statusRocket.textContent =
      `${rocket.percentage}%`;


    const hyperspace =
      this.game.hyperspace.getState();


    this.statusHyperspace.textContent =
      (
        hyperspace.active
          ? String(
              hyperspace.phase,
            )
          : "IDLE"
      ).toUpperCase();


    this.statusLevel.textContent =
      String(
        state.player?.level ??
        1,
      );
  }


  // =========================================================
  // INVENTORY PANEL
  // =========================================================

  updateInventoryPanel(
    items,
    capacity,
    used,
  ) {

    this.inventorySnapshot =
      {
        items,
        capacity,
        used,
      };
  }


  // =========================================================
  // FRAME UPDATE
  // =========================================================

  update(
    player,
  ) {

    this.updatePlayerPosition(
      player,
    );

    this.updateStatusPanel();
  }


  // =========================================================
  // UTILITIES
  // =========================================================

  formatName(
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


  // =========================================================
  // CLEANUP
  // =========================================================

  destroy() {

    for (
      const unsubscribe
      of this.unsubscribers
    ) {

      try {
        unsubscribe();
      } catch {
        // Ignore cleanup errors.
      }
    }


    this.unsubscribers =
      [];


    this.dialogueRoot?.remove();
    this.npcPrompt?.remove();
    this.statusPanel?.remove();
  }
}