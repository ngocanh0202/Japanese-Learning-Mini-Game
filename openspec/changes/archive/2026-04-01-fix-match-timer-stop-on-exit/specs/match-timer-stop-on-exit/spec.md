## ADDED Requirements

### Requirement: Match timer stops immediately when player exits
When a player navigates away from the match game screen, the timer SHALL stop immediately without firing any further callbacks.

#### Scenario: Player clicks back button during active game
- **WHEN** player clicks "Back" button while match game is active
- **THEN** `stopMatchTimer()` is called and timer stops immediately

#### Scenario: Player navigates to another screen during active game
- **WHEN** player navigates to any other screen (menu, settings, etc.) from match game
- **THEN** timer stops before the new screen is displayed

### Requirement: No game over triggered after exit
The timer callback SHALL NOT call `endMatchByTime()` after the player has exited the match game.

#### Scenario: Timer fires after exit
- **WHEN** a timer tick would fire after player has already left the match screen
- **THEN** no toast or game over is displayed because timer is already stopped