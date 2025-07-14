import type { Project } from "./libs/productive.d.ts";

import ProductiveApi from "./libs/productiveApi";

var cc = DataStudioApp.createCommunityConnector();
var apiKey = PropertiesService.getUserProperties().getProperty('dscc.key');

export function getConfig() {
    var config = cc.getConfig();

    // Can I use the key to populate the projects?
    var productiveApi = new ProductiveApi(apiKey);
    var projects = productiveApi.getProjects();

    // Select the projects.
    projects.forEach((project: Project) => {
        config.newSelectSingle()
            .setId('projectId')
            .setName('Project')
            .setHelpText('Select the project to use.')
            .addOption(config.newOptionBuilder()
                .setValue(project.id)
                .setLabel(project.name)
            );
    });

    return config.build();
}
