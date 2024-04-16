import * as vscode from "vscode";
import { SaveSate, createSaveState } from "../interfaces/file";
import { getSavedFiles, setSavedFiles } from "../config/workspaceProperties";

/**
 * Saves the current state of the active file.
 */
export async function saveState() {
    const openedFileName = vscode.window.activeTextEditor?.document.fileName;
    const openedFileContent = vscode.window.activeTextEditor?.document.getText();
    let savedFiles = await getSavedFiles();
    if (openedFileName !== undefined && openedFileContent !== undefined) {
        let newSaveState = createSaveState(openedFileContent);
        let fileExists = false;
        savedFiles.forEach((file) => {
            if (file.name === openedFileName) {
                // if (file.saveStates.length > 2) {
                //     file.saveStates.shift();
                // }
                file.saveStates.push(newSaveState);
                fileExists = true;
            }
        });
        if (!fileExists) {
            savedFiles.push({
                name: openedFileName,
                saveStates: [newSaveState],
            });
        }
        await setSavedFiles(savedFiles);
        vscode.window.showInformationMessage("Created a new save state");
    } else {
        vscode.window.showWarningMessage("No open file to create a save state for");
    }
}

/**
 * Load the given save state into the active text editor.
 *
 * @param saveState - The save state to load.
 */
export async function loadState(saveState: SaveSate) {
    if (vscode.window.activeTextEditor) {
        vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.replace(
                new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(
                        vscode.window.activeTextEditor?.document.lineCount as number,
                        vscode.window.activeTextEditor?.document.lineAt(
                            vscode.window.activeTextEditor?.document.lineCount - 1
                        ).text.length || 0
                    )
                ),
                saveState.content
            );
        });
        vscode.window.showInformationMessage("Loaded save state");
    } else {
        vscode.window.showWarningMessage("No open file to load a save state for");
    }
}

/**
 * Deletes a save state by the given id.
 */
export async function deleteState(id: string) {
    let savedFiles = await getSavedFiles();
    for (let file of savedFiles) {
        file.saveStates = file.saveStates.filter((state) => state.id !== id);
        if (file.saveStates.length === 0) {
            savedFiles = savedFiles.filter((f) => f.name !== file.name);
        }
    }
    await setSavedFiles(savedFiles);
}

/**
 * Deletes all save sates for the given file name.
 */
export async function clearStates(fileName: string) {
    await vscode.window
        .showInputBox({
            placeHolder: "Type 'DELETE' to confirm",
            prompt: "This will delete all save states for the current file",
        })
        .then(async (value) => {
            if (value === "DELETE") {
                let savedFiles = await getSavedFiles();
                savedFiles = savedFiles.filter((file) => file.name !== fileName);
                await setSavedFiles(savedFiles);
            }
        });
}

/**
 * Edits the description of a save state.
 *
 * @param id - The id of the save state to edit
 * @param newDescription - The new description for the save state
 */
export async function editDescription(id: string, newDescription: string) {
    let savedFiles = await getSavedFiles();
    for (let file of savedFiles) {
        let saveState = file.saveStates.find((state) => state.id === id);
        if (saveState) {
            saveState.description = newDescription;
        }
    }
    await setSavedFiles(savedFiles);
}
