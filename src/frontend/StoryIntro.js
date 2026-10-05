import "./ui.css";

const clamp = (value, min, max) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(max, Math.max(min, number));
};

export class UIManager {
  constructor(options = {}) {
    this.title =
      options.title ??
      "DINO: 4D HYPERSPACE";

    this.started = false;
    this.paused = false;

    this.dialogueActive = false;
    this.dialogueMode = "none";

    this.dialogueLines = [];
    this.dialogueIndex = 0;
    this.dialogueResolve = null;

    this.inventoryOpen = false;
    this.controlsOpen = false;

    this.notificationTimeouts =
      new Set();

    this.createRoot();
    this.cacheElements();
    this.bindEvents();

    this.setTitle(this.title);

    this.setEra("PREHISTORY");

    this.setCoordinates(
      0,
      0,
      0,
    );

    this.setHealth(
      100,
      100,
    );

    this.setStamina(
      100,
      100,
    );

    this.setTimelineStability(
      100,
    );

    this.setObjective(
      "Explore the prehistoric world",
      "Begin your journey and discover what threatens the timeline.",
    );

    this.setQuest(
      "The Beginning",
      [],
    );
  }


  // =========================================================
  // ROOT UI
  // =========================================================

  createRoot() {
    this.root =
      document.createElement(
        "div",
      );

    this.root.id =
      "game-ui";

    this.root.innerHTML = `
      <div
        class="ui-screen-fade"
        id="ui-screen-fade"
      ></div>


      <!-- ===================================================
           MAIN MENU
      ==================================================== -->

      <section
        class="main-menu"
        id="main-menu"
      >

        <div class="menu-background-grid"></div>

        <div class="menu-content">

          <div class="menu-kicker">
            PROJECT 4D / TEMPORAL SURVIVAL
          </div>

          <h1
            class="menu-title"
            id="menu-title"
          >
            DINO: 4D HYPERSPACE
          </h1>

          <p class="menu-subtitle">
            A prehistoric world.
            One collapsing timeline.
            One dinosaur with a way through time.
          </p>

          <div class="menu-actions">

            <button
              class="menu-button primary"
              id="start-button"
              type="button"
            >
              START GAME
            </button>

            <button
              class="menu-button"
              id="controls-button"
              type="button"
            >
              HOW TO PLAY
            </button>

          </div>

          <div class="menu-footer">

            <span>WASD — MOVE</span>
            <span>SHIFT — RUN</span>
            <span>SPACE — JUMP</span>
            <span>E — INTERACT</span>
            <span>I — INVENTORY</span>
            <span>ESC — PAUSE</span>

          </div>

        </div>

      </section>


      <!-- ===================================================
           CONTROLS
      ==================================================== -->

      <section
        class="controls-modal hidden"
        id="controls-modal"
        aria-hidden="true"
      >

        <div class="modal-card">

          <div class="modal-header">

            <div>

              <div class="panel-label">
                CONTROL SCHEME
              </div>

              <h2>
                How to Play
              </h2>

            </div>

            <button
              class="icon-button"
              id="controls-close"
              type="button"
            >
              ×
            </button>

          </div>

          <div class="controls-grid">

            <div class="control-row">
              <span>Move</span>
              <strong>W A S D</strong>
            </div>

            <div class="control-row">
              <span>Jump</span>
              <strong>SPACE</strong>
            </div>

            <div class="control-row">
              <span>Run</span>
              <strong>SHIFT</strong>
            </div>

            <div class="control-row">
              <span>Interact</span>
              <strong>E</strong>
            </div>

            <div class="control-row">
              <span>Inventory</span>
              <strong>I</strong>
            </div>

            <div class="control-row">
              <span>Pause</span>
              <strong>ESC</strong>
            </div>

          </div>

        </div>

      </section>


      <!-- ===================================================
           HUD
      ==================================================== -->

      <section
        class="hud hidden"
        id="hud"
      >

        <div class="hud-topbar">

          <div class="hud-card status-card">

            <div class="card-heading">

              <span class="panel-label">
                CURRENT ERA
              </span>

              <span class="live-dot"></span>

            </div>

            <div
              class="era-value"
              id="era-value"
            >
              PREHISTORY
            </div>

            <div
              class="coordinates"
              id="coordinates"
            >
              X 000 · Y 000 · Z 000
            </div>

          </div>


          <div class="hud-card timeline-card">

            <div class="card-heading">

              <span class="panel-label">
                TIMELINE STABILITY
              </span>

              <span id="timeline-value">
                100%
              </span>

            </div>

            <div class="meter timeline-meter">

              <div
                class="meter-fill"
                id="timeline-fill"
              ></div>

            </div>

            <div
              class="timeline-note"
              id="timeline-note"
            >
              Stable
            </div>

          </div>


          <div class="hud-card vitals-card">

            <div class="vital-row">

              <div class="vital-label">

                <span>
                  HEALTH
                </span>

                <strong
                  id="health-value"
                >
                  100 / 100
                </strong>

              </div>

              <div class="meter">

                <div
                  class="meter-fill health"
                  id="health-fill"
                ></div>

              </div>

            </div>


            <div class="vital-row">

              <div class="vital-label">

                <span>
                  STAMINA
                </span>

                <strong
                  id="stamina-value"
                >
                  100 / 100
                </strong>

              </div>

              <div class="meter">

                <div
                  class="meter-fill stamina"
                  id="stamina-fill"
                ></div>

              </div>

            </div>

          </div>

        </div>


        <!-- OBJECTIVE -->

        <div
          class="objective-card hud-card"
        >

          <div class="panel-label">
            CURRENT OBJECTIVE
          </div>

          <div
            class="objective-title"
            id="objective-title"
          >
            Explore the prehistoric world
          </div>

          <div
            class="objective-subtitle"
            id="objective-subtitle"
          >
            Begin your journey.
          </div>

        </div>


        <!-- QUEST -->

        <div
          class="quest-card hud-card hidden"
          id="quest-card"
        >

          <div class="panel-label">
            ACTIVE QUEST
          </div>

          <div
            class="quest-title"
            id="quest-title"
          >
            The Beginning
          </div>

          <div
            class="quest-objectives"
            id="quest-objectives"
          ></div>

        </div>


        <!-- INVENTORY BUTTON -->

        <button
          class="hud-inventory-button"
          id="inventory-button"
          type="button"
        >
          INVENTORY
          <span id="inventory-count">
            0 / 20
          </span>
        </button>


        <!-- INTERACTION -->

        <div
          class="interaction-prompt hidden"
          id="interaction-prompt"
        >

          <span
            class="keycap"
            id="interaction-key"
          >
            E
          </span>

          <span id="interaction-text">
            INTERACT
          </span>

        </div>


        <!-- NOTIFICATIONS -->

        <div
          class="notification-stack"
          id="notification-stack"
        ></div>


        <!-- =================================================
             DIALOGUE
        ================================================== -->

        <div
          class="dialogue-wrap hidden"
          id="dialogue-wrap"
        >

          <div class="dialogue-card">

            <div class="dialogue-header">

              <div class="speaker-block">

                <div class="panel-label">
                  TRANSMISSION
                </div>

                <div
                  class="speaker-name"
                  id="dialogue-speaker"
                >
                  Unknown
                </div>

              </div>

              <div
                class="dialogue-progress"
                id="dialogue-progress"
              >
                1 / 1
              </div>

            </div>


            <div
              class="dialogue-text"
              id="dialogue-text"
            ></div>


            <div
              class="dialogue-choices"
              id="dialogue-choices"
            ></div>


            <div class="dialogue-footer">

              <span
                id="dialogue-hint"
              >
                ENTER / SPACE TO CONTINUE
              </span>

            </div>

          </div>

        </div>


        <!-- =================================================
             INVENTORY
        ================================================== -->

        <div
          class="inventory-panel hidden"
          id="inventory-panel"
        >

          <div class="inventory-header">

            <div>

              <div class="panel-label">
                INVENTORY
              </div>

              <div
                class="inventory-title"
              >
                Dino's Items
              </div>

            </div>

            <button
              class="icon-button"
              id="inventory-close"
              type="button"
            >
              ×
            </button>

          </div>


          <div
            class="inventory-capacity"
            id="inventory-capacity"
          >
            0 / 20 SLOTS
          </div>


          <div
            class="inventory-grid"
            id="inventory-grid"
          ></div>

        </div>

      </section>


      <!-- ===================================================
           PAUSE
      ==================================================== -->

      <section
        class="pause-menu hidden"
        id="pause-menu"
      >

        <div class="pause-card">

          <div class="panel-label">
            TEMPORAL SYSTEM
          </div>

          <h2>
            PAUSED
          </h2>

          <p>
            Time is currently frozen.
          </p>

          <div class="pause-actions">

            <button
              class="menu-button primary"
              id="resume-button"
              type="button"
            >
              RESUME
            </button>

            <button
              class="menu-button"
              id="pause-controls-button"
              type="button"
            >
              CONTROLS
            </button>

            <button
              class="menu-button"
              id="save-button"
              type="button"
            >
              SAVE GAME
            </button>

            <button
              class="menu-button"
              id="load-button"
              type="button"
            >
              LOAD GAME
            </button>

          </div>

        </div>

      </section>


      <!-- TOAST -->

      <div
        class="toast-layer hidden"
        id="toast-layer"
      ></div>
    `;

    document.body.appendChild(
      this.root,
    );
  }


