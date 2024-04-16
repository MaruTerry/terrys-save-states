import * as vscode from "vscode";

/**
 * Custom interface extending vscode.TreeItem to include additional properties.
 */
export interface CustomTreeItem extends vscode.TreeItem {
    description?: string | boolean;
    text?: string;
}

/**
 * Creates a new tree item with the given properties.
 *
 * @param label - The label of the tree item.
 * @param description - (Optional) The description of the tree item.
 * @param collapsibleState - (Optional) The collapsible state of the tree item.
 * @param iconPath - (Optional) The path to the icon of the tree item.
 * @param id - (Optional) The ID of the tree item.
 * @returns The created tree item.
 */
export function createTreeItem(
    label: string,
    description?: string,
    collapsibleState?: vscode.TreeItemCollapsibleState,
    iconPath?: { light: string; dark: string },
    id?: string
): CustomTreeItem {
    let treeItem = new vscode.TreeItem(label, collapsibleState) as CustomTreeItem;
    treeItem.description = description;
    treeItem.iconPath = iconPath;
    treeItem.id = id;
    return treeItem;
}
