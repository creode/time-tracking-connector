function getAuthType() {
    var cc = DataStudioApp.createCommunityConnector();
    return cc.newAuthTypeResponse()
      .setAuthType(cc.AuthType.KEY)
      .setHelpUrl('https://help.productive.io/en/articles/5440689-api-access-with-personal-access-tokens')
      .build();
}

function resetAuth() {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty('dscc.key');
}

function isAuthValid() {
    var userProperties = PropertiesService.getUserProperties();
    var key = userProperties.getProperty('dscc.key');

    // Validate key against API.

    return key !== null;
}

function getConfig() {
    var cc = DataStudioApp.createCommunityConnector();
    var config = cc.getConfig();
    
    // Get the API key from user properties
    var userProperties = PropertiesService.getUserProperties();
    var apiKey = userProperties.getProperty('dscc.key');
    
    if (!apiKey) {
        throw new Error('API key not found. Please authenticate first.');
    }

    // Use the key to populate the projects
    var productiveApi = new ProductiveApi(apiKey);
    var projects = productiveApi.getProjects();

    // Select the projects.
    projects.forEach((project) => {
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

function getSchema() {
    return [
        {
            name: 'test',
            label: 'Test',
            dataType: 'STRING'
        }
    ]
}

function getData() {
    var cc = DataStudioApp.createCommunityConnector();
    var config = cc.getConfig();

    // var projectId = config.getField('projectId').getValue();

    return [
        {
            test: 'test'
        }
    ];
}
