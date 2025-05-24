# EpicLeaderboard SDK

[![npm version](https://badge.fury.io/js/epicleaderboard-ts.svg)](https://badge.fury.io/js/epicleaderboard-ts)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Universal TypeScript SDK for EpicLeaderboard - Works seamlessly in both Node.js and browser environments.

## Features

- 🌐 **Universal**: Works in Node.js (16+) and modern browsers
- 📦 **Zero Dependencies**: Lightweight with no external dependencies
- 🔷 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🚀 **Modern**: Uses native `fetch` API (available in Node.js 18+ and all modern browsers)
- 📝 **Well Documented**: Comprehensive documentation and examples
- ⚡ **Fast**: Minimal overhead and optimized for performance

## Installation

```bash
npm install epicleaderboard-ts
```

## Quick Start

### ES Modules (Recommended)

```typescript
import { EpicLeaderboard, Timeframe, IsUsernameAvailableResponse } from 'epicleaderboard-ts';

const client = new EpicLeaderboard();

// Define your game and leaderboard
const game = {
  gameID: 'your-game-id',
  gameKey: 'your-game-key'
};

const leaderboard = {
  primaryID: 'main-leaderboard',
  secondaryID: 'level-1'
};

// Get leaderboard entries
try {
  const response = await client.getLeaderboardEntries(
    game,
    leaderboard,
    'player-username',
    Timeframe.AllTime,
    true, // around player
    false // not local
  );
  
  console.log('Top entries:', response.entries);
  console.log('Player entry:', response.playerEntry);
} catch (error) {
  console.error('Error fetching leaderboard:', error);
}
```

### CommonJS

```javascript
const { EpicLeaderboard, Timeframe } = require('epicleaderboard-ts');

const client = new EpicLeaderboard();
// ... rest is the same
```

### Browser (via CDN)

```html
<script type="module">
  import { EpicLeaderboard } from 'https://unpkg.com/epicleaderboard-ts/dist/esm/index.js';
  
  const client = new EpicLeaderboard();
  // ... use the SDK
</script>
```

## API Reference

### Constructor

```typescript
const client = new EpicLeaderboard(baseURL?: string);
```

- `baseURL` (optional): Custom server URL. Defaults to `https://epicleaderboard.com`

### Methods

#### `getLeaderboardEntries()`

Fetches leaderboard entries around a specific player.

```typescript
async getLeaderboardEntries(
  game: EpicLeaderboardGame,
  leaderboard: EpicLeaderboard,
  username: string,
  timeframe?: Timeframe,
  aroundPlayer?: boolean,
  local?: boolean
): Promise<EpicLeaderboardGetEntriesResponse>
```

**Parameters:**
- `game`: Game configuration with `gameID` and `gameKey`
- `leaderboard`: Leaderboard configuration with `primaryID` and `secondaryID`
- `username`: Player username to center results around
- `timeframe`: Time period (default: `Timeframe.AllTime`)
- `aroundPlayer`: Whether to center results around the player (default: `true`)
- `local`: Whether to fetch local scores only (default: `false`)

**Returns:**
```typescript
{
  entries: EpicLeaderboardEntry[];
  playerEntry: EpicLeaderboardEntry | null;
}
```

#### `submitLeaderboardEntry()`

Submits a score to the leaderboard.

```typescript
async submitLeaderboardEntry(
  game: EpicLeaderboardGame,
  leaderboard: EpicLeaderboard,
  username: string,
  score: number,
  meta?: Record<string, string>
): Promise<TimeframeUpdateResult>
```

**Parameters:**
- `game`: Game configuration
- `leaderboard`: Leaderboard configuration
- `username`: Player username
- `score`: Numeric score value
- `meta`: Optional additional data to store with the score

**Returns:**
A bitfield indicating which timeframe leaderboards were updated with this score:
```typescript
enum TimeframeUpdateResult {
    None = 0,        // No timeframes were updated
    AllTime = 1,     // All-time leaderboard was updated
    Year = 2,        // Yearly leaderboard was updated
    Month = 4,       // Monthly leaderboard was updated
    Week = 8,        // Weekly leaderboard was updated
    Day = 16         // Daily leaderboard was updated
}
```

#### `isUsernameAvailable()`

Checks if a username is available for use.

```typescript
async isUsernameAvailable(
  game: EpicLeaderboardGame,
  username: string
): Promise<IsUsernameAvailableResponse>
```

**Returns:** One of:
- `IsUsernameAvailableResponse.Available` (0)
- `IsUsernameAvailableResponse.Invalid` (1)
- `IsUsernameAvailableResponse.Profanity` (2)
- `IsUsernameAvailableResponse.Taken` (3)

### Types

#### `EpicLeaderboardGame`
```typescript
interface EpicLeaderboardGame {
  gameID: string;
  gameKey: string;
}
```

#### `EpicLeaderboard`
```typescript
interface EpicLeaderboard {
  primaryID: string;
  secondaryID: string;
}
```

#### `EpicLeaderboardEntry`
```typescript
interface EpicLeaderboardEntry {
  rank: number;
  username: string;
  score: string;
  country: string;
  meta: Record<string, string>;
}
```

#### `Timeframe`
```typescript
enum Timeframe {
  AllTime = 0,
  Year = 1,
  Month = 2,
  Week = 3,
  Day = 4
}
```

#### `TimeframeUpdateResult`
```typescript
enum TimeframeUpdateResult {
  None = 0,
  AllTime = 1,
  Year = 2,
  Month = 4,
  Week = 8,
  Day = 16
}
```

## Examples

### Submit a Score with Metadata

```typescript
import { EpicLeaderboard, TimeframeUpdateResult } from 'epicleaderboard-ts';

const client = new EpicLeaderboard();

const result = await client.submitLeaderboardEntry(
  { gameID: 'my-game', gameKey: 'secret-key' },
  { primaryID: 'main', secondaryID: 'level-1' },
  'player123',
  98500,
  {
    level: '1',
    time: '120.5',
    difficulty: 'hard'
  }
);

// Check which timeframes were updated
if (result & TimeframeUpdateResult.AllTime) {
  console.log('New all-time high score!');
}
if (result & TimeframeUpdateResult.Day) {
  console.log('New daily high score!');
}
```

### Check Username Availability

```typescript
import { EpicLeaderboard, IsUsernameAvailableResponse } from 'epicleaderboard-ts';

const client = new EpicLeaderboard();

const result = await client.isUsernameAvailable(
  { gameID: 'my-game', gameKey: 'secret-key' },
  'desired-username'
);

switch (result) {
  case IsUsernameAvailableResponse.Available:
    console.log('Username is available!');
    break;
  case IsUsernameAvailableResponse.Taken:
    console.log('Username is already taken');
    break;
  case IsUsernameAvailableResponse.Profanity:
    console.log('Username contains inappropriate content');
    break;
  case IsUsernameAvailableResponse.Invalid:
    console.log('Username is invalid');
    break;
}
```

### Get Weekly Leaderboard

```typescript
import { EpicLeaderboard, Timeframe } from 'epicleaderboard-ts';

const client = new EpicLeaderboard();

const weeklyScores = await client.getLeaderboardEntries(
  { gameID: 'my-game', gameKey: 'secret-key' },
  { primaryID: 'main', secondaryID: 'level-1' },
  'current-player',
  Timeframe.Week
);

console.log('Weekly top scores:', weeklyScores.entries);
```

## Error Handling

The SDK throws `EpicLeaderboardError` for API-related errors:

```typescript
import { EpicLeaderboard, EpicLeaderboardError } from 'epicleaderboard-ts';

try {
  await client.submitLeaderboardEntry(/* ... */);
} catch (error) {
  if (error instanceof EpicLeaderboardError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
  } else {
    console.error('Unknown Error:', error);
  }
}
```

## Browser Compatibility

- **Modern Browsers**: Chrome 63+, Firefox 57+, Safari 12+, Edge 79+
- **Node.js**: 16.0+ (fetch polyfill required for Node.js < 18)

### Fetch Polyfill for Older Environments

For Node.js versions < 18 or older browsers, you may need a fetch polyfill:

```bash
npm install node-fetch
```

```typescript
// For Node.js < 18
import fetch from 'node-fetch';
globalThis.fetch = fetch as any;
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [EpicLeaderboard](LICENSE)

## Support

- 📧 Email: epicleaderboard@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/jensroth-git/epicleaderboard-ts/issues)
- 📖 Documentation: [API Docs](https://epicleaderboard.com/docs) 
