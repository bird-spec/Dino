# Dino: 4D Hyperspace

A 3D open-world web game based on the classic browser dinosaur game, expanded into a time-travel adventure.

## Overview

Dino lives in the prehistoric era and discovers that a massive asteroid is going to destroy his world.

Using a mysterious technology called 4D Hyperspace, Dino travels into the modern era. After encountering humans and eventually meeting a scientist, he learns about asteroids, space, and modern technology.

Dino returns to his own time with the knowledge he needs to build a rocket and stop the asteroid before it destroys his timeline.

The goal is to combine exploration, time travel, progression, and a story-driven adventure into a browser-based 3D game.

## Gameplay

The game will feature:

* 3D exploration
* Player-controlled dinosaur
* Open-world environments
* Multiple time periods
* Time travel through 4D Hyperspace
* NPCs and dialogue
* Resource gathering
* Quest progression
* Rocket construction
* Space exploration
* An asteroid-based final mission

## Time Travel

Time is treated as the fourth dimension.

The player moves normally through a 3D environment while being able to change the time period they are currently in.

For example:

```text
Prehistoric Era
      |
      v
4D Hyperspace
      |
      v
Modern Era
      |
      v
4D Hyperspace
      |
      v
Prehistoric Era
```

The same location can change depending on the time period. This allows us to reuse parts of the world while still making each era feel different.

## World

### Prehistoric Era

The main starting area will contain:

* Forests
* Mountains
* Caves
* Rivers
* Dinosaur habitats
* Resource areas
* Dino's home
* The eventual rocket launch area

### Modern Era

The modern section will include:

* A city
* Buildings
* Roads
* NPCs
* A research facility
* The scientist
* Technology that Dino can learn from

### Space

The final section will include:

* Rocket launch
* Earth's atmosphere
* Space
* The asteroid
* The final mission

## Team

### Creative Director and Frontend Lead

**You**

Responsibilities:

* Story
* Game design
* Frontend development
* UI/UX
* Visual design
* Player experience
* Feature planning
* Git/GitHub management
* Integrating different systems

### World and Gameplay Systems

**Developer 2**

Responsibilities:

* 3D environment
* Terrain
* World generation
* Collisions
* Obstacles
* Environmental interactions

### Time and Physics Systems

**Developer 3**

Responsibilities:

* 4D Hyperspace
* Time travel
* Timeline states
* Time-dependent world changes
* Meteor and asteroid systems
* Gameplay physics

### Backend and Game Systems

**Developer 4**

Responsibilities:

* Game state
* Progression
* Quest data
* NPC data
* Save/load systems
* Supporting APIs and utilities

## Technology

The project is being developed as a web application rather than using a traditional game engine.

Current technologies:

* HTML
* CSS
* JavaScript
* Three.js
* WebGL
* Git
* GitHub

The technology stack may change as development progresses.

## Project Structure

```text
dino-4d-hyperspace/
│
├── src/
│   ├── frontend/
│   ├── world/
│   ├── hyperspace/
│   ├── systems/
│   ├── player/
│   ├── ui/
│   └── assets/
│
├── public/
│
├── docs/
│
├── README.md
├── package.json
└── .gitignore
```

## Development Roadmap

### Phase 1: Basic Prototype

* [ ] Set up project
* [ ] Set up GitHub repository
* [ ] Create 3D scene
* [ ] Add camera
* [ ] Add lighting
* [ ] Add Dino
* [ ] Implement movement
* [ ] Implement jumping
* [ ] Implement basic collision

### Phase 2: Prehistoric World

* [ ] Create terrain
* [ ] Add forests
* [ ] Add mountains
* [ ] Add water
* [ ] Add environmental objects
* [ ] Add dinosaurs
* [ ] Add basic exploration

### Phase 3: Modern Era

* [ ] Create modern environment
* [ ] Add humans
* [ ] Add NPC reactions
* [ ] Add scientist
* [ ] Add dialogue
* [ ] Add story progression

### Phase 4: 4D Hyperspace

* [ ] Create Hyperspace system
* [ ] Create time-travel mechanic
* [ ] Create timeline states
* [ ] Connect prehistoric and modern eras
* [ ] Add time-dependent world changes

### Phase 5: Rocket

* [ ] Add resource gathering
* [ ] Add rocket components
* [ ] Add construction system
* [ ] Add launch sequence
* [ ] Create space environment

### Phase 6: Final Mission

* [ ] Add asteroid
* [ ] Add space gameplay
* [ ] Create final mission
* [ ] Allow player to alter the asteroid's trajectory
* [ ] Complete the timeline

### Phase 7: Polish

* [ ] Animations
* [ ] Sound effects
* [ ] Music
* [ ] UI improvements
* [ ] Environment improvements
* [ ] Performance optimization
* [ ] Bug fixing

## First Milestone

The first goal is intentionally small:

> A playable dinosaur that can move around a basic 3D prehistoric environment.

Once that works, additional systems will be added one at a time.

## Git Workflow

`main` should always contain a stable version of the game.

Each developer should work on their own branch:

```text
main
├── frontend/your-name
├── world/developer-2
├── hyperspace/developer-3
└── systems/developer-4
```

### Guidelines

1. Do not directly break the main branch.
2. Test changes before pushing them.
3. Use clear commit messages.
4. Pull the latest changes before starting major work.
5. Communicate before modifying another developer's system.
6. Keep systems separated and reusable.
7. Use pull requests when merging larger features.

## Goal

The project starts with the simple idea of the browser dinosaur game and expands it into a 3D open-world adventure involving exploration, time travel, technology, and a mission to prevent the extinction of Dino's world.
