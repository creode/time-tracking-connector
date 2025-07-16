// Auth.js
// https://developers.google.com/looker-studio/connector/build#define_authentication_type_in_getauthtype
var cc = DataStudioApp.createCommunityConnector();

/**
 * Get the auth type
 * @returns {object}
 */
function getAuthType(): GoogleAppsScript.Data_Studio.GetAuthTypeResponse {
    return cc.newAuthTypeResponse()
      .setAuthType(cc.AuthType.KEY)
      .setHelpUrl('https://help.productive.io/en/articles/5440689-api-access-with-personal-access-tokens')
      .build();
}

/**
 * Reset the auth
 */
function resetAuth() {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty('dscc.key');
}

/**
 * Check if the auth is valid
 * @returns {boolean}
 */
function isAuthValid() {
    var userProperties = PropertiesService.getUserProperties();
    var key: string | null = userProperties.getProperty('dscc.key');

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
