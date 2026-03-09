# Cascades
Implementation of a basic match 3 game where the tiles fall down, creating potentially more matches in a cascade.  

### Up Next
- debug matching logic on first switch for both mobile and desktop

### Eventual Features

- light and dark mode
- custom height and width
- custom number of color types


## Version History
#### v0.6
- refactored into Board and Game classes — Board holds pure grid logic, Game owns the DOM
- Board extracted to its own ES module for testability
- added 84-unit test suite covering all board logic (run with `npm test`)
- fixed several bugs: drag-drop tile flicker, double-counted match scores, missing null check in available-moves scan
- removed dead code and cleaned up commented-out debug lines

#### v0.5
- alert modal now has button to reset game
- switched yellow color for gray
- add favicon
- vite devserver

#### v0.4 12/17/24
- alerts when no moves left
- lighter game board colors
- cascade speed control slider

#### v0.3 11/30/24
- adds basic 10pts per square game scoring
- resetting board resets the score
- update colors for higher visibility
- fix bug of allowing switch if not 3 in a row


#### v0.2 11/28/24
- Added link to this github repo.
- Added modal with instructions on how to play.
- Added mobile touch functionality.

#### v0.1 11/27/24
- Published 11/27 to AWS Amplify, no custom domain yet.
- Working game with cascading tiles on matching 3 in a row. 
- Reset button for when there are no more moves.