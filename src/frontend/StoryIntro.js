import "./ui.css";

const clamp = (value, min, max) =>
    Math.min(max, Math.max(min, value));

export class UIManager {
    construction(options = {}) {
        this.title = options.title ?? "DINO: 4D HYPERSPACE";

        this.started = false;
        this.paused = false;

        this.dialogueActive = false;
        this.dialogueLines = [];
        this.dialogueIndex = 0;
        this.dialogueResolve = null;
        this.dialogueTimer = null;

        this.objective = "Explore the prehistoric world";
        this.questName = "The Beginning";
        this.questObjectives = [];

        this.notificationTimeout = null;

        this.createRoot();
        this.cacheElements();
        this.bindEvents();
        
        this.setTitle(this.title);
        this.setEra("PREHISTORIC");
        this.setCoordinates(0, 0, 0);

        this.setHealth(100, 100);
        this.setStamina(100, 100);
        this.setTimelineStability(100);

        this.questObjectives(
            "Explore the prehistoric world",
            "Follow the story to discover what threatens the timeline",
        );

        this.setQuest("The beginning", []);
    }

    //root

    createRoot() {
        this.root = document.createElement("div");

        this.root.id = "game-ui";

        this.root.innerHTML = `
        <div class="ui-screen-fade" id="ui-screen-fade"></div>

        <!-- ============================================
                MAIN MENU
        ================================================= -->

        <section class="main-menu" id="main-menu">

        <div class="menu-background-grid"></div>

        <div class="menu-content">

        <div class="menu-kicker">
        PROJECT 4D / TEMPORAL SURVIVAL
        </h1>

        <h1 class="menu-title" id="menu-title">
        DINO: 4D HYPERSPACE
        </h1>

        <p class="menu-subtitle">
        A Prehistoric world. One collapsing timeline.
        One dinosaur with a way through time.
        </p>

        <div class"menu-actions">

        <button
        class="menu-button primary"
        id="start-button"
        >
        START GAME
        </button>

        <button class="menu-button"
        id="controls-button"
        >
        HOW TO PLAY
        </button>

        </div>

        <div class="menu-footer">

        <span>WASD / ARROWS - MOVE</span>
        <span>SHIFT - RUN</span>
        <span>E - INTERACT</span>
        <span>ESC - PAUSE</span>

        </div>

        </div>

        </section>

        <! -- =================================================
                  CONTROLS MODAL
        =================================================== -->

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

        <div>

        <button
        class="icon-button"
        id="controls-close"
        aria-label="Close controls"
        >
        *
        </button>

        </div>

        <div class="controls-grid">

        <div class="control-row">
        <span>Move</span>
        <strong>W A S D</strong>
        </div>

        <div class="control-row">
        <spanLook / Camera</span>
        <strong>MOUSE</strong>
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
        <span>Advance Dialogue</span>
        <strong>ENTER / SPACE</strong>
        </div>

        <div class="control-row">
        <span>Pause</span>
        <strong>ESC</strong>
        </div>

        </div>

        </div>

        </section>

        <!-- =====================================
               HUD
        ====================================== -->

        <section
        class="hud hidden"
        id="hud"
        >

        <!-- TOP BAR -->

        <div class="hud-topbar">

        <!-- ERA -->

        <div class="hud-card status-card">

        <div class ="card-heading">

        <span class="panel-label">
        CURRENT ERA
        </span>

        <span class="live-dot"></span>

        </div>

        <div
        class="era-value"
        id="era-value"
        >
        PREHISTORIC
        </div>

        <div
        class="coordinates"
        id="coordinates"
        >
        X 000 · Y 000 · Z 000
        </div>

        </div>

        <!-- TIMELINE -->

        <div class="hud-card timeline-card">

        <div class="card-heading">

        <span class="panel-label">
        TIMELINE STABILTY
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
        class="tmeline-note"
        id="timeline-note"
        >
        Stable
        </div>

        </div>


        <!-- VITALS -->
        
        <div class="hud-card vitals-card">

        <div class="vital-row">

        <div class="vital-label">

        <span>
        HEALTH
        </span>

        <strong id="health-value">
        100 / 100
        </strong>

        </div>

        <div class="meter">

        <div
        class="meter-fil health"
        id="health-fill"
        ></div>

        </div>

        </div>

        <div class="vital-row">

        <div class="vital-label">

        <span>
        STAMINA
        </span>

        <strong id="stamina-value">
        100 / 100
        </strong>
        
        </div>

        <div class="meter">

        <div
        class="meer-fill stamina"
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
        Follow the story to discover what threatens the timeline.
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

        <span
        id="interaction-text"
        >
        INTERACT
        </span>

        </div>

        <!-- NOTIFICATIONS -->

        <div
        class="notifications-stack"
        id="notification-stack"
        ></div>

        <!-- DIALOGUE -->

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


        <div class="dialogue-footer">

        <span
        id="dialogue-hint"
        >
        ENTER / SPACE TO CONTINUE
        </span>

        </div>

        </div>

        </div>

        </section>

        <!-- =======================================================
               PAUSE MENU
        ===================================================== -->

        <section
        class="pause-menu hidden"
        id=pause-menu"
        >

        <div class="pause-card">

        <div class="panel-label">
        TEMPORAL SYSTEM
        </div>

        <h2>
        PAUSED
        </h2>

        <p>
        Time is currently frozen
        </p>

        <div class="pause-actions">

        <button
        class="menu-button primary"
        id="resume-button"
        >
        RESUME
        </button>

        <button
        class="menu-button"
        id="pause-controls-button"
        >
        CONTROLS
        </button>

        </div>

        </div>

        </section>

        <!-- ==========================================
                TOAST
        =========================================== -->

        <div 
        class="toast-layer hidden"
        id="toast-layer"
        ></div>
        `;

        document.body.appendChild(this.root);
    }

