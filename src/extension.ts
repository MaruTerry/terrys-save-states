import * as vscode from "vscode";
import { clearStates, deleteState, editDescription, loadState, saveState } from "./logic/saveState";
import { SaveStatesTreeDataProvider } from "./providers/saveStatesTreeProvider";
import { OpenedSaveStatesTreeDataProvider } from "./providers/openedSaveStatesTreeProvider";
import { CustomTreeItem } from "./interfaces/customTreeItem";
import { getSavedFiles } from "./config/workspaceProperties";

export function activate(context: vscode.ExtensionContext) {
    const openedSaveStatesTreeDataProvider = new OpenedSaveStatesTreeDataProvider();
    context.subscriptions.push(
        vscode.window.createTreeView("opened-save-states-tree", {
            treeDataProvider: openedSaveStatesTreeDataProvider,
        })
    );
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            openedSaveStatesTreeDataProvider.refresh(true);
        })
    );

    const saveStatesTreeDataProvider = new SaveStatesTreeDataProvider();
    context.subscriptions.push(
        vscode.window.createTreeView("save-states-tree", {
            treeDataProvider: saveStatesTreeDataProvider,
            showCollapseAll: true,
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-save-states.saveState", () => {
            saveState();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-save-states.chooseStateToLoad", async () => {
            let openedFileName = vscode.window.activeTextEditor?.document.fileName;
            let savedFiles = await getSavedFiles();
            if (openedFileName !== undefined) {
                if (!savedFiles.some((file) => file.name === openedFileName)) {
                    vscode.window.showWarningMessage("No save states found");
                    return;
                }
                savedFiles.forEach(async (file) => {
                    if (file.name === openedFileName) {
                        if (file.saveStates.length === 0) {
                            vscode.window.showWarningMessage("No save states found");
                            return;
                        }
                        let chosenSaveStateDate = await vscode.window.showQuickPick(
                            file.saveStates.map((saveState) => new Date(saveState.timestamp).toLocaleString()),
                            {
                                title: "Loading Save State...",
                                placeHolder: "Choose a save state to load",
                            }
                        );
                        let saveState = file.saveStates?.find(
                            (saveState) =>
                                saveState && new Date(saveState.timestamp).toLocaleString() === chosenSaveStateDate
                        );
                        if (saveState !== undefined) {
                            loadState(saveState);
                        }
                    }
                });
            } else {
                vscode.window.showWarningMessage("No open file to load a save state for");
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-save-states.loadState", async (treeItem: CustomTreeItem) => {
            let savedFiles = await getSavedFiles();
            if (treeItem.id) {
                let saveState = savedFiles
                    .map((file) => file.saveStates)
                    .flat()
                    .find((saveState) => saveState.id === treeItem.id);
                if (saveState !== undefined) {
                    loadState(saveState);
                    return;
                }
            }
            vscode.window.showWarningMessage("No save state found");
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-save-states.clearStates", () => {
            let openedFileName = vscode.window.activeTextEditor?.document.fileName;
            if (openedFileName !== undefined) {
                clearStates(openedFileName);
                return;
            }
            vscode.window.showWarningMessage("No open file to clear save states for");
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-save-states.clearStatesFromTreeView", (treeItem: CustomTreeItem) => {
            if (treeItem.id !== undefined) {
                clearStates(treeItem.id);
                return;
            }
            vscode.window.showWarningMessage("No open file to clear save states for");
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-save-states.editDescription", async (treeItem: CustomTreeItem) => {
            await vscode.window
                .showInputBox({
                    placeHolder: "Enter a description for the save state",
                    value: treeItem.description?.toString(),
                })
                .then((description) => {
                    if (description !== undefined) {
                        if (treeItem.id !== undefined) {
                            editDescription(treeItem.id, description);
                        } else {
                            vscode.window.showWarningMessage("No save state found");
                        }
                    }
                });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-save-states.deleteSaveState", (treeItem: CustomTreeItem) => {
            if (treeItem.id !== undefined) {
                deleteState(treeItem.id);
                return;
            }
            vscode.window.showWarningMessage("No save state found");
        })
    );
}

export function deactivate() {}
