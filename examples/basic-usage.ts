/**
 * Basic Usage Example for EpicLeaderboard SDK
 * This example shows how to integrate the SDK with your game
 */

import {  EpicLeaderboard,  Timeframe,  IsUsernameAvailableResponse,  EpicLeaderboardError,  type EpicLeaderboardGame,  type EpicLeaderboardConfig} from '../src/index';

// Initialize the SDK
const client = new EpicLeaderboard();

// Game configuration - replace with your actual game credentials
const game: EpicLeaderboardGame = {
  gameID: 'mazescape-game',
  gameKey: 'your-secret-game-key'
};

// Leaderboard configuration - customize for your game levels/categories
const leaderboard: EpicLeaderboardConfig = {
  primaryID: 'main-leaderboard',
  secondaryID: 'level-1'
};

async function exampleUsage() {
  try {
    console.log('🎮 EpicLeaderboard SDK Example');
    console.log('================================');

    // 1. Check if a username is available
    console.log('\n1. Checking username availability...');
    const username = 'PlayerAwesome123';
    const usernameResult = await client.isUsernameAvailable(game, username);
    
    switch (usernameResult) {
      case IsUsernameAvailableResponse.Available:
        console.log('✅ Username is available!');
        break;
      case IsUsernameAvailableResponse.Taken:
        console.log('❌ Username is already taken');
        break;
      case IsUsernameAvailableResponse.Profanity:
        console.log('⚠️ Username contains inappropriate content');
        break;
      case IsUsernameAvailableResponse.Invalid:
        console.log('❌ Username is invalid');
        break;
    }

    // 2. Submit a score to the leaderboard
    console.log('\n2. Submitting score to leaderboard...');
    const playerScore = 98750;
    const scoreMetadata = {
      level: '1',
      completionTime: '125.7',
      difficulty: 'hard',
      collectedItems: '15',
      deaths: '2'
    };

    await client.submitLeaderboardEntry(
      game,
      leaderboard,
      username,
      playerScore,
      scoreMetadata
    );
    console.log('✅ Score submitted successfully!');

    // 3. Get leaderboard entries around the player
    console.log('\n3. Fetching leaderboard entries...');
    const leaderboardData = await client.getLeaderboardEntries(
      game,
      leaderboard,
      username,
      Timeframe.AllTime,
      true, // around player
      false // not local only
    );

    console.log('\n📊 Top Leaderboard Entries:');
    leaderboardData.entries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.username} - ${entry.score} points (Rank: ${entry.rank})`);
      if (entry.meta.completionTime) {
        console.log(`   Time: ${entry.meta.completionTime}s`);
      }
    });

    if (leaderboardData.playerEntry) {
      console.log('\n🎯 Your Position:');
      console.log(`Rank: ${leaderboardData.playerEntry.rank}`);
      console.log(`Score: ${leaderboardData.playerEntry.score}`);
      console.log(`Username: ${leaderboardData.playerEntry.username}`);
    }

    // 4. Get weekly leaderboard
    console.log('\n4. Fetching weekly leaderboard...');
    const weeklyData = await client.getLeaderboardEntries(
      game,
      leaderboard,
      username,
      Timeframe.Week,
      false, // top players, not around player
      false
    );

    console.log('\n📅 Weekly Top Players:');
    weeklyData.entries.slice(0, 5).forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.username} - ${entry.score} points`);
    });

  } catch (error) {
    if (error instanceof EpicLeaderboardError) {
      console.error('❌ EpicLeaderboard API Error:', error.message);
      if (error.statusCode) {
        console.error('Status Code:', error.statusCode);
      }
    } else {
      console.error('❌ Unknown Error:', error);
    }
  }
}

// Example for different game scenarios
async function advancedExamples() {
  console.log('\n\n🔥 Advanced Examples');
  console.log('====================');

  // Multiple leaderboards for different game modes
  const speedRunLeaderboard: EpicLeaderboardConfig = {
    primaryID: 'speedrun',
    secondaryID: 'any-percent'
  };

  const survivalLeaderboard: EpicLeaderboardConfig = {
    primaryID: 'survival',
    secondaryID: 'endless'
  };

  try {
    // Submit to speedrun leaderboard
    await client.submitLeaderboardEntry(
      game,
      speedRunLeaderboard,
      'SpeedRunner99',
      89.45, // completion time in seconds
      {
        route: 'optimal-path',
        glitches: 'none',
        version: '1.2.3'
      }
    );

    // Submit to survival leaderboard
    await client.submitLeaderboardEntry(
      game,
      survivalLeaderboard,
      'SurvivalKing',
      45632, // survival time in seconds
      {
        enemiesKilled: '1247',
        resourcesGathered: '892',
        buildingsCreated: '34'
      }
    );

    console.log('✅ Advanced scores submitted!');

  } catch (error) {
    console.error('❌ Error in advanced examples:', error);
  }
}

// Integration with game events
class GameLeaderboardIntegration {
  private client: EpicLeaderboard;
  private game: EpicLeaderboardGame;

  constructor(gameConfig: EpicLeaderboardGame) {
    this.client = new EpicLeaderboard();
    this.game = gameConfig;
  }

  async onLevelComplete(
    username: string,
    level: string,
    score: number,
    completionTime: number,
    metadata: Record<string, string> = {}
  ) {
    const leaderboard: EpicLeaderboardConfig = {
      primaryID: 'level-completion',
      secondaryID: level
    };

    const fullMetadata = {
      ...metadata,
      completionTime: completionTime.toString(),
      level,
      timestamp: Date.now().toString()
    };

    try {
      await this.client.submitLeaderboardEntry(
        this.game,
        leaderboard,
        username,
        score,
        fullMetadata
      );
      console.log(`✅ Level ${level} score submitted for ${username}`);
    } catch (error) {
      console.error(`❌ Failed to submit score for level ${level}:`, error);
    }
  }

  async getPlayerRanking(username: string, level: string) {
    const leaderboard: EpicLeaderboardConfig = {
      primaryID: 'level-completion',
      secondaryID: level
    };

    try {
      const data = await this.client.getLeaderboardEntries(
        this.game,
        leaderboard,
        username
      );
      
      return {
        playerRank: data.playerEntry?.rank || null,
        topPlayers: data.entries.slice(0, 10)
      };
    } catch (error) {
      console.error(`❌ Failed to get ranking for level ${level}:`, error);
      return null;
    }
  }
}

// Run the examples
if (require.main === module) {
  exampleUsage()
    .then(() => advancedExamples())
    .then(() => {
      // Example of game integration
      const gameIntegration = new GameLeaderboardIntegration(game);
      
      // Simulate a level completion
      return gameIntegration.onLevelComplete(
        'ExamplePlayer',
        'maze-level-1',
        95420,
        127.3,
        { difficulty: 'normal', hints: '0' }
      );
    })
    .then(() => console.log('\n🎉 Examples completed!'))
    .catch(console.error);
} 