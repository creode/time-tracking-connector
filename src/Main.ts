// Main.js
// Main entrypoint for the connector.
// https://developers.google.com/looker-studio/connector/build
var cc = DataStudioApp.createCommunityConnector();

/**
 * Check if the user is an admin
 * @returns {boolean}
 */
function isAdminUser() {
    // TODO: Remove when deploying for real.
    return true;
}
