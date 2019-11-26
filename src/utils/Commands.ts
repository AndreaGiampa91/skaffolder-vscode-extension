import * as vscode from "vscode";
import * as path from "path";
import * as SkaffolderCli from "skaffolder-cli";
import { Resource } from "../models/jsonreader/resource";
import { Page } from "../models/jsonreader/page";
import { DataService } from "../services/DataService";
import { Db } from "../models/jsonreader/db";
import { SkaffolderNode } from "../models/SkaffolderNode";
import { StatusBarManager } from "./StatusBarManager";
import * as fs from "fs";
import * as test from "../test/test";


export class Commands {

  static registerCommands(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand("nodeDependencies.editEntry", node =>
      vscode.window.showInformationMessage(
        `Successfully called edit entry on ${node}.`
      )
    );

    // Register commands
    vscode.commands.registerCommand("skaffolder.login", data => {
      SkaffolderCli.login(
        {},
        {},
        {
          info: function (msg: string) {
            console.log(msg);
          }
        },
        StatusBarManager.refresh
      );
    });

    vscode.commands.registerCommand("skaffolder.export", data => {
      let params: any = DataService.readConfig();
      params.skObject = DataService.getYaml();
      DataService.exportProject(params, function (err: any, logs: any) {
        console.log(err, logs);
      });
    });

    vscode.commands.registerCommand("skaffolder.generate", data => {
      vscode.window.showInformationMessage("Generation starts");
      try {
        SkaffolderCli.generate(
          vscode.workspace.rootPath + "/",
          DataService.getSkObject(),
          {
            info: function (msg: string) {
              vscode.window.showInformationMessage(msg);
            }
          },
          async function (err: string[], logs: string[]) {
            vscode.window.showInformationMessage("Generation completed");

            // Print results in HTML
            const panel = vscode.window.createWebviewPanel(
              "skaffolder", // Identifies the type of the webview. Used internally
              "Skaffolder Generation Result", // Title of the panel displayed to the user
              vscode.ViewColumn.One, // Editor column to show the new webview panel in.
              {
                enableScripts: true
              }
            );

            const filePath: vscode.Uri = vscode.Uri.file(
              path.join(
                context.extensionPath,
                "src",
                "html",
                "reportGeneration.html"
              )
            );
            var html = fs.readFileSync(filePath.fsPath, "utf8");
            html += logs.join("\n");
            panel.webview.html = html;
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
          if (vscode.workspace.rootPath === undefined) {
            vscode.window.showInformationMessage("Please open a workspace!");
            return;
          }
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
          vscode.window
            .showInputBox({
              placeHolder: "Insert the name of your project"
            })
            .then(nameProj => {
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
                      vscode.window.showInformationMessage(
                        "Start creation project!"
                      );
                      let skObj = DataService.createSkObj(nameProj as string);
                      SkaffolderCli.createProjectExtension(
                        vscode.workspace.rootPath + "/",
                        "",
                        {
                          info: function (msg: string) {
                            vscode.window.showInformationMessage(msg);
                          }
                        },
                        frontendObj,
                        backendObj,
                        skObj,
                        function (skObj) {
                          SkaffolderCli.init(
                            vscode.workspace.rootPath + "/",
                            skObj.project,
                            skObj.modules,
                            skObj.resource,
                            skObj.dbs
                          );
                          let content = fs.readFileSync(
                            (vscode.workspace.rootPath +
                              "/.skaffolder/template/openapi.yaml.hbs") as string,
                            "utf-8"
                          );
                          let file = SkaffolderCli.getProperties(
                            content,
                            "openapi.yaml.hbs",
                            "/.skaffolder/template/"
                          );
                          SkaffolderCli.generateFile(
                            [],
                            {
                              name: "openapi.yaml",
                              overwrite: file.overwrite,
                              template: file.template
                            },
                            skObj,
                            {}
                          );
                          vscode.window.showInformationMessage(
                            "Project create with openapi"
                          );
                        }
                      );
                    });
                });
            });
        });
      });
    } catch (e) {
      console.error(e);
    }
    // Edit model

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "skaffolder.editValue",
        async (contextNode: SkaffolderNode) => {
          const panel = vscode.window.createWebviewPanel(
            "skaffolder",
            "Skaffolder Edit",
            vscode.ViewColumn.One,
            
            {
              enableScripts: true,
            
            }
          );
          try {
            // const filePath: vscode.Uri = vscode.Uri.file(
            //   path.join(context.extensionPath, "src", "html", "editModel.html")
            // );
            // panel.webview.html = fs.readFileSync(filePath.fsPath, "utf8");

            panel.webview.html = new test.Test().test1(contextNode, context.extensionPath);
            // panel.webview.html = `<!DOCTYPE html>
            // <html lang="en">
            
            // <head>
            //   <meta charset="UTF-8" />
            //   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            //   <meta http-equiv="Content-Security-Policy" content="default-src 'self' vscode-resource: https:;
            //                                 script-src vscode-resource: 'self' 'unsafe-inline' 'unsafe-eval' https:;
            //                                 style-src vscode-resource: 'self' 'unsafe-inline';
            //                                 img-src 'self' vscode-resource: data:" />
            //   <title>Edit Model</title>
            // </head>
            // <style>
            //   body {
            //     background-color: #33343C;
            //   }

            //   .auto-vertical {
            //     margin-bottom: auto;
            //     margin-top: auto;
            //   }

            //   .left {
            //     float: left;
            //   }

            //   .block {
            //     display: block;
            //   }

            //   .ml-15 {
            //     margin-left: 15px;
            //   }

            //   .mr-15 {
            //     margin-right: 15px;
            //   }

            //   .mt-5 {
            //     margin-top: 5px;
            //   }

            //   .ft-13 {
            //     font-size: 13px;
            //   }

            //   .ft-20 {
            //     font-size: 20px;
            //   }

            //   .border-bottom {
            //     border-top: none !important;
            //     border-right: none !important;
            //     border-left: none !important;
            //     border-bottom: 1px solid white !important;
            //   }

            //   .title-container {
            //     margin-top: 20px;
            //     width: 100%;
            //     height: 50px;
            //     border-radius: 5px;
            //     background-color: #222329;
            //   }
              
            //   .section1 {
            //     width: 60%;
            //     border-right: 1px solid white;
               
            //   }

            //   .section2 {
            //     width: 30%;
            //     float: right;
            //   }

            //   .entity-name {
            //     color: #698CCA;
            //     margin-left: 10px;
                
            //   }

            //   .button-save {
            //     background-color: #87E283;
            //     color: black;
            //     border-radius: 20px;
            //     float: right;
            //     margin-right: 20px;
            //   }

            //   .button-required {
            //     background-color: #5996F3;
            //     color: white;
            //     border-radius: 5px;
            //   }

            //   .name {
            //     border-bottom: 1px solid black;
            //     width: 50%;
            //   }

            //   .input-text {
            //     width: 30%;
            //     background-color: transparent;
            //     font-size: 13px;
            //   }

            //   .input-text-attr {
            //     width: 15%;
            //     background-color: transparent;
            //     font-size: 13px;
            //   }
              
            //   .logo {
            //     width: 50%;
            //     min-width: 300px;
            //     height: 50px;
            //   }
            // </style>
            
            // <body>
            // <div id="container">
            //   <div class="title-container">
            //     <div class="section1 auto-vertical left block">
            //       <h1 class="ft-20 ml-15"> Model 
            //        <span class="entity-name ft-13"> ${ contextNode.skaffolderObject.dbs[0]._entity[0].name } </span>
            //       </h1>
            //     </div>
            //     <div class="section2 auto-vertical  block">
            //      <p class="ml-15 ft-13"> Delete model 
            //       <span>
            //         <button id="save" class="button-save mt-5"> Save </button>
            //       </span>
            //      </p>
            //     </div>
            //   </div>
            //   <div class="name">
            //     <h3 class="ft-13">
            //       Name
            //     <span>
            //       <input class="input-text border-bottom ml-15" type="text" placeholder=" ${ contextNode.skaffolderObject.dbs[0]._entity[0].name }">
            //     </span>
            //     </h3>
            //   </div>
            //   $ { work}
            //   <div class="attributes name">
            //     <h3 class="ft-13">
            //     Attributes:
            //     </h3>
            //     <p> 
            //       <span> 
            //         <input class="input-text-attr border-bottom ml-15" type="text" placeholder="${ contextNode.skaffolderObject.dbs[0]._entity[0]._attrs[0].name }">
            //       </span>
            //       <span> 
            //         <input class="input-text-attr border-bottom ml-15" type="text" placeholder="${ contextNode.skaffolderObject.dbs[0]._entity[0]._attrs[0].type }">
            //       </span>
            //       <span>
            //         <button id="required" class="button-required ml-15"> Required </button>
            //       </span>
            //       <span>
            //         <button id="unique" class="button-required ml-15"> Unique </button>
            //       </span>
            //       <span>
            //         <button id="enumeration" class="button-required ml-15"> Enumeration </button>
            //       </span>
            //     </p>
            //   </div>
            //   <div class="relation">
            //     <h3 class="ft-13">
            //       Relation:
            //     </h3>
            //     <p class="relations">
            //       Type
            //       <span>
            //         <input class="input-text-attr border-bottom ml-15 mr-15" type="text" placeholder="${ contextNode.skaffolderObject.dbs[0]._entity[1]._relations[0].type } ">
            //       </span>
            //       Name
            //       <span>
            //         <input class="input-text-attr border-bottom ml-15 mr-15" type="text" placeholder="${ contextNode.skaffolderObject.dbs[0]._entity[1]._relations[0].name} ">
            //       </span>
            //       <span>
            //         <button id="required" class="button-required"> Required </button>
            //       </span>

            // </div>
              
              
            // </body>
            // </html>`;

          } catch (e) {
            console.error(e);
          }

          panel.webview.postMessage({
            command: "my-command",
            data: JSON.stringify(contextNode.skaffolderObject)
          });

          //Handle messages from the webview
          panel.webview.onDidReceiveMessage(
            message => {
              switch (message.command) {
                case "save":
                  vscode.window.showInformationMessage("Save");
                  return;
                case "get-data": 
                  console.log("get data");
                  console.log(JSON.stringify(message));
                  return;
              }
            },
            undefined,
            context.subscriptions
          );
        }
      )
    );
    

    // Edit model
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "skaffolder.editValue_yaml",
        async (context: SkaffolderNode) => {
          if (context.params && context.params.range) {
            // Open file openapi

            let contexturl = vscode.Uri.file(
              vscode.workspace.rootPath + "/openapi.yaml"
            );

            try {
              await vscode.commands.executeCommand<vscode.Location[]>(
                "vscode.open",
                contexturl
              );
            } catch (e) {
              console.error(e);
            }

            // Select range
            let selection: vscode.Selection = new vscode.Selection(
              context.params.range.start,
              context.params.range.end
            );
            vscode.window.visibleTextEditors[0].selection = selection;
            vscode.window.visibleTextEditors[0].revealRange(
              context.params.range
            );
          } else {
            console.error("Type node not provided");
          }
        }
      )
    );

    // Open files
    context.subscriptions.push(
      vscode.commands.registerCommand(
        "skaffolder.openfiles",
        async (context: SkaffolderNode) => {
          // Open files
          try {
            if (context.params) {
              if (context.params.type === "resource") {
                let files = DataService.findRelatedFiles(
                  "resource",
                  context.params.model as Resource,
                  context.params.db as Db
                );
                this.openFiles(files);
              } else if (context.params.type === "module") {
                let files = DataService.findRelatedFiles("module", context
                  .params.page as Page);
                this.openFiles(files);
              } else if (context.params.type === "db") {
                let files = DataService.findRelatedFiles("db", context.params
                  .db as Db);
                this.openFiles(files);
              } else {
                console.error("Type " + context.params.type + " not valid");
              }
            } else {
              console.error("Type node not provided");
            }
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
