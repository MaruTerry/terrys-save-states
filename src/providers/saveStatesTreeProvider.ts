import * as vscode from "vscode";
import { CustomTreeItem, createTreeItem } from "../interfaces/customTreeItem";
import { getSavedFiles } from "../config/workspaceProperties";
import { File } from "../interfaces/file";
import path from "path";

/**
 * Tree data provider for displaying todos in the sidebar tree view.
 */
export class SaveStatesTreeDataProvider implements vscode.TreeDataProvider<CustomTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CustomTreeItem | undefined | void> = new vscode.EventEmitter<
        CustomTreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<CustomTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private savedFiles: File[] = [];

    private fileIconPath = {
        light: path.join(__filename, "..", "..", "..", "resources", "light", "file.svg"),
        dark: path.join(__filename, "..", "..", "..", "resources", "dark", "file.svg"),
    };

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
        this.savedFiles = [];
        await getSavedFiles()
            .then((data) => {
                this.savedFiles = data;
            })
            .catch(() => {
                this.savedFiles = [];
            });
        if (!hideNotification) {
            vscode.window.showInformationMessage("Save states refreshed");
        }
        this._onDidChangeTreeData.fire();
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
        if (this.savedFiles.length > 0) {
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
     * Gets the base items (files) for the root level.
     *
     * @returns An array of tree items for the root level.
     */
    private getBaseItems(): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        this.savedFiles.map((file: File) => {
            const newItem = createTreeItem(
                file.name.split("\\")[file.name.split("\\").length - 1],
                "",
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined,
                file.name
            );
            newItem.contextValue = "file";
            treeItems.push(newItem);
        });
        return treeItems;
    }

    /**
     * Gets the follow-up items (save states) for a given file.
     *
     * @param currentTreeItem - The current tree item.
     * @returns An array of tree items for the follow-up level.
     */
    private getFollowUpItems(currentTreeItem: CustomTreeItem): CustomTreeItem[] {
        let treeItems: CustomTreeItem[] = [];
        const file = this.savedFiles.find((file) => file.name === currentTreeItem.id);
        if (file) {
            file.saveStates.map((saveState) => {
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
        }
        return treeItems;
    }
}
