import * as vscode from "vscode";
import { File } from "../interfaces/file";

/**
 * Gets the currently saved files.
 * @returns An array of all saved files.
 */
export async function getSavedFiles(): Promise<File[]> {
    return (await vscode.workspace.getConfiguration().get("terrys-save-states.saveStates")) || [];
}

/**
 * Updates all saved files.
 * @param files - The new files to save.
 */
export async function setSavedFiles(files: File[]) {
    await vscode.workspace
        .getConfiguration()
        .update("terrys-save-states.saveStates", files, vscode.ConfigurationTarget.Workspace);
}
