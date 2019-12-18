import * as path from "path";
import { SkaffolderNode } from "../SkaffolderNode";

export class ModelApiNode {
  static execute(node: SkaffolderNode, indexMap: number[]) {
    // Set api
    let db = node.skaffolderObject.resources[indexMap[0]];
    let model = db._resources[indexMap[1]];
    let api = model._services[indexMap[2]];
    node.tooltip = api.method.toUpperCase() + " " + api.url;
    node.label = api.name;
    node.description = api.url;
    node.iconPath = {
      light: node.context.asAbsolutePath(
        path.join(
          "media",
          "light",
          "api_" + node.skaffolderObject.resources[indexMap[0]]._resources[indexMap[1]]._services[indexMap[2]].method + ".svg"
        )
      ),
      dark: node.context.asAbsolutePath(
        path.join(
          "media",
          "dark",
          "api_" + node.skaffolderObject.resources[indexMap[0]]._resources[indexMap[1]]._services[indexMap[2]].method + ".svg"
        )
      )
    };
    node.params = {
      type: "resource",
      db: db,
      model: model,
      range: api.index
    };
  }
}