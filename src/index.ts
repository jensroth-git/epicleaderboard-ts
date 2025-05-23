/**
 * EpicLeaderboard TypeScript SDK
 * Universal leaderboard solution for games
 * Works in both Node.js and browser environments
 */

const SERVER_URL = "https://epicleaderboard.com";

// Types and Interfaces
export interface EpicLeaderboardGame {
    gameID: string;
    gameKey: string;
}

export interface EpicLeaderboardConfig { primaryID: string; secondaryID: string; }

export interface EpicLeaderboardEntry {
    rank: number;
    username: string;
    score: string;
    country: string;
    meta: Record<string, string>;
}

export interface EpicLeaderboardGetEntriesResponse {
    entries: EpicLeaderboardEntry[];
    playerEntry: EpicLeaderboardEntry | null;
}

// Enums
export enum Timeframe {
    AllTime = 0,
    Year = 1,
    Month = 2,
    Week = 3,
    Day = 4,
}

export enum IsUsernameAvailableResponse {
    Available = 0,
    Invalid = 1,
    Profanity = 2,
    Taken = 3,
}

// Utility functions
export class EpicLeaderboardUtils {
    /**
     * Constructs URL parameters from a key-value map
     */
    static constructParamsURL(params: Record<string, string>): string {
        if (Object.keys(params).length === 0) {
            return "";
        }

        const encodedParams = Object.entries(params)
            .map(([key, value]) => {
                const encodedKey = encodeURIComponent(key);
                const encodedValue = encodeURIComponent(value);
                return `${encodedKey}=${encodedValue}`;
            })
            .join("&");

        return encodedParams;
    }

    /**
     * Serializes a metadata map to JSON string
     */
    static serializeMap(metadata: Record<string, string>): string {
        return JSON.stringify(metadata);
    }

    /**
     * Deserializes a JSON string to a metadata map
     */
    static deserializeMap(json: string): Record<string, string> {
        try {
            const parsed = JSON.parse(json);
            if (typeof parsed === "object" && parsed !== null) {
                return parsed;
            }
            return {};
        } catch {
            return {};
        }
    }
}

// Custom error class for EpicLeaderboard errors
export class EpicLeaderboardError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = "EpicLeaderboardError";
    }
}

// Main EpicLeaderboard class
export class EpicLeaderboard {
    private baseURL: string;

    constructor(baseURL: string = SERVER_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Gets leaderboard entries
     */
    async getLeaderboardEntries(game: EpicLeaderboardGame, leaderboard: EpicLeaderboardConfig, username: string, timeframe: Timeframe = Timeframe.AllTime, aroundPlayer: boolean = true, local: boolean = false): Promise<EpicLeaderboardGetEntriesResponse> {
        const queryParams = {
            gameID: game.gameID,
            primaryID: leaderboard.primaryID,
            secondaryID: leaderboard.secondaryID,
            username: username,
            timeframe: timeframe.toString(),
            around: aroundPlayer ? "1" : "0",
            local: local ? "1" : "0",
        };

        const url = `${this.baseURL}/api/getScores?${EpicLeaderboardUtils.constructParamsURL(queryParams)}`;

        try {
            const response = await this.makeRequest(url, {
                method: "GET",
                headers: {
                    "User-Agent": "X-EpicLeaderboard TS",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                throw new EpicLeaderboardError(
                    `Failed to get leaderboard entries: ${response.status}`,
                    response.status
                );
            }

            const data = await response.json();

            // Parse the response
            const result: EpicLeaderboardGetEntriesResponse = {
                entries: [],
                playerEntry: null,
            };

            // parse scores
            if (data.scores && Array.isArray(data.scores)) {
                for (const entry of data.scores as EpicLeaderboardEntry[]) {
                    result.entries.push({
                        rank: parseInt(entry.rank as unknown as string) || 0,
                        username: entry.username || "",
                        score: entry.score || "",
                        country: entry.country || "",
                        meta: EpicLeaderboardUtils.deserializeMap(entry.meta as unknown as string) || {},
                    });
                }
            }

            if(data.playerscore) {
                result.playerEntry = {
                    rank: parseInt(data.playerscore.rank as unknown as string) || 0,
                    username: data.playerscore.username || "",
                    score: data.playerscore.score || "",
                    country: data.playerscore.country || "",
                    meta: EpicLeaderboardUtils.deserializeMap(data.playerscore.meta as unknown as string) || {},
                };
            }

            return result;
        } catch (error) {
            if (error instanceof EpicLeaderboardError) {
                throw error;
            }
            throw new EpicLeaderboardError(`Failed to get leaderboard entries: ${error}`);
        }
    }

    /**
     * Submits a leaderboard entry with metadata
     */
    async submitLeaderboardEntry(game: EpicLeaderboardGame, leaderboard: EpicLeaderboardConfig, username: string, score: number, metadata: Record<string, string> = {}): Promise<void> {
        const metaJson = EpicLeaderboardUtils.serializeMap(metadata);

        const params = {
            gameID: game.gameID,
            gameKey: game.gameKey,
            primaryID: leaderboard.primaryID,
            secondaryID: leaderboard.secondaryID,
            username: username,
            score: score.toString(),
            meta: metaJson,
        };

        const content = EpicLeaderboardUtils.constructParamsURL(params);
        const url = `${this.baseURL}/api/submitScore`;

        try {
            const response = await this.makeRequest(url, {
                method: "POST",
                headers: {
                    "User-Agent": "X-EpicLeaderboard TS",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
                body: content,
            });

            if (!response.ok) {
                throw new EpicLeaderboardError(
                    `Failed to submit leaderboard entry: ${response.status}`,
                    response.status
                );
            }
        } catch (error) {
            if (error instanceof EpicLeaderboardError) {
                throw error;
            }
            throw new EpicLeaderboardError(`Failed to submit leaderboard entry: ${error}`);
        }
    }

    /**
     * Checks if a username is available
     */
    async isUsernameAvailable(
        game: EpicLeaderboardGame,
        username: string
    ): Promise<IsUsernameAvailableResponse> {
        const queryParams = {
            gameID: game.gameID,
            username: username,
        };

        const url = `${this.baseURL}/api/isUsernameAvailable_v2?${EpicLeaderboardUtils.constructParamsURL(queryParams)}`;

        try {
            const response = await this.makeRequest(url, {
                method: "GET",
                headers: {
                    "User-Agent": "X-EpicLeaderboard TS",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                throw new EpicLeaderboardError(
                    `Failed to check username availability: ${response.status}`,
                    response.status
                );
            }

            const data = await response.text();

            // Convert string response to enum
            switch (data) {
                case "0":
                    return IsUsernameAvailableResponse.Available;
                case "2":
                    return IsUsernameAvailableResponse.Profanity;
                case "3":
                    return IsUsernameAvailableResponse.Taken;
                default:
                    return IsUsernameAvailableResponse.Invalid;
            }
        } catch (error) {
            if (error instanceof EpicLeaderboardError) {
                throw error;
            }
            throw new EpicLeaderboardError(`Failed to check username availability: ${error}`);
        }
    }

    /**
     * Makes HTTP requests using fetch API (available in both Node.js 18+ and browsers)
     */
    private async makeRequest(url: string, options: RequestInit): Promise<Response> {
        // Check if fetch is available
        if (typeof fetch === "undefined") {
            throw new EpicLeaderboardError(
                "Fetch API not available. Please use Node.js 18+ or polyfill fetch for older versions."
            );
        }

        return fetch(url, options);
    }
}

// Default export for convenience
export default EpicLeaderboard;

// Create a default instance
export const epicleaderboard = new EpicLeaderboard(); 