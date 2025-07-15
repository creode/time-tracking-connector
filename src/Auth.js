var cc = DataStudioApp.createCommunityConnector();

function getAuthType() {
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

    // Validate the key against the api.
    var productiveApi = new ProductiveApi(key);
    return productiveApi.validateKey();
}

/**
 * Sets the credentials.
 * @param {Request} request The set credentials request.
 * @return {object} An object with an errorCode.
 */
function setCredentials(request) {
    var key = request.key;
  
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('dscc.key', key);
    return {
      errorCode: 'NONE'
    };
}
