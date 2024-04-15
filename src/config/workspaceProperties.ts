import * as vscode from "vscode";
import { FileSate } from "../interfaces/file";

/**
 * GEts the current save states.
 * @returns An array of all save states.
 */
export async function getSaveStates(): Promise<FileSate | undefined> {
    return await vscode.workspace.getConfiguration().get("terrys-snap-save.saveStates");
}

/**
 * Updates all save states.
 * @param fileStates - The new save states.
 */
export async function setSaveStates(fileStates: FileSate[]) {
    await vscode.workspace
        .getConfiguration()
        .update("terrys-snap-save.saveStates", fileStates, vscode.ConfigurationTarget.Workspace);
}