  // =========================================================
  // ELEMENT CACHE
  // =========================================================

  cacheElements() {
    const q =
      (selector) =>
        this.root.querySelector(
          selector,
        );

    this.fade =
      q("#ui-screen-fade");

    this.mainMenu =
      q("#main-menu");

    this.menuTitle =
      q("#menu-title");

    this.startButton =
      q("#start-button");

    this.controlsButton =
      q("#controls-button");

    this.controlsModal =
      q("#controls-modal");

    this.controlsClose =
      q("#controls-close");

    this.pauseControlsButton =
      q("#pause-controls-button");

    this.resumeButton =
      q("#resume-button");

    this.saveButton =
      q("#save-button");

    this.loadButton =
      q("#load-button");

    this.pauseMenu =
      q("#pause-menu");

    this.hud =
      q("#hud");

    this.eraValue =
      q("#era-value");

    this.coordinates =
      q("#coordinates");

    this.timelineValue =
      q("#timeline-value");

    this.timelineFill =
      q("#timeline-fill");

    this.timelineNote =
      q("#timeline-note");

    this.healthValue =
      q("#health-value");

    this.healthFill =
      q("#health-fill");

    this.staminaValue =
      q("#stamina-value");

    this.staminaFill =
      q("#stamina-fill");

    this.objectiveTitle =
      q("#objective-title");

    this.objectiveSubtitle =
      q("#objective-subtitle");

    this.questCard =
      q("#quest-card");

    this.questTitle =
      q("#quest-title");

    this.questObjectives =
      q("#quest-objectives");

    this.inventoryButton =
      q("#inventory-button");

    this.inventoryCount =
      q("#inventory-count");

    this.inventoryPanel =
      q("#inventory-panel");

    this.inventoryClose =
      q("#inventory-close");

    this.inventoryCapacity =
      q("#inventory-capacity");

    this.inventoryGrid =
      q("#inventory-grid");

    this.interactionPrompt =
      q("#interaction-prompt");

    this.interactionKey =
      q("#interaction-key");

    this.interactionText =
      q("#interaction-text");

    this.notificationStack =
      q("#notification-stack");

    this.dialogueWrap =
      q("#dialogue-wrap");

    this.dialogueSpeaker =
      q("#dialogue-speaker");

    this.dialogueProgress =
      q("#dialogue-progress");

    this.dialogueText =
      q("#dialogue-text");

    this.dialogueChoices =
      q("#dialogue-choices");

    this.dialogueHint =
      q("#dialogue-hint");

    this.toastLayer =
      q("#toast-layer");
  }


