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

    game.inventory.add('stone, 5');

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
});