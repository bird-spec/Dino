import "./ui.css";

/**
 * StoryStageManager
 *
 * Frontend/story-flow layer for Dino: 4D Hyperspace.
 *
 * Responsibilities:
 * - Story stage progression
 * - Story beats
 * - Cutscene dialogue
 * - Stage objectives
 * - Story unlocks
 * - Story flags
 * - Narrative transitions
 * - Story persistence
 *
 * It deliberately does NOT own:
 * - player movement
 * - collisions
 * - inventory logic
 * - quest logic
 * - NPC AI
 * - world generation
 * - Three.js rendering
 *
 * Those systems belong to the other project modules.
 */

const STORAGE_KEY =
  "dino_4d_story_progress";

const DEFAULT_STAGE =
  "prehistoric_intro";

export class StoryStageManager {

  constructor({
    ui = null,
    storage = true,
    debug = false,
  } = {}) {

    this.ui =
      ui;

    this.storageEnabled =
      storage;

    this.debug =
      debug;

    this.currentStage =
      DEFAULT_STAGE;

    this.currentBeatIndex =
      0;

    this.flags =
      {};

    this.unlockedStages =
      new Set([
        DEFAULT_STAGE,
      ]);

    this.completedStages =
      new Set();

    this.stageHistory =
      [];

    this.active =
      false;

    this.transitioning =
      false;

    this.listeners =
      new Map();

    this.story =
      this.createStoryDefinition();

    this.load();

    this.createStoryOverlay();

    this.bindKeyboard();

    this.log(
      "StoryStageManager initialized.",
    );
  }


  //story definition

  createStoryDefinition() {

    return {

      prehistoric_intro: {

        id:
          "prehistoric_intro",

        era:
          "prehistoric",

        title:
          "The World Before",

        description:
          "Dino's life begins in a world untouched by human civilization.",

        objective:
          "Explore the prehistoric world.",

        beats: [

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "Long before humans walked the Earth, Dino lived in a world ruled by prehistoric creatures.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "For Dino, it was just another day.",
          },

          {
            type:
              "dialogue",

            speaker:
              "DINO",

            text:
              "...",
          },

          {
            type:
              "objective",

            text:
              "Explore the prehistoric world.",
          },

          {
            type:
              "flag",

            key:
              "intro_started",

            value:
              true,
          },

        ],

        next:
          "temporal_anomaly",
      },


      temporal_anomaly: {

        id:
          "temporal_anomaly",

        era:
          "prehistoric",

        title:
          "Something Is Wrong",

        description:
          "The prehistoric timeline has begun behaving strangely.",

        objective:
          "Investigate the strange disturbance.",

        beats: [

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "The sky changes.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "Animals begin reacting to something Dino cannot see.",
          },

          {
            type:
              "dialogue",

            speaker:
              "TEMPORAL SIGNAL",

            text:
              "WARNING. TEMPORAL INSTABILITY DETECTED.",
          },

          {
            type:
              "dialogue",

            speaker:
              "TEMPORAL SIGNAL",

            text:
              "IMPACT EVENT IDENTIFIED.",
          },

          {
            type:
              "objective",

            text:
              "Find the source of the temporal signal.",
          },

          {
            type:
              "flag",

            key:
              "temporal_anomaly_seen",

            value:
              true,
          },

        ],

        next:
          "hyperspace_discovery",
      },


      hyperspace_discovery: {

        id:
          "hyperspace_discovery",

        era:
          "prehistoric",

        title:
          "The Fourth Dimension",

        description:
          "Dino discovers a method of moving through time.",

        objective:
          "Investigate the Hyperspace phenomenon.",

        beats: [

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "Something appears where nothing existed before.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "The space around Dino bends into an unfamiliar pattern.",
          },

          {
            type:
              "dialogue",

            speaker:
              "TEMPORAL SIGNAL",

            text:
              "FOUR-DIMENSIONAL TRANSIT CORRIDOR AVAILABLE.",
          },

          {
            type:
              "dialogue",

            speaker:
              "TEMPORAL SIGNAL",

            text:
              "DESTINATION PARAMETERS REQUIRED.",
          },

          {
            type:
              "objective",

            text:
              "Enter 4D Hyperspace.",
          },

          {
            type:
              "flag",

            key:
              "hyperspace_discovered",

            value:
              true,
          },

        ],

