// Config.js
// https://developers.google.com/looker-studio/connector/build#define_configuration_via_getconfig
var cc = DataStudioApp.createCommunityConnector();

/**
 * Get the config
 * @param {GoogleAppsScript.Data_Studio.Request<any>} request 
 * @returns {GoogleAppsScript.Data_Studio.Config}
 */
function getConfig(request: GoogleAppsScript.Data_Studio.Request<any>): GoogleAppsScript.Data_Studio.Config {
    var config = cc.getConfig();
    
    // Get the API key from user properties
    var userProperties = PropertiesService.getUserProperties();
    var apiKey = userProperties.getProperty('dscc.key');
    var configParams = request.configParams;
    var isFirstRequest = configParams === undefined;

    if (!apiKey) {
        throw new Error('API key not found. Please authenticate first.');
    }

    if (isFirstRequest || !configParams.organisationId) {
        config.setIsSteppedConfig(true);

        // Set organisation id.
        config.newTextInput()
            .setId('organisationId')
            .setName('Productive Organisation ID')
            .setHelpText('Enter the organisation ID found in the same section as the API key.');
    }

    if (!isFirstRequest && configParams.organisationId) {
        var projectSelect = config.newSelectSingle()
            .setId("projectId")
            .setName("Productive Project")
            .setHelpText('Select the project you want to get data from.')
            .setAllowOverride(true);

        var organisationId = configParams.organisationId;

        var productiveApi = new ProductiveApi(apiKey);
        var projects = productiveApi.getProjects(organisationId);
        projects.forEach(function(project: any) {
            projectSelect.addOption(config.newOptionBuilder().setLabel(project.name).setValue(project.id));
        });
    }

    config.setDateRangeRequired(true);

    return config.build();
}