import * as vscode from "vscode";
import { CustomTreeItem, createTreeItem } from "../interfaces/customTreeItem";
import { getSavedFiles } from "../config/workspaceProperties";
import { SaveSate } from "../interfaces/file";
import path from "path";

/**
 * Tree data provider for displaying todos in the sidebar tree view.
 */
export class OpenedSaveStatesTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | void> = new vscode.EventEmitter<
        CustomTreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private saveStates: SaveSate[] = [];

    private saveStateIconPath = {
        light: path.join(__filename, "..", "..", "..", "resources", "light", "bookmark.svg"),
        dark: path.join(__filename, "..", "..", "..", "resources", "dark", "bookmark.svg"),
    };

    /**
     * Constructor for the TodosTreeDataProvider.
     *
     * @param secretStorage - VS Code SecretStorage for handling secure data.
     */
    constructor() {
        // Subscribe to changes in the JSON data and trigger a refresh
        vscode.workspace.onDidChangeConfiguration(() => {
            this.refresh(true);
        });
        this.refresh(true);
    }

    /**
     * Refreshes the tree view with the latest project data.
     *
     * @param hideNotification - Flag to hide the refresh notification.
     */
    async refresh(hideNotification?: boolean): Promise<void> {
        this.saveStates = [];
        let openedFileName = vscode.window.activeTextEditor?.document.fileName;
        if (openedFileName !== undefined) {
            await getSavedFiles()
                .then((data) => {
                    this.saveStates = data.find((file) => file.name === openedFileName)?.saveStates || [];
                })
                .catch(() => {
                    this.saveStates = [];
                });
            if (!hideNotification) {
                vscode.window.showInformationMessage("Save states refreshed");
            }
            this._onDidChangeTreeData.fire();
        }
    }

    /**
     * Gets the tree item representation for the given element.
     *
     * @param currentTreeItem - The current tree item.
     * @returns The tree item representation.
     */
    getTreeItem(currentTreeItem: CustomTreeItem): vscode.TreeItem {
        return currentTreeItem;
    }

    /**
     * Gets the children of the given element or root if no element is provided.
     *
     * @param currentTreeItem - The current tree item.
     * @returns A promise with the array of children tree items.
     */
    getChildren(currentTreeItem?: CustomTreeItem): Thenable<CustomTreeItem[]> {
        if (this.saveStates.length > 0) {
            if (!currentTreeItem) {
                return Promise.resolve(this.getBaseItems());
            } else {
                return Promise.resolve(this.getFollowUpItems(currentTreeItem));
            }
        }
        const newItem = new vscode.TreeItem(
            "No save states found",
            vscode.TreeItemCollapsibleState.None
        ) as CustomTreeItem;
        newItem.contextValue = "noData";
        return Promise.resolve([newItem]);
    }

    /**
     * Gets the base items (save states) for the root level.
     *
     * @returns An array of tree items for the root level.
     */
    private getBaseItems(): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        this.saveStates.map((saveState: SaveSate) => {
            const newItem = createTreeItem(
                new Date(saveState.timestamp).toLocaleString(),
                saveState.description,
                vscode.TreeItemCollapsibleState.None,
                this.saveStateIconPath,
                saveState.id
            );
            newItem.contextValue = "saveState";
            treeItems.push(newItem);
        });
        return treeItems;
    }

    /**
     * Gets the follow-up items.
     *
     * @param currentTreeItem - The current tree item.
     * @returns An array of tree items for the follow-up level.
     */
    private getFollowUpItems(currentTreeItem: CustomTreeItem): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        return treeItems;
    }
}
