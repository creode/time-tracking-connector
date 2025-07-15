function getConfig(request) {
    var config = cc.getConfig();
    
    // Get the API key from user properties
    var userProperties = PropertiesService.getUserProperties();
    var apiKey = userProperties.getProperty('dscc.key');
    var configParams = request.configParams;
    var isFirstRequest = configParams === undefined;

    if (!apiKey) {
        throw new Error('API key not found. Please authenticate first.');
    }

    if (isFirstRequest) {
        config.setIsSteppedConfig(true);

        // Set organisation id.
        config.newTextInput()
            .setId('organisationId')
            .setName('Organisation')
            .setHelpText('Enter the organisation id.');
    }

    if (!isFirstRequest) {
        var projectSelect = config.newSelectSingle()
            .setId("projectId")
            .setName("Projects");

        var organisationId = configParams.organisationId;

        var productiveApi = new ProductiveApi(apiKey);
        var projects = productiveApi.getProjects(organisationId);
        projects.forEach(function(project) {
            projectSelect.addOption(config.newOptionBuilder().setLabel(project.name).setValue(project.id));
        });
    }

    config.setDateRangeRequired(true);

    return config.build();
}