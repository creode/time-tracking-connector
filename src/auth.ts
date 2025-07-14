export function getAuthType() {
    var cc = DataStudioApp.createCommunityConnector();
    return cc.newAuthTypeResponse()
      .setAuthType(cc.AuthType.KEY)
      .setHelpUrl('https://help.productive.io/en/articles/5440689-api-access-with-personal-access-tokens')
      .build();
}

export function resetAuth() {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty('dscc.key');
}

export function isAuthValid() {
    var userProperties = PropertiesService.getUserProperties();
    var key = userProperties.getProperty('dscc.key');

    // Validate key against API.

    return key !== null;
}
