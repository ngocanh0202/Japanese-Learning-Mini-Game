## ADDED Requirements

### Requirement: Module separation
The application SHALL split main.js into 5 focused modules: main.js (globals, init, screen nav, game router, utils), storage.js (localStorage operations, question set CRUD), settings.js (settings render/update, priority system), game-utils.js (priority scoring, question stats, session history, level system), and data-manager.js (import/export, Firebase operations).

#### Scenario: Scripts load in correct order
- **WHEN** index.html loads all script tags
- **THEN** globals are defined first in main.js, followed by storage, settings, game-utils, data-manager, then game files

#### Scenario: Each module has single responsibility
- **WHEN** a developer reads any module file
- **THEN** the file contains only one category of functionality and is under 500 lines

### Requirement: Backward compatibility
The refactored modules SHALL maintain full backward compatibility with existing localStorage data and all existing game functionality.

#### Scenario: Existing data loads correctly
- **WHEN** the app loads with existing localStorage data
- **THEN** all question sets, player progress, settings, and stats load without errors

#### Scenario: All games launch and function
- **WHEN** user clicks any game button from the menu
- **THEN** the game launches and functions identically to before refactoring

### Requirement: No circular dependencies
Modules SHALL have a strict dependency hierarchy with no circular references.

#### Scenario: Dependency chain is acyclic
- **WHEN** tracing function calls between modules
- **THEN** main → storage → game-utils → settings → data-manager with no back-references
