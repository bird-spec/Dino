import test from 'node:test';
import assert from 'node:assert/strict';
import{
    createGameAPI
} from "../src/game/index.js";

import {
    MemoryStorageAdapter
} from "../src/game/index.js";

test('can save current game state', () =>{
    const storage = new MemoryStorageAdapter();

    const game = createGameAPI({
        storage
    });

    game.inventory.add('stone', 5);

    const save = game.save.save('test');

    assert.equal(save.state.inventory.items.stone,
    5 );

    assert.equal(
        game.save.has('test'),
        true
    );
});

test ('can load saved game state', () =>{
    const storage = new MemoryStorageAdapter();
    const game = createGameAPI({
        storage
    });
    game.inventory.add('stone', 5);

    game.save.save('test');
    game.inventory.remove('stone',5);

    assert.equal(
        game.inventory.get('stone'), 0
    );

    game.save.load( 'test');
    assert.equal(
        game.inventory.get('stone'),5
    );
});

test('save and load restore quest progress', () => {
    const storage =
        new MemoryStorageAdapter();
    const game =
        createGameAPI({
            storage
        });

    game.quests.start(
        'gather_stone'
    );

    game.inventory.add('stone', 2);

    game.save.save('test');
    game.inventory.add('stone',3);
    game.save.load('test');
    assert.equal(
        game.inventory.get('stone'),2
    )

    const quest = game.quests.get('gather_stone');

    assert.equal(quest.objectives.stone_count, 2);

    test('invalid save slot names are rejected', () => {
        const storage =
            new MemoryStorageAdapter();
        const game =
            createGameAPI({
                storage
            });
        assert.throws(() => game.save.save('invalid slot!'), /Save slot must contain/);
    });
});