  // =========================================================
  // EVENTS
  // =========================================================

  bindEvents() {

    this.startButton.addEventListener(
      "click",
      () => {
        this.startGame();
      },
    );


    this.controlsButton.addEventListener(
      "click",
      () => {
        this.openControls();
      },
    );


    this.controlsClose.addEventListener(
      "click",
      () => {
        this.closeControls();
      },
    );


    this.pauseControlsButton.addEventListener(
      "click",
      () => {
        this.openControls();
      },
    );


    this.resumeButton.addEventListener(
      "click",
      () => {
        this.setPaused(
          false,
        );
      },
    );


    this.inventoryButton.addEventListener(
      "click",
      () => {
        this.toggleInventory();
      },
    );


    this.inventoryClose.addEventListener(
      "click",
      () => {
        this.closeInventory();
      },
    );


    this.saveButton.addEventListener(
      "click",
      () => {
        window.dispatchEvent(
          new CustomEvent(
            "ui:saveRequested",
          ),
        );
      },
    );


    this.loadButton.addEventListener(
      "click",
      () => {
        window.dispatchEvent(
          new CustomEvent(
            "ui:loadRequested",
          ),
        );
      },
    );


    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape"
        ) {

          if (
            !this.controlsModal
              .classList
              .contains("hidden")
          ) {

            this.closeControls();

            return;
          }


          if (
            this.inventoryOpen
          ) {

            this.closeInventory();

            return;
          }


          if (
            this.dialogueActive
          ) {

            window.dispatchEvent(
              new CustomEvent(
                "ui:dialogueCloseRequested",
              ),
            );

            return;
          }


          if (
            this.started
          ) {

            this.setPaused(
              !this.paused,
            );

          }

          return;
        }