    // cache DOM

    cacheElements() {
        const q = (selector) => this.root.querySelector(selector);

        this.fade = q("#ui-screen-fade");

        //menu
        this.mainMenu = q("#main-menu");
        this.menuTitle = q("#menu-title");
        this.startButton = q("#start-button");
        this.controlButton = q("#controls-button");

        //controls
        this.controlsModal = q("#controls-modal");
        this.controlsClose = q("#controls-close");

        //pause
        this.pauseConrolButton = q("#puse-controls-button");

        this.resumeButton = q("#resume-button");

        this.pauseMenu = q("#pause-menu");

        //hud
        this.hud = q("#hud");

        this.eraValue = q("#era-value");

        this.coordinates = q("#coordinates");

        this.timelineValue = q("#timeline-value");

        this.timelineFill = q("#timeline-fill");

        this.timelineNote = q("#timeline-note");

        this.healthValue = q("#health-value");

        this.healthFill = q("#health-fill");

        this.staminaValue = q("#stamina-value");

        this.staminaFill = q("#stamina-fill");

        this.objectiveTitle = q("#objective-title");

        this.objectiveSubtitle = q("#objective-subtitle");

        this.questCard = q("#quest-card");

        this.questTitle = q("#qust-title");

        this.questObjective = q("#quest-objective");

        this.interactionPrompt = q("#interaction-prompt");

        this.interactionKey = q("#interaction-key");

        this.interactionText = q("#interaction-text");

        this.notificationStack = q("#notifcation-stack");

        this.dialogueWrap = q("#dialogue-wrap");

        this.dialogueSpeaker = q("#dialogue-speaker");

        this.dialogueProgress = q("#dialogue-progress");

        this.dialogueText = q("#dialogue-text");

        this.dialogueHint = q("#dialogue-hint");

        this.toastLayer = q("#toast-layer");
    }

    //events 
    
