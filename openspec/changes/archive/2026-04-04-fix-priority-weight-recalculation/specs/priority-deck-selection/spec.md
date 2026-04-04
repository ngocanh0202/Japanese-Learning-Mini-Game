## ADDED Requirements

### Requirement: Weighted deck selection maintains accurate probability distribution
The `getPrioritizedDeck()` function SHALL maintain an accurate running total of remaining item weights throughout the selection loop, ensuring that each iteration's weighted random selection reflects the true probability distribution of the remaining items.

#### Scenario: First selection uses correct total weight
- **WHEN** `getPrioritizedDeck()` begins selecting items
- **THEN** the initial random value is calculated using the sum of all item weights, and the first item is selected with correct proportional probability

#### Scenario: Subsequent selections use updated total weight
- **WHEN** an item has been selected and removed from the pool
- **THEN** the total weight used for the next random selection is reduced by exactly the removed item's weight (`Math.max(0, score) + 1`)

#### Scenario: All items are selected regardless of weight distribution
- **WHEN** the selection loop runs to completion
- **THEN** every item from the input array appears exactly once in the output deck, in weighted-random order

#### Scenario: Fallback selection activates when random exceeds remaining weight
- **WHEN** the random value exceeds the cumulative weight of all remaining items (due to floating point or edge cases)
- **THEN** the fallback logic selects a random item from the remaining pool, ensuring no items are skipped
