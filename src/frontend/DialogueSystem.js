    export class DialogueSystem {
        constructor(options = {}) {
            this.options = {
                typeSpeed: options.typeSpped ?? 22,
                autoScroll: options.autoScroll ?? true,
                allowSkipTyping: options.allowSkipTyping ?? true,
                ...options,
            };

            this.active = false;
            this.typing = false;
            this.currentLine = 0;
            this.lines = [];
            this.currentText = "";
            this.currentCharacter = 0;
            this.typeTimer = null;
            this.resolve = null;
            this.reject = null;

            this.container = null;
            this.dialogueBox = null;
            this.speakerElement = null;
            this.textElement = null;
            this.progressElement = null;
            this.continueHint = null;
            this.nextButton = null;
            this.potraitElement = null;

            this.createUI();
            this.bindEvents();
        }

        //UI creation

        createUI() {
            this.container = document.createElement("div");

            this.container.id = "dialogue-system";

            this.container.innerHTML = `
            <div class="dialogue-overlay">

            <div class="dialogue-box">

            <div class="dialogue-top">

            <div class="dialogue-character">

            <div class="dialogue-potrait" id="dialogue-potrait">
            <div class-"potrait-placeholder">
            ?
            </div>
            </div>

            <div class="dialogue-speaker-area">

            <div class="dialogue-speaker-label">
            SPEAKING
            </div>

            <div
            class="dialogue-speaker"
            id="dialogue-speaker"
            >
            Unknown
            </div>

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

            <div class="dialogue-bottom">

            <div
            class="dialogue-hint"
            id="dialogue-hint"
            >
            ENTER TO CONTINUE
            </div>

            <button
            class="dialogue-next"
            id="dialogue-next"
            type="button"
            >
            NEXT
            </button>

            </div>

            </div>

            </div>
            
            `;

            document.body.appenChild(
                this.container,
            );


            this.dialogueBox =
            this.container.querySelector(
                ".dialogue-box",
            );

            this.speakerElement =
            this.container.querySelector(
                "#dialogue-speaker",
            );

            this.progressElement =
            this.container.querySelector(
                "#dialogue-progress",
            );

            this.continueHint =
            this.container.querySelector(
                "#dialogue-hint",
            );

            this.nextButton =
            this.container.querySelector(
                "#dialogue-next",
            );

            this.potraitElement =
            this.container.querySelector(
                "#dialogue-potrait",
            );

            this.hide();
        }


        //eventS

        bindEvents() {
            document.addEventListener(
                "keydown",
                (event) => {

                    if (!this.active) {
                        return;
                    }

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();

                        this.handleAdvance();
                    }


                    if (
                        event.key === "Escape"
                    ) {
                        this.end();
                    }
                },
            );

            this.nectButton.addEventListener(
                "click",
                () => {
                    this.handleAdvance();
                },
            );
        }

        //start dialogue

        start(lines, options = {}) {
            if (!Array.isArray(lines)) {
                lines = [lines];
            }

            const normalizedLines =
            lines
            .map((line) =>
                this.normalizedLine(
                    line,
                    options,
                ),
            )
            .filter(
                (line) =>
                    line.text.length > 0,
            );


            if (
                normalizedLines.length === 0
            ) {
                return Promise.resolve();
            }

            this.lines =
            normalizedLines;

            this.currentLine = 0;

            this.active = true;

            this.resolve =
            null;

            this.reject =
            null;

            this.show();

            this.renderCurrentLine();


            return new Promise(
                (resolve, reject) => {
                    this.resolve =
                    resolve;

                    this.reject =
                    reject;
                },
            );
        }

        //normalize line

        normalizeLine(
            line,
            defaults = {},
        ) {
            if (
                typeof line === "string"
            ) {
                return {
                    speaker:
                    defaults.speaker ??
                    "Unknown",

                    text:
                    line,

                    potrait:
                    defaults.potrait ??
                    null,

                    color:
                    defaults.color ??
                    null,

                    nameplate:
                    defaults.nameplate ??
                    null,

                    voice:
                    null,

                    duration:
                    null,

                    metadata:
                    {},
                };
            }

            return {
                speaker:
                line.speaker ??
                defaults.speaker ??
                "Unknown",

                text:
                line.text ??
                "",

                potrait:
                line.potrait ??
                defaults.potrait ??
                null,

                color:
                line.color ??
                defaults.color ??
                null,

                nameplate:
                line.nameplate ??
                defaults.nameplate ??
                null,

                voice:
                line.voice ??
                null,

                duration:
                line.duration ??
                null,

                metadata:
                line.metadata ??
                {},
            };
        }

        // render current line

        renderCurrentLine() {
            const line =
            this.lines[
                this.currentLine
            ];

            if (!line) {
                this.end();
                return;
            }


            this.stopTyping();


            this.speakerElement.textContent =
            line.nameplate ??
            line.speaker;

            
            this.progressElement.textContent =
            `${this.currentLine + 1} / ${
                this.lines.length
            }`;


            this.updatePotrait(
                line,
            );


            this.updateSpeakerColor(
                line,
            );

            this.textElement.textContent =
            "";

            this.currentText =
            line.text;

            this.currentText =
            line.text;

            this.currentCharacter =
            0;

            this.typing =
            true;

            this.continueHint.textContent =
            "TYPING..."

            this.nextButton.textContent =
            "SKIP";

            this.typeNextCharacter(
                line,
            );


            window.dispatchEvent(
                new CustomEvent(
                    "dialogue:lineStarted",
                    {
                        detail: {
                            line,
                            index:
                            this.currentLine,
                            total:
                            this.lines.length,
                        },
                    },
                ),
            );
        }

        //typewriter

        typeNextCharacter(line) {
            if (!this.active) {
                return;
            }


            if (
                this.currentCharacter >=
                this.currentText.length
            ) {
                this.finishTyping();
                return;
            }


            this.textElement.textContent =
            this.currentText.slice(
                0,
                this.currentCharacter + 1,
            );


            this.currentCharacter++;


            this.typeTimer =
            window.setTimeout(
                () => {
                    this.typeNextCharacter(
                        line,
                    );
                },
                this.options.typeSpeed,
            );
        }

        //finish typing

        finishTyping() {
            this.stopTyping();

            this.typing =
            false;

            this.textElement.textContent =
            this.currentText;

            this.textElement.textContent =
            this.currentText;

            this.continueHint.textContent =
            this.isLastLine()
            ? "ENTER TO FINISH"
            : "ENTER TO COTINUE";

            this.nextButton.textContent =
            this.isLastLine()
            ? "FINISH"
            : "NEXT";


            window.dispatchEvent(
                new CustomEvent(
                    "dialogue:lineFinished",
                    {
                        detail: {
                            index:
                            this.currentLine,
                        
                            line:
                            this.lines[
                                this.currentLine
                            ],
                        },
                    },
                ),
            );
        }


        //handle advance

        handleAdvance() {
            if (!this.active) {
                return;
            }


            if (
                this.typing &&
                this.options.allowSkipTyping
            ) {
                this.finishTyping();
                return;
            }


            this.next();
        }

        //next/d//d//d///d//d//d/d/d//d//d/////d//d/d/d//d/d//d//d//d//d//d///d///d//d///d///d///d//d//d/dddd/d//d/d//d/d/d//d/d//dd////d/d/d//d/d//d//d//d///d//d//d//d//d//d//d//d//d//d///d//d//d///d//d//d/d//d/d//d//d///d//d//d//d////d///d//d/d/d//d///d//d//d//d//d///d/d//d//d///d//d//d//d/d/d/d/d/

        next() {
            if (!this.active) {
                return;
            }


            if (this.typing) {
                if (
                    this.options.allowSkipTyping
                ) {
                    this.finishTyping();
                }

                return;
            }


            if (this.isLastLine()) {
                this.end();
                return;
            }


            this.currentLine++;

            this.renderCurrentLine();
        }

        //check last line

        isLastLine() {
            return (
                this.currentLine >=
                this.lines.length - 1
            );
        }

        //potrait

        updatePotrait(line) {
            this.potraitElement.innerHTML =
            "";


            if (
                line.potrait
            ) {
                const image =
                document.createElement(
                    "img",
                );

                image.src =
                line.potrait;

                image.alt =
                line.speaker;

                image.loading =
                "lazy";

                image.onerror =
                () => {
                    this.showPlaceholder(
                        line.speaker,
                    );
                };

                this.potraitElement.appendChild(
                    image,
                );

                return;
            }


            this.showPlaceholder(
                line.speaker,
            );
        }

        //potrait placeholder

        showPlaceholder(
            speaker,
        ) {
            this.potraitElement.innerHTML = `
            <div class="potrait-placeholder">
            ${this.getInitials(
                speaker,
            )}
            </div>
            `;
        }

        //initials

        getInitials(name) {
            const words =
            String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


        if (
            words.length === 0
        ) {
            return "?";
        }


        if (
            words.length --- 1
        ) {
            return words[0]
            /slice(0, 2)
            .toUpperCase();
        }


        return (
            words[0][0] +
            words[
                words.length - 1
            ][0]
        ).toUpperCase();
    }


    //speaker color

    updateSpeakerColor(line) {
        if (
            line.colo
        ) {
            this.speakerElement.style.colo =
            line.color;

            return;
        }


        this.speakerElement.stle.color =
        "";
    }


    //stop typewriting

    stopTyping() {
        if (
            this.typeTimer !== null
        ) {
            window.clearTimeout(
                this.typeTimer,
            );

            this.typeTimer =
            null;
        }

        this.typing =
        false;
    }


    //show

    show() {
        this.container.classList.add(
            "active",
        );
    }

    //hide

    hide() {
        this.container.classList.remove(
            "active",
        );
    }

    //end

    end() {
        if (!this.active) {
            return;
        }


        this.stopTyping();


        const finishedLines =
        this.lines.length;

        this.active =
        false;


        this.hide();


        const resolve =
        this.resolve;


        this.resolve =
        null;

        this.reject =
        null;


        window.dispatchEvent(
            new CustomEvent(
                "dialogue:finsihed",
                {
                    detail: {
                        lines:
                        finshedLines,
                    },
                },
            ),
        );


        if (resolve) {
            resolve();
        }
    }


    //force close

    close() {
        this.stopTyping();

        this.active =
        false;

        this.hide();


        if (this.reject) {
            this.reject(
                new Error(
                    "Dialogue closed",
                ),
            );
        }

        this.resolve =
        null;

        this.reject =
        null;
    }

    //set type speed

    setTypeSpeed(
        milliseconds,
    ) {
        this.options.typeSpeed =
        Math.max(
            0,
            Number(
                milliseconds,
            ) || 0,
        );
    }

    //get state

    isActive() {
        return this.active;
    }

    isTyping() {
        return this.typing;
    }

    getCurrentLine() {
        return this.lines[
            this.currentLine
        ] ?? null;
    }


    getCurrentIndex() {
        return this.currentLine;
    }

    //story helpers

    scientistIntro() {
        return this.start([
            {
                speaker:
                "SCIENTIS",

                text:
                "Wait... your're a dinosaur",

                color:
                "#b9d8e8",
            },

            {
                speaker:
                "DINO",

                text:
                "...",

                color:
                "#c7dbca",
            },

            {
                speaker:
                "SCIENTIST",

                text:"How did you get here?",

                color:
                "#b9d8e8",
            },

            {
                speaker:
                "SCIENTIST",

                text:
                "Your timeline shouldn't even be connected to ours",

                color:
                "#b9d8e8",
            },

            {
                speaker:
                "SCIENTIST",

                text:
                "Unless that temporal disturbance brought you here",

                color:
                "#b9d8e8",
            },
        ]);
    }

    modernEraArrival() {
        return this.start([
            {
                speaker:
                "SYSTEM",

                text:"TEMPORAL TRANSITION COMPLETE",

                color:
                "#e6be70",
            },

            {
                speaker:
                "SYSTEM",

                text:
                "ERA: MODERN",

                color:
                "e6be70",
            },

            {
                speaker:
                "DINO",

                text:
                "...",

                color:
                "#c7dbca",
            },

            {
                speaker:
                "SYSTEM",

                text:
                "WARNING: TIMELINE DISCREPANCY DETECTED",

                color:
                "#e57676",
            },
        ]);
    }


    hyperspaceWarning() {
        return this.start([
            {
                speaker:
                "SYSTEM",

                text:
                "HYPERSPACE ENTRY DETECTED",

                color:
                "#e6be70",
            },

            {
                speaker:
                "SYSTEM",

                text:
                "temporal coordinates are unstable",

                color:
                "#e6be70",
            },

            {
                speaker:
                "SYSTEM",

                text:
                "Do not remain inside the transition corridor",

                color:
                "#e57676",
            },
        ]);
    }

    asteroidWarning() {
        return this.start([
            {
                speaker:
                "SCIENTIST",

                text:
                "I found the object you're talking about",

                color:
                "#b9d8e8",
            },

            {
                speaker:
                "SCIENTIST",

                text:
                "It's an asteroid, and its trajectory intersects your timeline",

                color:
                "#b9d8e8",
            },

            {
                speaker:
                "SCIENTIST",

                text:
                "You don't have much time",

                color:"#e57676",
            },

            {
                speaker:
                "SCIENTIST",

                text:
                "We're going to need a way to reach it",

                color:
                "#b9d8e8",
            },
        ]);
    }


    rocketLaunch() {
        return this.start([
            {
                speaker:
                "SYSTEM",

                text:
                "LAUNCH SYSTEM ONLINE",

                color:
                "#75d69b",
            },

            {
                speaker:
                "SYSTEM",

                text:
                "TARGET: ASTEROID",

                color:
                "#e6be70",
            },

            {
                speaker:
                "DINO",

                text:
                "...!",

                color:
                "#c7dbca",
            },

            {
                speaker:
                "SYSTEM",

                text:
                "BEGINNING ASCENT",

                color:
                "#75d69b",
            },
        ]);
    }
}

