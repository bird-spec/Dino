import { EVENTS } from "../core/events.js";
import { NotFoundError, ValidationError } from "../core/errors.js";
import { deepClone } from "../core/utils.js";

export class DialogueSystem {
  constructor({
    state,
    eventBus,
    dialogueCatalog,
    inventory,
    quests,
    storyFlags,
    time,
    npcSystem,
  }) {
    this.eventBus = eventBus;
    this.state = state;
    this.dialogueCatalog = dialogueCatalog;
    this.inventory = inventory;
    this.quests = quests;
    this.storyFlags = storyFlags;
    this.time = time;
    this.npcSystem = npcSystem;
  }

  start(dialogueId, { npcId = undefined } = {}) {
    const dialogue = this._getDialogue(dialogueId);
    const resolvedNpcId = npcId ?? dialogue.npcId;

    if (resolvedNpcId) {
      this.npcSystem.markDiscovered(resolvedNpcId);
    }

    this.state.mutate(
      "dialogue.start",
      (state) => {
        state.dialogue.active = {
          dialogueId,
          nodeId: dialogue.startNode,
          npcId: resolvedNpcId ?? null,
        };
      },
      {
        eventType: EVENTS.DIALOGUE_STARTED,

        payload: {
          dialogueId,
          npcId: resolvedNpcId ?? null,
        },
      },
    );

    return this.getCurrent();
  }
  getCurrent() {
    const active = this.state.read((state) => state.dialogue.active);
    if (!active) {
      return null;
    }

    const dialogue = this._getDialogue(active.dialogueId);

    const node = dialogue.nodes[active.nodeId];
    if (!node) {
      throw new ValidationError(`Dialogue node ${active.nodeId} not found.`);
    }

    return {
      dialogueId: active.dialogueId,
      npcId: active.npcId,
      nodeId: active.nodeId,
      text: node.text,
      choices: deepClone(node.choices ?? []),
    };
  }

  choose(choiceId) {
    const active = this.state.read((state) => state.dialogue.active);
    if (!active) {
      throw new ValidationError("No active dialogue");
    }

    const dialogue = this._getDialogue(active.dialogueId);

    const node = dialogue.nodes[active.nodeId];

    const choice = (node.choices ?? []).find(
      (candidate) => candidate.id === choiceId,
    );
    if (!choice) {
      throw new NotFoundError(`Unknown dialogue choice ${choiceId}`);
    }
    this._applyEffects(choice.effects ?? {});
    this.eventBus.emit(EVENTS.DIALOGUE_CHOICE, {
      dialogueId: active.dialogueId,
      nodeId: active.nodeId,
      choiceId: choiceId,
    });

    if (choice.end) {
      this.end("choice");
      return null;
    }

    const nextNode = choice.next;

    if (!nextNode || !dialogue.nodes[nextNode]) {
      throw new ValidationError(
        `Dialogue choice ${choiceId} points to an invalid node.`,
      );
    }

    this.state.mutate(
      "dialogue.next",
      (state) => {
        state.dialogue.active = { ...active, nodeId: nextNode };
      },
      {
        eventType: EVENTS.STATE_CHANGED,
        payload: {
          dialogueId: active.dialogueId,
          nextNode,
        },
      },
    );

    return this.getCurrent();
  }

  end(reason = "manual") {
    const active = this.state.read((state) => state.dialogue.active);

    if (!active) {
      return false;
    }

    this.state.mutate(
      "dialogue.end",
      (state) => {
        state.dialogue.active = null;
      },

      {
        eventType: EVENTS.DIALOGUE_ENDED,

        payload: {
          ...active,
          reason,
        },
      },
    );

    return true;
  }
  _applyEffects(effects) {
    for (const [key, value] of Object.entries(effects.setFlags ?? {})) {
      this.storyFlags.set(key, value, {
        source: "dialogue",
      });
    }

    if (effects.addItems) {
      const check = this.inventory.canAddBundle(effects.addItems);

      if (!check.ok) {
        throw new ValidationError(
          "Not enough inventory space for dialogue rewards",
        );
      }

      for (const [itemId, quantity] of Object.entries(effects.addItems)) {
        this.inventory.add(itemId, quantity, {
          source: "dialogue",
        });
      }
    }

    if (effects.startQuest) {
      this.quests.start(effects.startQuest);
    }

    if (effects.advanceTimeSeconds) {
      this.time.advance(effects.advanceTimeSeconds, {
        reason: "dialogue",
      });
    }

    if (effects.discoverNpc) {
      this.npcSystem.markDiscovered(effects.discoverNpc);
    }
  }

  _getDialogue(dialogueId) {
    const dialogue = this.dialogueCatalog[dialogueId];
    if (!dialogue) {
      throw new NotFoundError(`Unknown dialogue: ${dialogueId}.`);
    }

    return dialogue;
  }
}
