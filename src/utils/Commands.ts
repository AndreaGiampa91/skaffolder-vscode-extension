import * as vscode from "vscode";

export class Commands {
  static registerCommands(context: vscode.ExtensionContext) {
    // Register commands
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "skaffolder.openmodel",
        async (
          confiFilePath: vscode.Uri,
          files: vscode.Uri[],
          rangeModel: vscode.Range
        ) => {
          // // open file source
          // await vscode.commands.executeCommand<vscode.Location[]>(
          //   "workbench.action.quickOpen",
          //   files
          // );

          // // Simulate ctrl + P
          // try {
          //   await vscode.commands.executeCommand<vscode.Location[]>(
          //     "workbench.action.quickOpen",
          //     "package.json"
          //   );
          // } catch (e) {
          //   console.error(e);
          // }

          // Open file
          try {
            // let contexturl = vscode.Uri.file(
            //   vscode.workspace.rootPath + "/openapi.yaml"
            // );

            await vscode.commands.executeCommand<vscode.Location[]>(
              "vscode.open",
              confiFilePath
            );
          } catch (e) {
            console.error(e);
          }

          // Select range
          // let pos: vscode.Position = new vscode.Position(3, 2);
          // let pos2: vscode.Position = new vscode.Position(8, 4);
          // let range: vscode.Range = new vscode.Range(pos, pos2);
          let selection: vscode.Selection = new vscode.Selection(
            rangeModel.start,
            rangeModel.end
          );
          vscode.window.visibleTextEditors[0].selection = selection;
          vscode.window.visibleTextEditors[0].revealRange(rangeModel);
        }
      )
    );

    // Register commands
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "skaffolder.openapi",
        async (
          confiFilePath: vscode.Uri,
          files: vscode.Uri[],
          rangeModel: vscode.Range
        ) => {
          // Open file
          try {
            await vscode.commands.executeCommand<vscode.Location[]>(
              "vscode.open",
              confiFilePath
            );
          } catch (e) {
            console.error(e);
          }

          // Select range
          let selection: vscode.Selection = new vscode.Selection(
            rangeModel.start,
            rangeModel.end
          );
          vscode.window.visibleTextEditors[0].selection = selection;
          vscode.window.visibleTextEditors[0].revealRange(rangeModel);
        }
      )
    );

    // Register commands
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "skaffolder.openpage",
        async (
          confiFilePath: vscode.Uri,
          files: vscode.Uri[],
          rangeModel: vscode.Range
        ) => {
          // Open file
          try {
            await vscode.commands.executeCommand<vscode.Location[]>(
              "vscode.open",
              confiFilePath
            );
          } catch (e) {
            console.error(e);
          }

          // Select range
          let selection: vscode.Selection = new vscode.Selection(
            rangeModel.start,
            rangeModel.end
          );
          vscode.window.visibleTextEditors[0].selection = selection;
          vscode.window.visibleTextEditors[0].revealRange(rangeModel);
        }
      )
    );
  }
}
