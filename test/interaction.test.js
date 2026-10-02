import test from 'node:test';
import assert from 'node:assert/strict';

import { createGameAPI} from "../src/game/index.js";

test('can register and use an interaction', () => {
    const game = createGameAPI();

    let called = false;
    game.interactions.register({
        id:'test_interaction',
        type:'object',
        handler: () => {
            called = true;
        }
    });

    game.interactions.use('test_interaction');
    assert.equal(called, true);
});

test('interaction records number of uses', ()=> {
    const game = createGameAPI();
    game.interactions.register({
        id: 'test_interaction',
        type: 'object',
    });
    game.interactions.use('test_interaction');

    assert.equal(
        game.getState()
            .interactions
            .test_interaction
            .uses,
        1
    );
});

test('one-time interaction cannot be used twice', () => {
    const game = createGameAPI();
    game.interactions.register({
        id: 'one_time_test',
        type: 'object',
        oneTime: true
    });
    game.interactions.use('one_time_test');
    assert.throws(() => game.interactions.use('one_time_test'), /cannot be used/);
});

test('interaction can require an item', ()=>{
    const game = createGameAPI();
    game.interactions.register({
        id: 'door_interaction',
        type: 'door',

        requires: {
            items:{
                stone: 1
            }
        }
    });

    assert.equal(game.interactions.canUse('door_interaction').ok,false);

    game.inventory.add(
        'stone',
        1
    );

    assert.equal(
        game.interactions.canUse('door_interaction').ok,true
    );
});

test('interaction can require story flag', () => {
    const game = createGameAPI();
    game.interactions.register({
        id: 'secret_door',
        type:'door',

        requires: {
            flags: {
                ancient_device_inspected: true
            }
        }
    });

    assert.equal(game.interactions.canUse('secret_door').ok,false );
    game.story.set('ancient_device_inspected', true);

    assert.equal(
        game.interactions.canUse('secret_door').ok,true
    );
});

test('interaction can require completed quest', () => {
    const game = createGameAPI();
    game.interactions.register({
        id: 'special_interaction',
        type:'object',
        requires: {
            completedQuests: ['gather_stone']
        }
    });

    assert.equal(
        game.interactions.canUse(
            'special_interaction').ok,false
        );
    game.quests.start('gather_stone');
    game.inventory.add('stone',3);
    assert.equal(
        game.interactions.canUse('special_interaction').ok,true
    )
});