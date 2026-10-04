import test from 'node:test';
import assert from 'node:assert/strict';
import{
    createGameAPI
} from "../src/game/index.js";

test('can register a resource node' , () => {
    const game = createGameAPI();
    game.resources.registerNode({
        id: 'stone_01',
        type: 'stone_rock',
        quantity: 5,
        maxQuantity: 5
    });

    const node = game.resources.getNode('stone_01');

    assert.equal(node.id, 'stone_01');
    assert.equal(node.quantity, 5);
    assert.equal(node.type, 'stone_rock');
});

test('harvesting a resource gives the correct item', () => {
    const game = createGameAPI();
    game.resources.registerNode({
        id: 'stone_01',
        type: 'stone_rock',
        quantity: 5,
        maxQuantity: 5
    });

    const result =
        game.resources.harvest(
            'stone_01', 2
        );
    assert.equal(result.harvestedUnits, 2);
    assert.equal(result.itemId, 'stone');
    assert.equal(result.quantity, 2);
    assert.equal(game.inventory.get('stone'), 2);
});

test('harvesting cannot exceed the remaining resource quantity',() => {
    const game = createGameAPI();
    game.resources.registerNode({
        id: 'stone_01',
        type: 'stone_rock',
        quantity: 2,
        maxQuantity: 5
    });
    const result =
        game.resources.harvest(
            'stone_01', 5
        );
    assert.equal(result.harvestedUnits, 2);
    assert.equal(game.inventory.get('stone'), 2);
    assert.equal(game.resources.getNodeQuantity('stone_01'), 0 );
});

test('resource can respawn to maximum quantity', () => {
    const game = createGameAPI();
    game.resources.registerNode({
        id: 'stone_01',
        type: 'stone_rock',
        quantity: 5,
        maxQuantity: 5
    });

    game.resources.harvest(
        'stone_01',
        5
    );
    game.resources.respawn(
        'stone_01'
    );

    assert.equal(game.resources.getNodeQuantity('stone_01'), 5);
});
test('resource cannot respawn above maximum quantity', () => {
    const game = createGameAPI();

    game.resources.registerNode({
        id: 'stone_01',
        type: 'stone_rock',
        quantity: 5,
        maxQuantity: 5
    });

    assert.throws(() => game.resources.respawn(
        'stone_01',6
    ),
        /must be between/
    );
});

test('Unknown resource node throws an error', () => {
    const game = createGameAPI();
    assert.throws(() => game.resources.getNode('does_not_exist'),
        /Unknown resource node /
    );
});

