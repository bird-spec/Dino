export class StoryFlow {
  constructor({
    api,
    ui,
  }) {

    this.api =
      api;

    this.ui =
      ui;

    this.started =
      false;

    this.bind();
  }


  bind() {

    window.addEventListener(
      "game:start",
      () => {
        this.begin();
      },
    );


    this.api.events.on(
      this.api.constants.EVENTS.QUEST_COMPLETED,
      (payload) => {

        this.handleQuestCompleted(
          payload?.questId,
        );

      },
    );


    this.api.events.on(
      this.api.constants.EVENTS.ROCKET_LAUNCHED,
      () => {

        this.ui.showToast(
          "ROCKET LAUNCH",
          "Dino has entered the next stage of the journey.",
        );

      },
    );


    this.api.events.on(
      this.api.constants.EVENTS.HYPERSPACE_ENTERED,
      () => {

        this.ui.showToast(
          "4D HYPERSPACE",
          "Temporal transition initiated.",
        );

      },
    );
  }


  async begin() {

    if (
      this.started
    ) {
      return;
    }


    this.started =
      true;


    await this.ui.showDialogue([
      {
        speaker:
          "TEMPORAL SIGNAL",

        text:
          "Unknown temporal signature detected.",
      },

      {
        speaker:
          "TEMPORAL SIGNAL",

        text:
          "Origin point: prehistoric timeline.",
      },

      {
        speaker:
          "SYSTEM",

        text:
          "A future impact event may destroy this timeline.",
      },

      {
        speaker:
          "SYSTEM",

        text:
          "Investigate the anomaly.",
      },
    ]);


    this.startInitialQuest();

    this.ui.showToast(
      "THE JOURNEY BEGINS",
      "Find out what is happening in the prehistoric world.",
    );
  }


  startInitialQuest() {

    const questId =
      "gather_stone";


    try {

      if (
        this.api.quests.isCompleted(
          questId,
        )
      ) {
        return;
      }


      if (
        this.api.quests.isActive(
          questId,
        )
      ) {
        return;
      }


      this.api.quests.start(
        questId,
      );

    } catch (
      error
    ) {

      console.warn(
        "Could not start initial quest:",
        error,
      );

    }
  }


  handleQuestCompleted(
    questId,
  ) {

    if (
      questId ===
      "gather_stone"
    ) {

      this.ui.showToast(
        "QUEST COMPLETE",
        "You have the basic materials needed to continue.",
      );

      return;
    }


    if (
      questId ===
      "gather_fiber"
    ) {

      this.ui.showToast(
        "QUEST COMPLETE",
        "The prehistoric world is starting to reveal its secrets.",
      );

      return;
    }


    if (
      questId ===
      "inspect_ancient_site"
    ) {

      this.ui.showToast(
        "ANCIENT DEVICE",
        "The strange machine may be connected to Hyperspace.",
      );

      return;
    }
  }
}