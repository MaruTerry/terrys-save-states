import * as vscode from "vscode";
import { saveState } from "./logic/saveState";
import { loadState } from "./logic/loadState";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-snap-save.saveState", () => {
            saveState();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("terrys-snap-save.loadState", () => {
            loadState();
        })
    );
}

export function deactivate() {}