        next:
          "modern_arrival",
      },


      modern_arrival: {

        id:
          "modern_arrival",

        era:
          "modern",

        title:
          "A World That Should Not Exist",

        description:
          "Dino arrives in the modern era.",

        objective:
          "Find out where you are.",

        beats: [

          {
            type:
              "transition",

            from:
              "prehistoric",

            to:
              "modern",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "The transition ends.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "The world Dino remembers is gone.",
          },

          {
            type:
              "dialogue",

            speaker:
              "HUMAN",

            text:
              "Why is there a dinosaur here?",
          },

          {
            type:
              "objective",

            text:
              "Explore the modern world.",
          },

          {
            type:
              "flag",

            key:
              "modern_arrival_seen",

            value:
              true,
          },

        ],

        next:
          "meet_scientist",
      },


      meet_scientist: {

        id:
          "meet_scientist",

        era:
          "modern",

        title:
          "The Scientist",

        description:
          "A scientist realizes that Dino may have crossed time.",

        objective:
          "Meet the scientist.",

        beats: [

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "You're definitely not supposed to be here.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "More importantly, you're not supposed to exist in this era.",
          },

          {
            type:
              "dialogue",

            speaker:
              "DINO",

            text:
              "...",
          },

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "You came through time, didn't you?",
          },

          {
            type:
              "objective",

            text:
              "Talk to the scientist.",
          },

          {
            type:
              "flag",

            key:
              "scientist_met",

            value:
              true,
          },

        ],

        next:
          "asteroid_discovery",
      },


      asteroid_discovery: {

        id:
          "asteroid_discovery",

        era:
          "modern",

        title:
          "The Impact Event",

        description:
          "The scientist identifies the object threatening Dino's timeline.",

        objective:
          "Learn about the asteroid.",

        beats: [

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "I think I understand why you appeared.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "Something is approaching your era.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "An asteroid.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "Its current trajectory intersects your timeline.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "You need to go back.",
          },

          {
            type:
              "objective",

            text:
              "Learn how to stop the asteroid.",
          },

          {
            type:
              "flag",

            key:
              "asteroid_identified",

            value:
              true,
          },

        ],

        next:
          "return_home",
      },


      return_home: {

        id:
          "return_home",

        era:
          "modern",

        title:
          "Back Through Hyperspace",

        description:
          "Dino returns to the prehistoric era with knowledge from the future.",

        objective:
          "Return to the prehistoric timeline.",

        beats: [

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "We can't send anything through time safely except the Hyperspace corridor.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SCIENTIST",

            text:
              "Whatever you build, you'll have to finish it yourself.",
          },

          {
            type:
              "objective",

            text:
              "Enter Hyperspace and return home.",
          },

          {
            type:
              "flag",

            key:
              "return_prepared",

            value:
              true,
          },

        ],

        next:
          "rocket_building",
      },


      rocket_building: {

        id:
          "rocket_building",

        era:
          "prehistoric",

        title:
          "Build Something Impossible",

        description:
          "Dino brings future knowledge back to the prehistoric era.",

        objective:
          "Build the rocket.",

        beats: [

          {
            type:
              "transition",

            from:
              "modern",

            to:
              "prehistoric",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "Dino returns to his own time.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "The asteroid is still coming.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "There is only one option.",
          },

          {
            type:
              "objective",

            text:
              "Gather materials and construct the rocket.",
          },

          {
            type:
              "flag",

            key:
              "rocket_project_started",

            value:
              true,
          },

        ],

        next:
          "rocket_ready",
      },


      rocket_ready: {

        id:
          "rocket_ready",

        era:
          "prehistoric",

        title:
          "Launch Preparation",

        description:
          "The rocket is complete.",

        objective:
          "Prepare for launch.",

        beats: [

          {
            type:
              "dialogue",

            speaker:
              "SYSTEM",

            text:
              "ROCKET SYSTEMS ONLINE.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SYSTEM",

            text:
              "TRAJECTORY CALCULATED.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SYSTEM",

            text:
              "ASTEROID INTERCEPT WINDOW IDENTIFIED.",
          },

          {
            type:
              "objective",

            text:
              "Enter the rocket and launch.",
          },

          {
            type:
              "flag",

            key:
              "rocket_ready",

            value:
              true,
          },

        ],

        next:
          "space_mission",
      },


      space_mission: {

        id:
          "space_mission",

        era:
          "space",

        title:
          "Leave the World Behind",

        description:
          "Dino reaches space for the first time.",

        objective:
          "Reach the asteroid.",

        beats: [

          {
            type:
              "transition",

            from:
              "prehistoric",

            to:
              "space",
          },

          {
            type:
              "dialogue",

            speaker:
              "SYSTEM",

            text:
              "LAUNCH CONFIRMED.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SYSTEM",

            text:
              "ASCENT COMPLETE.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "For the first time, Dino sees his entire world from above.",
          },

          {
            type:
              "objective",

            text:
              "Navigate toward the asteroid.",
          },

          {
            type:
              "flag",

            key:
              "space_reached",

            value:
              true,
          },

        ],

        next:
          "asteroid_mission",
      },


      asteroid_mission: {

        id:
          "asteroid_mission",

        era:
          "space",

        title:
          "The Impact Point",

        description:
          "Dino reaches the asteroid threatening his timeline.",

        objective:
          "Stop the asteroid.",

        beats: [

          {
            type:
              "dialogue",

            speaker:
              "SYSTEM",

            text:
              "TARGET LOCKED.",
          },

          {
            type:
              "dialogue",

            speaker:
              "SYSTEM",

            text:
              "IMPACT WINDOW APPROACHING.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "Everything Dino knows is behind him.",
          },

          {
            type:
              "objective",

            text:
              "Complete the asteroid mission.",
          },

          {
            type:
              "flag",

            key:
              "asteroid_mission_started",

            value:
              true,
          },

        ],

        next:
          "ending",
      },


      ending: {

        id:
          "ending",

        era:
          "prehistoric",

        title:
          "A Future Still Alive",

        description:
          "Dino returns to a world that survived.",

        objective:
          "Return home.",

        beats: [

          {
            type:
              "dialogue",

            speaker:
              "SYSTEM",

            text:
              "IMPACT EVENT AVOIDED.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "The prehistoric timeline survives.",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "Dino's world continues.",
          },

          {
            type:
              "dialogue",

            speaker:
              "DINO",

            text:
              "...",
          },

          {
            type:
              "dialogue",

            speaker:
              "NARRATOR",

            text:
              "For now.",
          },

          {
            type:
              "flag",

            key:
              "story_completed",

            value:
              true,
          },

        ],

        next:
          null,
      },

    };
  }


  //start story

  start() {

    if (
      this.active
    ) {
      return;
    }


    this.active =
      true;


    this.currentBeatIndex =
      0;


    this.emit(
      "storyStarted",
      {
        stage:
          this.currentStage,
      },
    );


    this.enterStage(
      this.currentStage,
    );
  }


  //enter stage

  enterStage(
    stageId,
  ) {

    const stage =
      this.story[
        stageId
      ];


    if (
      !stage
    ) {

      console.error(
        `Unknown story stage: ${stageId}`,
      );

      return;
    }


    this.currentStage =
      stageId;


    this.currentBeatIndex =
      0;


    this.unlockedStages.add(
      stageId,
    );


    this.stageHistory.push(
      {
        stage:
          stageId,

        enteredAt:
          Date.now(),
      },
    );


    this.log(
      `Entered story stage: ${stageId}`,
    );


    if (
      this.ui
    ) {

      this.ui.setEra(
        stage.era,
      );


      this.ui.setObjective(
        stage.objective,
        stage.description,
      );
    }


    this.emit(
      "stageEntered",
      {
        stageId,
        stage,
      },
    );


    this.playCurrentBeat();
  }


  //play current beat

  async playCurrentBeat() {

    const stage =
      this.story[
        this.currentStage
      ];


    if (
      !stage
    ) {
      return;
    }


    const beat =
      stage.beats[
        this.currentBeatIndex
      ];


    if (
      !beat
    ) {

      this.finishStage();

      return;
    }


    this.log(
      `Playing beat ${this.currentBeatIndex + 1} of ${stage.beats.length}`,
    );


    this.emit(
      "beatStarted",
      {
        stageId:
          this.currentStage,

        beatIndex:
          this.currentBeatIndex,

        beat,
      },
    );


    await this.executeBeat(
      beat,
    );


    this.emit(
      "beatFinished",
      {
        stageId:
          this.currentStage,

        beatIndex:
          this.currentBeatIndex,

        beat,
      },
    );


    if (
      !this.active
    ) {
      return;
    }


    this.currentBeatIndex +=
      1;


    this.playCurrentBeat();
  }


  //execute beat

  async executeBeat(
    beat,
  ) {

    switch (
      beat.type
    ) {

      case "dialogue":

        await this.playDialogue(
          beat,
        );

        break;


      case "objective":

        this.setObjective(
          beat.text,
        );

        break;


      case "flag":

        this.setFlag(
          beat.key,
          beat.value,
        );

        break;


      case "transition":

        await this.playTransition(
          beat,
        );

        break;


      case "wait":

        await this.wait(
          beat.duration ??
            500,
        );

        break;


      case "notification":

        this.notify(
          beat.text,
          beat.type ??
            "info",
        );

        break;


      default:

        this.log(
          `Unknown beat type: ${beat.type}`,
        );

        break;
    }
  }


  //dialogue

  async playDialogue(
    beat,
  ) {

    if (
      !this.ui
    ) {
      return;
    }


    await this.ui.showDialogue([
      {
        speaker:
          beat.speaker,

        text:
          beat.text,
      },
    ]);
  }


  //objective

  setObjective(
    text,
  ) {

    const stage =
      this.story[
        this.currentStage
      ];


    if (
      !stage
    ) {
      return;
    }


    stage.objective =
      text;


    if (
      this.ui
    ) {

      this.ui.setObjective(
        text,
        stage.description,
      );
    }


    this.emit(
      "objectiveChanged",
      {
        stageId:
          this.currentStage,

        objective:
          text,
      },
    );
  }


  //transition

  async playTransition(
    beat,
  ) {

    if (
      this.ui
    ) {

      this.ui.showToast(
        "TEMPORAL TRANSITION",
        `${this.formatName(
          beat.from,
        )} → ${this.formatName(
          beat.to,
        )}`,
      );


      this.ui.fadeTo(
        1,
        450,
      );
    }


    this.emit(
      "transitionStarted",
      {
        from:
          beat.from,

        to:
          beat.to,
      },
    );


    await this.wait(
      650,
    );


    this.emit(
      "transitionCompleted",
      {
        from:
          beat.from,

        to:
          beat.to,
      },
    );


    if (
      this.ui
    ) {

      this.ui.setEra(
        beat.to,
      );


      this.ui.fadeTo(
        0,
        700,
      );
    }


    await this.wait(
      200,
    );
  }


  //finish stage

  finishStage() {

    const stage =
      this.story[
        this.currentStage
      ];


    if (
      !stage
    ) {
      return;
    }


    this.completedStages.add(
      this.currentStage,
    );


    this.emit(
      "stageCompleted",
      {
        stageId:
          this.currentStage,

        stage,
      },
    );


    this.log(
      `Completed story stage: ${this.currentStage}`,
    );


    if (
      stage.next
    ) {

      this.unlockedStages.add(
        stage.next,
      );


      this.emit(
        "nextStageUnlocked",
        {
          stageId:
            stage.next,
        },
      );


      return;
    }


    this.finishStory();
  }


  //advance story

  advance() {

    const stage =
      this.story[
        this.currentStage
      ];


    if (
      !stage?.next
    ) {

      this.finishStory();

      return;
    }


    this.enterStage(
      stage.next,
    );
  }


  //complete current stage

  completeCurrentStage() {

    this.currentBeatIndex =
      this.story[
        this.currentStage
      ]?.beats.length ??
      0;


    this.finishStage();
  }


  //skip current stage

  skipStage() {

    if (
      !this.debug
    ) {

      console.warn(
        "Story skipping is disabled.",
      );

      return;
    }


    const stage =
      this.story[
        this.currentStage
      ];


    if (
      !stage
    ) {
      return;
    }


    this.currentBeatIndex =
      stage.beats.length;


    this.finishStage();
  }


  //finish entire story

  finishStory() {

    this.active =
      false;


    this.setFlag(
      "story_completed",
      true,
    );


    this.emit(
      "storyCompleted",
      {
        history:
          this.stageHistory,
      },
    );


    if (
      this.ui
    ) {

      this.ui.showToast(
        "TIMELINE SAVED",
        "Dino's world survived.",
      );

    }
  }


  //flags

  setFlag(
    key,
    value = true,
  ) {

    this.flags[
      key
    ] =
      value;


    this.emit(
      "flagChanged",
      {
        key,
        value,
      },
    );


    this.save();
  }


  getFlag(
    key,
  ) {

    return (
      this.flags[
        key
      ] ??
      false
    );
  }


  hasFlag(
    key,
  ) {

    return Boolean(
      this.flags[
        key
      ],
    );
  }


  //unlocks

  isStageUnlocked(
    stageId,
  ) {

    return this.unlockedStages.has(
      stageId,
    );
  }


  isStageCompleted(
    stageId,
  ) {

    return this.completedStages.has(
      stageId,
    );
  }


  getUnlockedStages() {

    return [
      ...this.unlockedStages,
    ];
  }


  getCompletedStages() {

    return [
      ...this.completedStages,
    ];
  }


  //current stage

  getCurrentStage() {

    return this.story[
      this.currentStage
    ] ?? null;
  }


  getCurrentStageId() {

    return this.currentStage;
  }


  getCurrentBeatIndex() {

    return this.currentBeatIndex;
  }


  getState() {

    return {
      currentStage:
        this.currentStage,

      currentBeatIndex:
        this.currentBeatIndex,

      active:
        this.active,

      transitioning:
        this.transitioning,

      flags:
        {
          ...this.flags,
        },

      unlockedStages:
        [
          ...this.unlockedStages,
        ],

      completedStages:
        [
          ...this.completedStages,
        ],

      stageHistory:
        [
          ...this.stageHistory,
        ],
    };
  }


  //persistence

  save() {

    if (
      !this.storageEnabled
    ) {
      return;
    }


    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          this.getState(),
        ),
      );

    } catch (
      error
    ) {

      console.warn(
        "Could not save story progress.",
        error,
      );
    }
  }


  load() {

    if (
      !this.storageEnabled
    ) {
      return;
    }


    try {

      const raw =
        localStorage.getItem(
          STORAGE_KEY,
        );


      if (
        !raw
      ) {
        return;
      }


      const state =
        JSON.parse(
          raw,
        );


      if (
        state.currentStage &&
        this.story[
          state.currentStage
        ]
      ) {

        this.currentStage =
          state.currentStage;
      }


      if (
        Number.isInteger(
          state.currentBeatIndex,
        )
      ) {

        this.currentBeatIndex =
          state.currentBeatIndex;
      }


      this.active =
        Boolean(
          state.active,
        );


      this.flags =
        {
          ...(
            state.flags ??
            {}
          ),
        };


      this.unlockedStages =
        new Set(
          state.unlockedStages ??
          [
            DEFAULT_STAGE,
          ],
        );


      this.completedStages =
        new Set(
          state.completedStages ??
          [],
        );


      this.stageHistory =
        Array.isArray(
          state.stageHistory,
        )
          ? state.stageHistory
          : [];


    } catch (
      error
    ) {

      console.warn(
        "Could not load story progress.",
        error,
      );
    }
  }


  //reset

  reset() {

    this.currentStage =
      DEFAULT_STAGE;

    this.currentBeatIndex =
      0;

    this.flags =
      {};

    this.unlockedStages =
      new Set([
        DEFAULT_STAGE,
      ]);

    this.completedStages =
      new Set();

    this.stageHistory =
      [];

    this.active =
      false;

    this.transitioning =
      false;


    if (
      this.storageEnabled
    ) {

      localStorage.removeItem(
        STORAGE_KEY,
      );
    }


    this.emit(
      "storyReset",
    );
  }


  //event system

  on(
    eventName,
    callback,
  ) {

    if (
      !this.listeners.has(
        eventName,
      )
    ) {

      this.listeners.set(
        eventName,
        new Set(),
      );
    }


    const set =
      this.listeners.get(
        eventName,
      );


    set.add(
      callback,
    );


    return () => {

      set.delete(
        callback,
      );
    };
  }


  emit(
    eventName,
    payload = {},
  ) {

    const listeners =
      this.listeners.get(
        eventName,
      );


    if (
      !listeners
    ) {
      return;
    }


    for (
      const listener
      of listeners
    ) {

      try {

        listener(
          payload,
        );

      } catch (
        error
      ) {

        console.error(
          `Story listener failed for ${eventName}:`,
          error,
        );
      }
    }
  }


  //notification

  notify(
    message,
    type = "info",
  ) {

    if (
      this.ui
    ) {

      this.ui.notify(
        message,
        type,
      );
    }


    this.emit(
      "notification",
      {
        message,
        type,
      },
    );
  }


  //keyboard

  bindKeyboard() {

    window.addEventListener(
      "keydown",
      (event) => {

        if (
          !this.active
        ) {
          return;
        }


        /*
         * F2 is intentionally only a debug
         * story-control key.
         */

        if (
          event.key === "F2" &&
          this.debug
        ) {

          event.preventDefault();

          this.skipStage();
        }


        if (
          event.key === "F3" &&
          this.debug
        ) {

          event.preventDefault();

          console.log(
            this.getState(),
          );
        }
      },
    );
  }


  //story overlay

  createStoryOverlay() {

    this.overlay =
      document.createElement(
        "div",
      );


    this.overlay.id =
      "story-stage-overlay";


    this.overlay.innerHTML = `
      <div class="story-stage-card">

        <div class="story-stage-top">

          <div>

            <div
              class="story-stage-kicker"
              id="story-stage-kicker"
            >
              STORY STAGE
            </div>

            <div
              class="story-stage-title"
              id="story-stage-title"
            >
              The Beginning
            </div>

          </div>

          <div
            class="story-stage-counter"
            id="story-stage-counter"
          >
            1 / 12
          </div>

        </div>


        <div
          class="story-stage-description"
          id="story-stage-description"
        >
          Explore the prehistoric world.
        </div>


        <div class="story-stage-progress">

          <div
            class="story-stage-progress-fill"
            id="story-stage-progress-fill"
          ></div>

        </div>

      </div>
    `;


    document.body.appendChild(
      this.overlay,
    );


    this.storyStageTitle =
      this.overlay.querySelector(
        "#story-stage-title",
      );


    this.storyStageDescription =
      this.overlay.querySelector(
        "#story-stage-description",
      );


    this.storyStageCounter =
      this.overlay.querySelector(
        "#story-stage-counter",
      );


    this.storyStageProgress =
      this.overlay.querySelector(
        "#story-stage-progress-fill",
      );


    this.on(
      "stageEntered",
      ({
        stageId,
        stage,
      }) => {

        this.updateStoryOverlay(
          stageId,
          stage,
        );

      },
    );


    this.on(
      "stageCompleted",
      () => {

        this.overlay.classList.add(
          "completed",
        );

        window.setTimeout(
          () => {

            this.overlay.classList.remove(
              "completed",
            );

          },
          900,
        );
      },
    );
  }


  updateStoryOverlay(
    stageId,
    stage,
  ) {

    this.storyStageTitle.textContent =
      stage.title;


    this.storyStageDescription.textContent =
      stage.objective;


    const ids =
      Object.keys(
        this.story,
      );


    const index =
      ids.indexOf(
        stageId,
      );


    const total =
      ids.length;


    this.storyStageCounter.textContent =
      `${index + 1} / ${total}`;


    this.storyStageProgress.style.width =
      `${(
        (
          index + 1
        ) /
        total
      ) * 100}%`;


    this.overlay.classList.add(
      "active",
    );


    window.clearTimeout(
      this.overlayTimeout,
    );


    this.overlayTimeout =
      window.setTimeout(
        () => {

          this.overlay.classList.remove(
            "active",
          );

        },
        4500,
      );
  }


  //helpers
  

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


  wait(
    milliseconds,
  ) {

    return new Promise(
      (resolve) => {

        window.setTimeout(
          resolve,
          milliseconds,
        );

      },
    );
  }


  log(
    message,
  ) {

    if (
      !this.debug
    ) {
      return;
    }


    console.log(
      `[StoryStageManager] ${message}`,
    );
  }
}