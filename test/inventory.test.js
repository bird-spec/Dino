import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createGameAPI
} from "../src/game/index.js";

test('can add an item to inventory', () => {
    const game = createGameAPI();

    game.inventory.add('stone', 5);

    assert.equal(
        game.inventory.get('stone'),
        5
    );
});

test('can remove an item from inventory', () => {
    const game = createGameAPI();
    game.inventory.remove('stone',2);
    game.inventory.add('stone',5);
    assert.equal(
        game.inventory.get('stone'),
        3
    );
});

test('inventory reports whether it has enough items', () => {
    const game = createGameAPI();

    game.inventory.add('stone', 5);

    assert.equal(
        game.inventory.has('stone', 5),
        true
    );

    assert.equal(
        game.inventory.has('stone', 6),
        false
    );
});

test('inventory rejects removing more items than available', () => {
    const game = createGameAPI();
    game.inventory.add('stone', 2);

    assert.throws(
        () => game.inventory.remove('stone', 3),
        /Not enough stone/
    );
});

test('inventory rejects invalid quantities', () => {
    const game = createGameAPI();
    assert.throws(
        () => game.inventory.add('stone', -1),
        /positive integer/
    );
});

test ('inventory capacity starts at 20 slots', () => {
    const game = createGameAPI();
    assert.equal(
        game.inventory.capacity(),
        20
    );
});
test ('inventory correctly calculates used and free slots', () => {
    const game = createGameAPI();
    game.inventory.add('stone',20);
    assert.equal(
        game.inventory.usedSlots(),
        1
    );

    assert.equal(
        game.inventory.freeSlots(),
        19
    );
});

test('unknown item is rejected', () => {
    const game = createGameAPI();
    assert.throws(
        () => game.inventory.add('not_a_real_item',1),
        /Unknown item/
    );
});