    bindEvents() {

        this.startButton.addEventListener(
            "click",
            () => this.startGame(),
        );

        this.controlsButton.addEventListener(
            "click",
            () => this.openControls(),
        );

        this.controlsClose.addEventListener(
            "click",
            () => this.closeControls(),
        );

        this.pauseControlsButton.addEventListener(
            "click",
            () => this.openControls(),
        );

        this.resumeButton.addEventListener(
            "click",
            () => this.setPaused(false),
        );

        //keyboard
        document.addEventListener(
            "keydown",
            (event) => {

                //ESC
                if (event.key === "Escape") {

                    if (
                        !this.controlsModal.classList.contains(
                            "hidden",
                        )
                    ) {
                        this.closeControls();
                        return;
                    }

                    if (
                        this.started &&
                        !this.dialogueActive
                    ) {
                        this.setPaused(!this.paused);
                    }

                    return;
                }

                //Dialogue
                if (
                    this.dialogueActive &&
                    (
                        event.key === "Enter" ||
                        event.key === " "
                    )
                ) {
                    event.preventDefault();
                    this.advanceDialogue();
                }

            },
        );

        // external game events

        window.addEventListener(
            "game:setEra",
            (event) => {

                this.setEra(
                    event.detail?.era ??
                    "UNKNOWN",
                );

            },
        );


        window.addEventListener(
            "game:setObjective",
            (event) => {

                this.questObjective(
                    event.detail?.title ??
                    "No objective",

                    event.detail?.subtitle ??
                    "",
                );

            },
        );


        window.addEventListener(
            "game:notification",
            (event) => {

                this.notify(
                    event.detail?.message ??
                    "Notification",

                    event.detail?.type ??
                    "info",

                    event.detail?.duration ??
                    3200,
                );

            },
        );

        window.addEventListener(
            "game:interaction",
            (event) => {

                if (
                    event.detail?.visible === false) {
                        this.hideInteraction();
                        return;
                    }

                    this.showInteraction(
                        event.detail?.text ??
                        "Interact",

                        event.detail?.key ??
                        "E",
                    );

                },
            );

        }

        //title

        setTitle(title) {

            this.title = title;

            document.title =
            title;

            this.menuTitle.textContent = 
            title;
        }

        // game start

        startGame() {

            if (this.started) {
                return;
            }

            this.started = true;

            this.hideElement(
                this.mainMenu,
            );

            this.showElement(
                this.hud,
            );

            this.fadeTo(
                0,
                700,
            );

            window.dispatchEvent(
                new CustomEvent(
                    "game:start",
                    {
                        detail: {
                            source: "frontend",
                            timestamp: Date.now(),
                        },
                    },
                ),
            );

            this.notify(
                "Timeline loaded",
                "success",
            );
        }

        //pAuSE to be honest im bored asf

