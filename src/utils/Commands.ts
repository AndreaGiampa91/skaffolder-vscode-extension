import * as vscode from "vscode";
import * as SkaffolderCli from "skaffolder-cli";

import { Resource } from "../models/jsonreader/resource";
import { Page } from "../models/jsonreader/page";
import { DataService } from "../services/DataService";
import { Db } from "../models/jsonreader/db";

export class Commands {
  static registerCommands(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand("nodeDependencies.editEntry", node =>
      vscode.window.showInformationMessage(
        `Successfully called edit entry on ${node}.`
      )
    );

    // Register commands

    vscode.commands.registerCommand("skaffolder.generate", data => {
      vscode.window.showInformationMessage("Generation starts");
      try {
        SkaffolderCli.generate(
          vscode.workspace.rootPath + "/",
          DataService.getSkObject(),
          {
            info: function(msg: string) {
              vscode.window.showInformationMessage(msg);
            }
          },
          async function(err: string[], logs: string[]) {
            vscode.window.showInformationMessage("Generation completed");

            // Print results in file
            const myScheme = "skaffolder";
            const myProvider = new (class
              implements vscode.TextDocumentContentProvider {
              onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
              onDidChange = this.onDidChangeEmitter.event;

              // Create file content
              provideTextDocumentContent(uri: vscode.Uri): string {
                return logs.join("\n");
              }
            })();
            vscode.workspace.registerTextDocumentContentProvider(
              myScheme,
              myProvider
            );

            let uri = vscode.Uri.parse("skaffolder: Generation Complete");
            let doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc, { preview: false });
          }
        );
      } catch (e) {
        console.error(e);
      }
    });

    // Create project
    try {
      // Get list templates
      SkaffolderCli.getTemplate((err: any, template: any[]) => {
        vscode.commands.registerCommand("skaffolder.createProject", node => {
          let listFrontend: any[] = [];
          let listBackend: any[] = [];

          template.filter(temp => {
            if (temp.type === "frontend") {
              listFrontend.push({
                label: temp.name,
                context: temp._id
              });
            } else if (temp.type === "backend") {
              listBackend.push({
                label: temp.name,
                context: temp._id
              });
            }
          });

          // Ask name
          // vscode.window
          //   .showQuickPick([], {
          //     placeHolder: "Insert the name of your project"
          //   })
          //   .then(nameProj => {
          //     console.log(nameProj);
          // Ask backend
          vscode.window
            .showQuickPick(listFrontend, {
              placeHolder: "Choose your frontend language"
            })
            .then(frontendObj => {
              vscode.window
                .showQuickPick(listBackend, {
                  placeHolder: "Choose your backend language"
                })
                .then(async backendObj => {
                  console.log("ok");
                });
            });
        });
        // });
      });
    } catch (e) {
      console.error(e);
    }

    // Open model
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "skaffolder.openmodel",
        async (
          confiFilePath: vscode.Uri,
          rangeModel: vscode.Range,
          model: Resource,
          db: Db
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

          // Open file openapi
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

          // Open files
          console.log("ok");
          try {
            let files = DataService.findRelatedFiles("resource", model, db);
            console.log(files);

            this.openFiles(files);
          } catch (e) {
            console.error(e);
          }
        }
      )
    );

    // Register commands
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "skaffolder.openapi",
        async (
          confiFilePath: vscode.Uri,
          rangeModel: vscode.Range,
          model: Resource,
          db: Db
        ) => {
          // Open file openapi
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

          // Open files
          let files = DataService.findRelatedFiles("resource", model, db);

          this.openFiles(files);
        }
      )
    );

    // Register commands
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "skaffolder.openpage",
        async (
          confiFilePath: vscode.Uri,
          rangeModel: vscode.Range,
          page: Page
        ) => {
          // Open file openapi
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

          // Open files
          let files = DataService.findRelatedFiles("module", page);

          this.openFiles(files);
        }
      )
    );
  }
  static openFiles(files: string[]) {
    // Open files
    console.log(files);
    vscode.window.showQuickPick(files).then(async item => {
      if (item) {
        let uri = vscode.Uri.file(vscode.workspace.rootPath + "/" + item);
        await vscode.commands.executeCommand<vscode.Location[]>(
          "vscode.open",
          uri
        );
      }
    });
  }
}
