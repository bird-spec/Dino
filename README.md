# Dino: 4D hyperspace

A voxel open-world game in the browser. You're Dino, living in prehistory, and an asteroid is coming for your whole timeline. Run, gather, learn rockets, build one, and stop the rock.

## The story

Dino lives with the other dinosaurs. Then a warning comes through. Something big is going to hit his era and wipe it out.

He finds 4D hyperspace, where time works like a direction you can walk in. That takes him to the modern era, where humans (fairly) lose it over a live dinosaur. A scientist figures out where he came from and teaches him how rockets and asteroids work.

Surviving in the present isn't enough though. He goes home, gathers everything himself, builds the rocket in prehistory, launches it, and breaks the asteroid before it breaks him.

Prehistory, hyperspace, modern era, scientist, back home, rocket, launch, asteroid, saved timeline. That's the whole game, start to finish.

## How to run it

```sh
npm install
npx vite
```

Open the address it prints, usually `http://localhost:5173`. Click the game once so it grabs your mouse.

## Controls

WASD moves, mouse looks. Shift sprints, space jumps. Walk up to something and press E to grab it or talk. R changes your colors, O opens settings, Esc pauses. Jump over a cactus and you'll hear why.

## What's in the game

A world that never ends. Terrain builds itself in chunks as you walk, with a view-distance slider if your machine struggles. Rocks, ferns, resin trees, pines, cactuses, and grass are scattered everywhere from a fixed seed, so the map looks the same every run. Harvested rocks stay harvested.

Two eras to walk between through the hyperspace portal, each with its own look and people. Full quest chain from your first stone to the launch pad. Crafting at the workbench, a five-part rocket you assemble yourself, and a launch sequence. The asteroid finale plays out in space, and the ending changes prehistory for good.

Quests, inventory, dialogue, crafting, rocket parts, era switching, and saves all run underneath. Progress saves to your browser automatically.

## Project layout

```text
src/
  main.js            game loop, input, spawning
  runtime/           dino, camera, settings, customization
  world/             chunked voxel terrain, noise, sun, sky
  game/              bootstrap, scatter, npcs
  game/core          state, events, items
  game/systems       quests, dialogue, crafting, rocket, save...
  game/data          eras, quests, recipes, npcs, dialogue text
  frontend/          HUD, menus, dialogue box
  utils/             models, dust, pathfinding
public/models/       all 29 low-poly models
```

## Tech

Vite, Three.js, plain JavaScript, no engine. State is one object with an event bus in front of it. Saves go to localStorage. Tests run with `npm test`.

## Screenshots

![Menu](docs/shots/menu.png)
![World](docs/shots/world.png)
![Harvest](docs/shots/harvest.png)