        setPaused(value) {

            if (!this.started) {
                return;
            }

            if (this.dialogueActive) {
                return;
            }

            this.paused =
              Boolean(value);

            if (this.paused) {
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
                            paused: this.paused,
                        },
                    },
                ),
            );
        }

        //controls

        openControls() {

            this.showElement(
                this.controlsModal,
            );

            this.controlsModal.setAttribute(
                "aria-hidden",
                "false",
            );
        }


        closeControls() {

            this.hideElement(
                this.controlsModal,
            );

            this.controlsModal.setAttribute(
                "aria-hidden",
                "true",
            );
        }

        //era 

        setEra(era) {

            const cleanEra =
                String(era)
                    .replaceAll("_", " ")
                    .toUppercase();

            this .eraValue.textContent =
                cleanEra;

            this.root.dataset.era =
                cleanEra
                    .toLowerCase()
                    .replaceAll(" ", "-");
        }

        //coordinates

        setCoordinates(
            x,
            y,
            z,
        ) {

            const format =
            (value) =>
                Number(
                    value ?? 0,
                )
                    .toFixed(0)
                    .padStart(3, "0");

            this.coordinates.textContent =
            `X ${format(x)} · Y ${formath(y)} · Z ${format(z)}`;
        }

        //health

        setHealth(
            current,
            max = 100,
        ) {

            const safeMax =
            Math.max(
                1,
                Number(max),
            );

            const safeCurrent =
            clamp(
                Number(current),
                0,
                safeMax,
            );

            const percentage =
            (
                safeCurrent /
                safeMax
            ) * 100;

            this.healthValue.textContent =
            `${Math.round(
                safeCurrent,
            )} / ${Math.round(
                safeMax,
            )}`;

            this.healthFill.style.width =
            `${percentage}%`;
        }

        //stamina

        setStamina(
            current,
            max = 100,
        ) {

            const safeMax =
            Math.max(
                1,
                Number(max),
            );

            const safeCurrent =
            clamp(
                Number(current),
                0,
                safeMax,
            );

            const percentage =
            (
                safeCurrent / 
                safeMax) * 100;

            this.staminaValue.textContent =
            `${Math.round(
                safeCurrent,
            )} / ${Math.round(
                dafeMax,
            )}`;

            this.staminaFill.style.width =
            `${percentage}%`;
        }

        //time line StaBIliTy

        setTimelineStability(vaue) {

            const percentage =
            clamp(
                Number(value),
                0,
                100,
            );

            this.timelineValue.textContent =
            `${Math.round(
                percentage,
            )}%`;

            this.timelineFill.style.width = 
            `${percentage}%`;

            if (percentage > 70) {

                this.timelineNote.textContent =
                "Stable";

                this.root.dataset.timelineState =
                "stable";

            } else if (percentage > 35) {
                
                this.timelineNote.textContent =
                "Unstable";

                this.root.dataset.timelineState =
                "unstable";

            } else {

                this.timelineNote.textContent =
                "Critical";

                this.root.dataset.timelineState=
                "critical";
            }
        }


        //objective

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


        //quest

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

                this.questCard.classList.add(
                    "hidden",
                );

                this.questObjectives.innerHTML =
                "";

                return;
            }


            this.questCard.classList.remove(
                "hidden",
            );

            this.renderQuestObjectives();
        }


        updateQuestObjective(
            index,
            completed,
        ) {

            if (
                !this.questObjectives[index]
            ) {
                return;
            }

            this.questObjectives[
                index
            ].completed =
              Boolean(completed);

            this.renderQuestObjectives();
        }

        renderQuestObjectives() {

            this.questObjectives.innerHTML =
            this.questObjectives
            .map(
              (
                objective,
              ) => {

                const done =
                Boolean(
                    objective.completed,
                );

                return `
                <div
                class="quest-objective ${
                    done
                    ? "completed"
                    : ""
                }"
                >

                <span
                class="quest-check"
                >
                ${
                    done
                    ? "✓"
                    : ""
                }
                </span>

                <span>
                ${this.escapeHtml(
                    objective.text ??
                    "Objective",
                )}
                </span>

                </div>
                `;
            },
        )
        .join("");
        }


        //Interaction
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


        //Notification

        notify(
            message,
            type = "info",
            duration = 3200,
        ) {

            const item =
            document.createElement
                "div",

            item.className =
            `notification $(type)`;

            item.innerHTML = `
            <div class="notification-line"></div>

            <div>

            <div class="notification-type">
            ${String(type).toUpperCase()}
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

            window.setTimeout(
                () => {

                    item.classList.remove(
                        "visible",
                    );

                    window.setTimeout(
                        () => item.remove(),
                        350,
                    );

                },
                duration,
            );
        }

        //screen fade

        async fadeTo(
            opacity,
            duration = 500,
        ) {

            this.fade.style.transitionDuation =
            `${duration}ms`;

            this.fade.style.opacity =
            String(opacity);

            await new Promise(
                (resolve) =>
                    window.setTimeout(
                        resolve,
                        duration,
                    ),
                );
            }

            //game transition

            async transitionToGame(
                callback,
            ) {

                await this.fadeTo(
                    1,
                    500,
                );
                try {

                    await callback?.();

                } finally {

                    await this.fadeTo(
                        0,700,
                    );
                }
            }

            //toast

            showToast(
                title,
                message,
            ) {

                this.toastLayer.classList.remove(
                    "hidden",
                );

                this.toastLayer.innerHTML = `
                <div class="toast">

                <div class="toast-title">
                ${this.escapeHtml(
                    title,
                )}
                </div>

                </div>
                `;

                window.clearTimeout(
                    this.notificationTimeout,
                );

                this.notificationTimeout =
                window.setTimeout(
                    () => {

                        this.toastLayer.classList.add(
                            "hidden",
                        );

                    },
                    3500,
                );
            }

            //dialogue
            showDialogue(
                lines,
                options = {},
            ) {

                const normalized =
                Array.isArray(lines)
                ? lines
                : [lines];

            this.dialogueLines =
            normalized.map(
                (line) => ({
                    speaker:
                    line?.speaker ??
                    options.speaker ??
                    "Unknown",

                    text:
                    line?.text ??
                    String(
                        line ?? "",
                    ),
                }),
            );


            if (
                this.dialogueLines.length ===
                0
            ) {

                return Promise.resolve();
            }

            this.dialogueActive =
            true;

            this.dialogueIndex =
            0;

            this.showElement(
                this.dialogueWrap,
            );

            this.renderDialogueLine();

            return new Promise(
                (resolve) => {

                    this.dialogueResolve =
                    resolve;

                },
            );
        }

        renderDialogueLine() {

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
                this.dialogueLines.Lines.length}`;

            this.dialoguesText.textContent =
            "";


            let index = 0;

            const text =
            line.text;


            window.clearInterval(
                this.dialogueTimer,
            );

            this.dialogueHint.textContent =
            "...";

            this.dialogueTimer =
            window.setInterval(
                () => {

                    this.dialogueText.textContent =
                    text.slice(
                        0,
                        index + 1,
                    );

                    index += 1;

                    if (
                        index >=
                        text.length
                    ) {

                        window.clearInterval(
                            this.dialogueTimer,
                        );

                        this.dialogueHint.textContent =
                        this.dialogueIndex >=
                        this.dialogueLines.length - 1
                        ? "ENTER / SPACE TO CLOSE"
                        : "ENTER / SPACE TO CONTINUE";
                    }

                },
                18,
            );
        }

        advanceDialogue() {

            if (
                !this.dialogueActive) {
                    return;
                }

                const line =
                this.dialogueLines[
                    this.dialogueIndex
                ];

                if (!line) {
                    this.finishDialogue();
                    return;
                }

                const fullyTyped =
                this.dialogueText.textContent ===
                line.text;

                //first press completes typing
                if (!fullyTyped) {

                    window.clearInterval(
                        this.dialogueTimer,
                    );

                    this.dialogueText.textContent =
                    line.text;

                    this.dialogueHint.textContent =
                    this.dialogueIndex >=
                    this.dialogueLines.length - 1
                    ? "ENTER / SPACE TO CLOSE"
                    : "ENTER / SPACE TO CONTINUE";

                    return;
                }


                // second press advances
                this.dialoguesIndex += 1;

                
                if (
                    this.dialogueIndex >=
                    this.dialogueLines.length
                ) {

                    this.finishDialogue();

                    return;
                }

                this.renderDialogueLine();
            }

            finishDialogue() {

                window.clearInterval(
                    this.dialogueTimer,
                );

                this.dialogueActive =
                false;

                this.hideElement(
                    this.dialogueWrap,
                );

                const resolve =
                this.dialogueResolve;

                this.dialogueResilve =
                null;


                resolve?.();

                window.dispatchEvent(
                    new CustomEvent(
                        "game:dialogueFinished",
                    ),
                );
            }

            //opening story

            async showOpeningSequence() {

                await this.showDialogue([
                    {
                        speaker:
                        "UNKNOWN SIGNAL",

                        text:
                        "Tempporal warning detected",
                    },

                    {
                        speaker:
                        "UNKNOWN SIGNAL",

                        text:
                        "A major impact event has been detected in the prehistoric timeline",
                    },

                    {
                        speaker:
                        "DINO",

                        text:
                        "...",
                    },

                    {
                        speaker:
                        "UNKNOWN SIGNAL",

                        text:
                        "4D Hyperspace is your only path to another era",
                    },

                ]);

                this.setObjective(
                    "Explore the prehistoric world",
                    "Find out what is happening before attempting to change the timeline",
                );


                this.setQuest(
                    "A Warning from the Future",
                    [
                        {
                            text:
                            "Explore the prehistoric area",

                            completed:
                            false,
                        },

                        {
                            text:
                            "Find the source of the temporal signal",

                            completed:
                            false,
                        },
                    ],
                );

                this.notify(
                    "New quest: A Warning From the Future",
                    "quest",
                );
            }

            //helpers

            showElement(element) {

                element?.classList.add(
                    "hidden",
                );
            }

            escapeHtml(value) {

                return String(value)
                .replaceAll(
                    "&",
                    "&amp;",
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
