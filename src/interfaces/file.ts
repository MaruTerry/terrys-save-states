import { getNonce } from "../util/getNonce";

export interface File {
    name: string;
    saveStates: SaveSate[];
}

export interface SaveSate {
    id: string;
    content: string;
    timestamp: number;
    description: string;
}

/**
 * Create a new save state from the given file content.
 *
 * @param content - The content of the file.
 */
export function createSaveState(content: string): SaveSate {
    return {
        id: getNonce(),
        content: content,
        timestamp: Date.now(),
        description: "",
    };
}
