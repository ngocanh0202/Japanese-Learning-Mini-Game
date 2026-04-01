## ADDED Requirements

### Requirement: Match animation triggers on successful pair match

When two cards are successfully matched in the match game, the system SHALL apply the `match-animation` CSS class to both matched card elements to provide visual feedback to the player.

#### Scenario: Two matching cards are selected
- **WHEN** player selects two cards with the same pairId but different kinds (word and label)
- **THEN** both card elements receive the `match-animation` class immediately

#### Scenario: Animation plays for configured duration
- **WHEN** the `match-animation` class is applied to matched cards
- **THEN** the animation plays for 600ms (matching CSS `matchSuccess` keyframe duration)

#### Scenario: Animation class is removed after completion
- **WHEN** 600ms has elapsed since the animation was applied
- **THEN** the `match-animation` class is removed from both card elements
- **AND** cards remain in the `matched` visual state

#### Scenario: Non-matching cards do not trigger animation
- **WHEN** player selects two cards that do not match
- **THEN** no `match-animation` class is applied to either card
- **AND** cards revert to hidden state after 800ms delay

### Requirement: Card object tracks animation state

Each card object in the match game SHALL include an `animating` boolean property to track whether the success animation is currently playing on that card.

#### Scenario: Card object includes animating property
- **WHEN** a card object is created in `startMatch()`
- **THEN** the card object includes `animating: false` as a property

#### Scenario: Animating state updates during match
- **WHEN** two cards are successfully matched
- **THEN** both card objects have `animating` set to `true`
- **AND** after 600ms, both card objects have `animating` set to `false`

### Requirement: Render board reflects animation state

The `renderMatchBoard()` function SHALL include the `match-animation` class in the card element's class attribute when the card's `animating` property is `true`.

#### Scenario: Animating cards render with animation class
- **WHEN** `renderMatchBoard()` is called and a card has `animating: true`
- **THEN** the rendered button element includes `match-animation` in its class attribute

#### Scenario: Non-animating cards render without animation class
- **WHEN** `renderMatchBoard()` is called and a card has `animating: false`
- **THEN** the rendered button element does NOT include `match-animation` in its class attribute