        if (
          event.key.toLowerCase() ===
          "i"
        ) {

          if (
            this.started &&
            !this.dialogueActive
          ) {

            this.toggleInventory();

          }

          return;
        }


        if (
          (
            event.key ===
            "Enter"
          ) ||
          (
            event.key ===
            " "
          )
        ) {

          if (
            this.dialogueActive &&
            this.dialogueMode ===
              "story"
          ) {

            event.preventDefault();

            this.advanceDialogue();

          }

        }

      },
    );
  }


  // =========================================================
  // START
  // =========================================================

  startGame() {

    if (
      this.started
    ) {
      return;
    }


    this.started =
      true;

    this.hideElement(
      this.mainMenu,
    );

    this.showElement(
      this.hud,
    );


    this.fadeTo(
      0,
      500,
    );


    window.dispatchEvent(
      new CustomEvent(
        "game:start",
      ),
    );


    this.notify(
      "Timeline loaded",
      "success",
    );
  }


  // =========================================================
  // PAUSE
  // =========================================================

  setPaused(value) {

    if (
      !this.started
    ) {
      return;
    }


    if (
      this.dialogueActive
    ) {
      return;
    }


    this.paused =
      Boolean(value);


    if (
      this.paused
    ) {

      this.showElement(
        this.pauseMenu,
      );

    } else {

      this.hideElement(
        this.pauseMenu,
      );

    }


    window.dispatchEvent(
      new CustomEvent(
        "game:pauseChanged",
        {
          detail: {
            paused:
              this.paused,
          },
        },
      ),
    );
  }


  // =========================================================
  // CONTROLS
  // =========================================================

  openControls() {

    this.controlsOpen =
      true;

    this.showElement(
      this.controlsModal,
    );

    this.controlsModal.setAttribute(
      "aria-hidden",
      "false",
    );
  }


  closeControls() {

    this.controlsOpen =
      false;

    this.hideElement(
      this.controlsModal,
    );

    this.controlsModal.setAttribute(
      "aria-hidden",
      "true",
    );
  }


  // =========================================================
  // ERA
  // =========================================================

  setEra(era) {

    const cleanEra =
      String(
        era ??
          "UNKNOWN",
      )
        .replaceAll(
          "_",
          " ",
        )
        .toUpperCase();

    this.eraValue.textContent =
      cleanEra;
  }


  // =========================================================
  // COORDINATES
  // =========================================================

  setCoordinates(
    x,
    y,
    z,
  ) {

    const format =
      (value) => {

        const number =
          Math.round(
            Number(value) ||
              0,
          );

        return String(
          number,
        ).padStart(
          3,
          "0",
        );
      };


    this.coordinates.textContent =
      `X ${format(x)} · Y ${format(y)} · Z ${format(z)}`;
  }


  // =========================================================
  // HEALTH
  // =========================================================

  setHealth(
    current,
    max = 100,
  ) {

    const safeMax =
      Math.max(
        1,
        Number(max) ||
          1,
      );


    const safeCurrent =
      clamp(
        current,
        0,
        safeMax,
      );


    const percentage =
      (
        safeCurrent /
        safeMax
      ) *
      100;


    this.healthValue.textContent =
      `${Math.round(
        safeCurrent,
      )} / ${Math.round(
        safeMax,
      )}`;


    this.healthFill.style.width =
      `${percentage}%`;
  }


  // =========================================================
  // STAMINA
  // =========================================================

  setStamina(
    current,
    max = 100,
  ) {

    const safeMax =
      Math.max(
        1,
        Number(max) ||
          1,
      );


    const safeCurrent =
      clamp(
        current,
        0,
        safeMax,
      );


    const percentage =
      (
        safeCurrent /
        safeMax
      ) *
      100;


    this.staminaValue.textContent =
      `${Math.round(
        safeCurrent,
      )} / ${Math.round(
        safeMax,
      )}`;


    this.staminaFill.style.width =
      `${percentage}%`;
  }


  // =========================================================
  // TIMELINE
  // =========================================================

  setTimelineStability(
    value,
  ) {

    const percentage =
      clamp(
        value,
        0,
        100,
      );


    this.timelineValue.textContent =
      `${Math.round(
        percentage,
      )}%`;


    this.timelineFill.style.width =
      `${percentage}%`;


    if (
      percentage > 70
    ) {

      this.timelineNote.textContent =
        "Stable";

    } else if (
      percentage > 35
    ) {

      this.timelineNote.textContent =
        "Unstable";

    } else {

      this.timelineNote.textContent =
        "Critical";
    }
  }


  // =========================================================
  // OBJECTIVE
  // =========================================================

  setObjective(
    title,
    subtitle = "",
  ) {

    this.objective =
      title;

    this.objectiveTitle.textContent =
      title;

    this.objectiveSubtitle.textContent =
      subtitle;
  }


  // =========================================================
  // QUEST
  // =========================================================

  setQuest(
    name,
    objectives = [],
  ) {

    this.questName =
      name;

    this.questObjectives =
      Array.isArray(
        objectives,
      )
        ? objectives
        : [];


    this.questTitle.textContent =
      name;


    if (
      this.questObjectives.length ===
      0
    ) {

      this.hideElement(
        this.questCard,
      );

      this.questObjectives.innerHTML =
        "";

      return;
    }


    this.showElement(
      this.questCard,
    );


    this.renderQuestObjectives();
  }


  renderQuestObjectives() {

    this.questObjectives.innerHTML =
      this.questObjectives
        .map(
          (objective) => {

            const current =
              Number(
                objective.current ??
                  0,
              );

            const target =
              Math.max(
                1,
                Number(
                  objective.target ??
                    1,
                ),
              );


            const completed =
              Boolean(
                objective.completed,
              ) ||
              current >=
                target;


            return `
              <div
                class="quest-objective ${
                  completed
                    ? "completed"
                    : ""
                }"
              >

                <span
                  class="quest-check"
                >
                  ${
                    completed
                      ? "✓"
                      : ""
                  }
                </span>

                <span class="quest-objective-main">

                  <span>
                    ${this.escapeHtml(
                      objective.text ??
                        "Objective",
                    )}
                  </span>

                  <span class="quest-objective-count">
                    ${Math.min(
                      current,
                      target,
                    )}/${target}
                  </span>

                </span>

              </div>
            `;
          },
        )
        .join("");
  }


  // =========================================================
  // INVENTORY
  // =========================================================

  setInventory(
    items = {},
    capacity = 20,
    usedSlots = 0,
  ) {

    const entries =
      Object.entries(
        items,
      );


    this.inventoryCount.textContent =
      `${usedSlots} / ${capacity}`;


    this.inventoryCapacity.textContent =
      `${usedSlots} / ${capacity} SLOTS`;


    this.inventoryGrid.innerHTML =
      "";


    if (
      entries.length ===
      0
    ) {

      this.inventoryGrid.innerHTML = `
        <div class="inventory-empty">
          Inventory is empty.
        </div>
      `;

      return;
    }


    entries
      .sort(
        (
          a,
          b,
        ) =>
          a[0].localeCompare(
            b[0],
          ),
      )
      .forEach(
        (
          [
            itemId,
            quantity,
          ],
        ) => {

          const item =
            document.createElement(
              "div",
            );


          item.className =
            "inventory-item";


          item.innerHTML = `
            <div class="inventory-item-icon">
              ${this.getItemInitials(
                itemId,
              )}
            </div>

            <div class="inventory-item-info">

              <div class="inventory-item-name">
                ${this.formatItemName(
                  itemId,
                )}
              </div>

              <div class="inventory-item-id">
                ${this.escapeHtml(
                  itemId,
                )}
              </div>

            </div>

            <div class="inventory-item-quantity">
              ${quantity}
            </div>
          `;


          this.inventoryGrid.appendChild(
            item,
          );
        },
      );
  }


  toggleInventory() {

    if (
      this.inventoryOpen
    ) {

      this.closeInventory();

    } else {

      this.openInventory();
    }
  }


  openInventory() {

    if (
      !this.started ||
      this.paused ||
      this.dialogueActive
    ) {
      return;
    }


    this.inventoryOpen =
      true;


    this.showElement(
      this.inventoryPanel,
    );


    window.dispatchEvent(
      new CustomEvent(
        "ui:inventoryOpened",
      ),
    );
  }


  closeInventory() {

    this.inventoryOpen =
      false;


    this.hideElement(
      this.inventoryPanel,
    );
  }


  formatItemName(
    itemId,
  ) {

    return String(
      itemId,
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


  getItemInitials(
    itemId,
  ) {

    const words =
      this.formatItemName(
        itemId,
      )
        .split(" ")
        .filter(
          Boolean,
        );


    if (
      words.length ===
      0
    ) {
      return "?";
    }


    if (
      words.length ===
      1
    ) {
      return words[0]
        .slice(
          0,
          2,
        )
        .toUpperCase();
    }


    return (
      words[0][0] +
      words[
        words.length - 1
      ][0]
    ).toUpperCase();
  }


  // =========================================================
  // INTERACTION
  // =========================================================

  showInteraction(
    text = "Interact",
    key = "E",
  ) {

    this.interactionKey.textContent =
      key;

    this.interactionText.textContent =
      text;

    this.showElement(
      this.interactionPrompt,
    );
  }


  hideInteraction() {

    this.hideElement(
      this.interactionPrompt,
    );
  }


  // =========================================================
  // DIALOGUE - STORY
  // =========================================================

  showDialogue(
    lines,
  ) {

    const normalized =
      (
        Array.isArray(
          lines,
        )
          ? lines
          : [lines]
      )
        .map(
          (line) => {

            if (
              typeof line ===
              "string"
            ) {

              return {
                speaker:
                  "UNKNOWN",

                text:
                  line,
              };
            }


            return {
              speaker:
                line?.speaker ??
                "UNKNOWN",

              text:
                line?.text ??
                "",
            };
          },
        )
        .filter(
          (line) =>
            line.text.length >
            0,
        );


    if (
      normalized.length ===
      0
    ) {

      return Promise.resolve();
    }


    this.dialogueActive =
      true;

    this.dialogueMode =
      "story";

    this.dialogueLines =
      normalized;

    this.dialogueIndex =
      0;

    this.showElement(
      this.dialogueWrap,
    );


    this.renderStoryDialogue();


    return new Promise(
      (resolve) => {

        this.dialogueResolve =
          resolve;

      },
    );
  }


  renderStoryDialogue() {

    const line =
      this.dialogueLines[
        this.dialogueIndex
      ];


    if (!line) {

      this.finishDialogue();

      return;
    }


    this.dialogueSpeaker.textContent =
      line.speaker;


    this.dialogueProgress.textContent =
      `${this.dialogueIndex + 1} / ${
        this.dialogueLines.length
      }`;


    this.dialogueText.textContent =
      line.text;


    this.dialogueChoices.innerHTML =
      "";


    this.dialogueHint.textContent =
      this.dialogueIndex ===
      this.dialogueLines.length - 1
        ? "ENTER / SPACE TO CLOSE"
        : "ENTER / SPACE TO CONTINUE";
  }


  advanceDialogue() {

    if (
      !this.dialogueActive ||
      this.dialogueMode !==
        "story"
    ) {
      return;
    }


    this.dialogueIndex +=
      1;


    if (
      this.dialogueIndex >=
      this.dialogueLines.length
    ) {

      this.finishDialogue();

      return;
    }


    this.renderStoryDialogue();
  }


  // =========================================================
  // DIALOGUE - BACKEND NODE
  // =========================================================

  showDialogueNode(
    {
      speaker = "Unknown",
      text = "",
      choices = [],
    } = {},
    onChoice,
  ) {

    this.dialogueActive =
      true;

    this.dialogueMode =
      "backend";


    this.showElement(
      this.dialogueWrap,
    );


    this.dialogueSpeaker.textContent =
      speaker;


    this.dialogueProgress.textContent =
      choices.length > 0
        ? `${choices.length} CHOICES`
        : "MESSAGE";


    this.dialogueText.textContent =
      text;


    this.dialogueChoices.innerHTML =
      "";


    this.dialogueHint.textContent =
      choices.length > 0
        ? "SELECT A RESPONSE"
        : "ESC TO CLOSE";


    for (
      const choice
      of choices
    ) {

      const button =
        document.createElement(
          "button",
        );


      button.type =
        "button";

      button.className =
        "dialogue-choice";


      button.textContent =
        choice.text ??
        "Continue";


      button.addEventListener(
        "click",
        () => {

          onChoice?.(
            choice.id,
          );

        },
      );


      this.dialogueChoices.appendChild(
        button,
      );
    }
  }


  finishDialogue() {

    this.dialogueActive =
      false;

    this.dialogueMode =
      "none";

    this.dialogueLines =
      [];

    this.dialogueIndex =
      0;


    this.hideElement(
      this.dialogueWrap,
    );


    const resolve =
      this.dialogueResolve;


    this.dialogueResolve =
      null;


    resolve?.();


    window.dispatchEvent(
      new CustomEvent(
        "ui:dialogueFinished",
      ),
    );
  }


  hideDialogue() {

    this.dialogueActive =
      false;

    this.dialogueMode =
      "none";


    this.dialogueLines =
      [];


    this.hideElement(
      this.dialogueWrap,
    );


    this.dialogueChoices.innerHTML =
      "";
  }


  // =========================================================
  // NOTIFICATION
  // =========================================================

  notify(
    message,
    type = "info",
    duration = 3000,
  ) {

    const item =
      document.createElement(
        "div",
      );


    item.className =
      `notification ${type}`;


    item.innerHTML = `
      <div class="notification-line"></div>

      <div>

        <div class="notification-type">
          ${String(
            type,
          ).toUpperCase()}
        </div>

        <div class="notification-message">
          ${this.escapeHtml(
            message,
          )}
        </div>

      </div>
    `;


    this.notificationStack.appendChild(
      item,
    );


    requestAnimationFrame(
      () => {
        item.classList.add(
          "visible",
        );
      },
    );


    const timeout =
      window.setTimeout(
        () => {

          item.classList.remove(
            "visible",
          );

          window.setTimeout(
            () => {
              item.remove();
            },
            300,
          );

        },
        duration,
      );


    this.notificationTimeouts.add(
      timeout,
    );
  }


  // =========================================================
  // FADE
  // =========================================================

  fadeTo(
    opacity,
    duration = 500,
  ) {

    this.fade.style.transitionDuration =
      `${duration}ms`;


    this.fade.style.opacity =
      String(
        clamp(
          opacity,
          0,
          1,
        ),
      );
  }


  // =========================================================
  // STORY BANNER
  // =========================================================

  showToast(
    title,
    message,
  ) {

    this.showElement(
      this.toastLayer,
    );


    this.toastLayer.innerHTML = `
      <div class="toast">

        <div class="toast-title">
          ${this.escapeHtml(
            title,
          )}
        </div>

        <div class="toast-message">
          ${this.escapeHtml(
            message,
          )}
        </div>

      </div>
    `;


    window.setTimeout(
      () => {

        this.hideElement(
          this.toastLayer,
        );

      },
      3500,
    );
  }


  // =========================================================
  // UTILS
  // =========================================================

  showElement(
    element,
  ) {

    element?.classList.remove(
      "hidden",
    );
  }


  hideElement(
    element,
  ) {

    element?.classList.add(
      "hidden",
    );
  }


  escapeHtml(
    value,
  ) {

    return String(
      value,
    )
      .replaceAll(
        "&",
        "&amp;",
      )
      .replaceAll(
        "<",
        "&lt;",
      )
      .replaceAll(
        ">",
        "&gt;",
      )
      .replaceAll(
        '"',
        "&quot;",
      )
      .replaceAll(
        "'",
        "&#039;",
      );
  }
}