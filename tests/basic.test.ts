import {
  EpicLeaderboard,
  EpicLeaderboardUtils,
  Timeframe,
  IsUsernameAvailableResponse,
  EpicLeaderboardError,
} from '../src/index';

describe('EpicLeaderboardUtils', () => {
  test('constructParamsURL should encode parameters correctly', () => {
    const params = {
      gameID: 'test-game',
      username: 'test user',
      score: '1000',
    };

    const result = EpicLeaderboardUtils.constructParamsURL(params);
    expect(result).toBe('gameID=test-game&username=test%20user&score=1000');
  });

  test('constructParamsURL should return empty string for empty params', () => {
    const result = EpicLeaderboardUtils.constructParamsURL({});
    expect(result).toBe('');
  });

  test('serializeMap should convert object to JSON string', () => {
    const metadata = { level: '1', time: '120.5' };
    const result = EpicLeaderboardUtils.serializeMap(metadata);
    expect(result).toBe('{"level":"1","time":"120.5"}');
  });

  test('deserializeMap should parse JSON string to object', () => {
    const json = '{"level":"1","time":"120.5"}';
    const result = EpicLeaderboardUtils.deserializeMap(json);
    expect(result).toEqual({ level: '1', time: '120.5' });
  });

  test('deserializeMap should return empty object for invalid JSON', () => {
    const result = EpicLeaderboardUtils.deserializeMap('invalid json');
    expect(result).toEqual({});
  });
});

describe('EpicLeaderboard', () => {
  let client: EpicLeaderboard;

  beforeEach(() => {
    client = new EpicLeaderboard();
  });

  test('should create instance with default URL', () => {
    expect(client).toBeInstanceOf(EpicLeaderboard);
  });

  test('should create instance with custom URL', () => {
    const customClient = new EpicLeaderboard('https://custom.example.com');
    expect(customClient).toBeInstanceOf(EpicLeaderboard);
  });

  test('should throw error when fetch is not available', async () => {
    // Mock fetch as undefined
    const originalFetch = global.fetch;
    (global as any).fetch = undefined;

    const game = { gameID: 'test', gameKey: 'test' };
    const leaderboard = { primaryID: 'test', secondaryID: 'test' };

    await expect(
      client.getLeaderboardEntries(game, leaderboard, 'test')
    ).rejects.toThrow(EpicLeaderboardError);

    // Restore fetch
    global.fetch = originalFetch;
  });
});

describe('Enums', () => {
  test('Timeframe enum should have correct values', () => {
    expect(Timeframe.AllTime).toBe(0);
    expect(Timeframe.Year).toBe(1);
    expect(Timeframe.Month).toBe(2);
    expect(Timeframe.Week).toBe(3);
    expect(Timeframe.Day).toBe(4);
  });

  test('IsUsernameAvailableResponse enum should have correct values', () => {
    expect(IsUsernameAvailableResponse.Available).toBe(0);
    expect(IsUsernameAvailableResponse.Invalid).toBe(1);
    expect(IsUsernameAvailableResponse.Profanity).toBe(2);
    expect(IsUsernameAvailableResponse.Taken).toBe(3);
  });
});

describe('EpicLeaderboardError', () => {
  test('should create error with message', () => {
    const error = new EpicLeaderboardError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('EpicLeaderboardError');
    expect(error.statusCode).toBeUndefined();
  });

  test('should create error with message and status code', () => {
    const error = new EpicLeaderboardError('Test error', 404);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(404);
  });
}); 

describe('Get Leaderboard Entries', () => {
  test('should make a request to the leaderboard', async () => {
    const game = { gameID: '6657286243a2ea2c8ee39221', gameKey: '05e53664638847feccf3a0f3d4ab37aa' };
    const leaderboard = { primaryID: 'Demo', secondaryID: '' };
    
    const client = new EpicLeaderboard();

    const result = await client.getLeaderboardEntries(game, leaderboard, "");
    expect(result).toBeDefined();
    expect(result.entries.length).toBeGreaterThan(0);
  });
});

describe('Is Username Available', () => {
  test('should make a request to the isUsernameAvailable', async () => {
    const game = { gameID: '6657286243a2ea2c8ee39221', gameKey: '05e53664638847feccf3a0f3d4ab37aa' };
    const client = new EpicLeaderboard();

    const result = await client.isUsernameAvailable(game, 'test-please-dont-use');
    expect(result).toBeDefined();
    expect(result).toBe(IsUsernameAvailableResponse.Available);

    //test profanity
    const result2 = await client.isUsernameAvailable(game, 'fvck-y0u');
    expect(result2).toBeDefined();
    expect(result2).toBe(IsUsernameAvailableResponse.Profanity);

    //test taken
    const result3 = await client.isUsernameAvailable(game, 'JR');
    expect(result3).toBeDefined();
    expect(result3).toBe(IsUsernameAvailableResponse.Taken);
  });
});

describe('Submit Leaderboard Entry', () => {
  test('should make a request to the submitLeaderboardEntry', async () => {
    const game = { gameID: '6657286243a2ea2c8ee39221', gameKey: '05e53664638847feccf3a0f3d4ab37aa' };
    const leaderboard = { primaryID: 'Demo', secondaryID: '' };
    const metadata = { level: '1', time: '120.5' };
    const client = new EpicLeaderboard();

    const result = await client.submitLeaderboardEntry(game, leaderboard, 'test-please-dont-use-score', 60_000_001, metadata);

    console.log(result);
  });
});

