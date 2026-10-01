import test from 'node:test';
import assert from 'node:assert/strict';

import{
    createGameAPI
} from "../src/game/index.js";

test('quest can be started', () => {
    const game = createGameAPI();
    game.quests.start('gather_stone');
    assert.equal(
        game.quests.isActive('gather_stone')
    );
    assert.equal(
        game.quests.isActive('gather_stone'),
        true
    );
});
test('quest automatically progresses when matching item is added', () => {
    const game = createGameAPI();
    game.quests.start('gather_stone');
    game.inventory.add('stone', 2);
    const quest= game.quests.start('gather_stone');
    assert.equal(
        quest.objectives.stone_count,2
    );
});
test('quest automatically completes when objective reaches target',()=>{
    const game = createGameAPI();
    game.quests.start('gather_stone');
    game.inventory.add('stone', 3);

    assert.equal(
        game.quests.isCompleted('gather_stone'), true
    );
    assert.equal(
        game.quests.isActive('gather_stone'),false
    );
});
test('completed quest gives item reward', () => {
    const game = createGameAPI();
    game.quests.start('gather_stone');
    game.inventory.add('stone', 3);
    assert.equal(game.inventory.get('fern_fiber'),2);
});
test('completed quest gives XP reward', () => {
    const game = createGameAPI();
    game.quests.start('gather_stone');
    game.inventory.add('stone', 3);
    assert.equal(game.getState().player.xp,25);
});
test('quest prerequisites are enforced', () => {
    const game = createGameAPI();
    assert.throws(() => game.quests.start('gather_fiber'), /requires completed quest/);
});

test('quest can be completed by manual objective update', () => {
    const game = createGameAPI();
    game.quests.start('gather_stone');
    game.quests.update('gather_stone','stone_count',3);

    assert.equal(game.quests.isCompleted('gather_stone'), true);
});

test('unknown quest throws an error', () => {
    const game = createGameAPI();
    assert.throws(
        () => game.quests.start('does_not_exist'),/Unknown quest /
    );
});
