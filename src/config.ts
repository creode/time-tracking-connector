import type { Project } from "./libs/productive.d.ts";

import ProductiveApi from "./libs/productiveApi";

const cc = DataStudioApp.createCommunityConnector();
const apiKey = PropertiesService.getUserProperties().getProperty("dscc.key");

export function getConfig() {
  const config = cc.getConfig();

  // Can I use the key to populate the projects?
  const productiveApi = new ProductiveApi(apiKey);
  const projects = productiveApi.getProjects();

  // Select the projects.
  projects.forEach((project: Project) => {
    config
      .newSelectSingle()
      .setId("projectId")
      .setName("Project")
      .setHelpText("Select the project to use.")
      .addOption(config.newOptionBuilder().setValue(project.id).setLabel(project.name));
  });

  return config.build();
}
