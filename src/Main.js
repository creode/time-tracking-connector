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

function getOrganisationField() {
    var userProperties = PropertiesService.getUserProperties();
    var key = userProperties.getProperty('dscc.key');

    var productiveApi = new ProductiveApi(key);
    return productiveApi.getOrganisationId();
}

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

function getFields() {
    var fields = cc.getFields();
    var types = cc.FieldType;
    var aggregations = cc.AggregationType;

    fields.newDimension()
        .setId('projectName')
        .setName('Project')
        .setType(types.TEXT)

    fields.newDimension()
        .setId('projectId')
        .setName('Project ID')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('date')
        .setName('Date')
        .setType(types.YEAR_MONTH_DAY);

    fields.newDimension()
        .setId('description')
        .setName('Description')
        .setType(types.TEXT);

    fields.newMetric()
        .setId('time')
        .setName('Time')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);

    fields.newMetric()
        .setId('billableTime')
        .setName('Billable Time')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);

    return fields;
}

function getSchema(request) {
    return {schema: getFields().build()};
}

function getData(request) {
    try {
        var configParams = request.configParams;

        if (!configParams) {
            throw new Error('Config params are required.');
        }

        var organisationId = configParams.organisationId;
        var projectId = configParams.projectId;
        var startDate = request.dateRange.startDate;
        var endDate = request.dateRange.endDate;

        if (!organisationId || !projectId || !startDate || !endDate) {
            throw new Error('Missing required parameters: organisationId, projectId, startDate, or endDate');
        }

        var userProperties = PropertiesService.getUserProperties();
        var apiKey = userProperties.getProperty('dscc.key');

        if (!apiKey) {
            throw new Error('API key not found. Please authenticate first.');
        }

        var productiveApi = new ProductiveApi(apiKey);
        var timeEntries = productiveApi.getTimeEntries(organisationId, projectId, startDate, endDate);

        if (!timeEntries || !Array.isArray(timeEntries)) {
            throw new Error('Invalid response from API: timeEntries is not an array');
        }

        // Get the requested fields
        var requestedFields = getFields().forIds(
            request.fields.map(function(field) {
              return field.name;
            })
        );

        // Format the data according to the requested fields
        var formattedData = timeEntries.map(function(timeEntry) {
            var row = [];
            
            // Map each requested field to its value
            request.fields.forEach(function(field) {
                try {
                    switch(field.name) {
                        case 'projectName':
                            row.push(timeEntry.projectName || '');
                            break;
                        case 'projectId':
                            row.push(timeEntry.projectId || '');
                            break;
                        case 'date':
                            row.push(timeEntry.date.replace(/-/g, '') || '');
                            break;
                        case 'description':
                            row.push(timeEntry.description || '');
                            break;
                        case 'time':
                            row.push(parseFloat(timeEntry.time) || 0);
                            break;
                        case 'billableTime':
                            row.push(parseFloat(timeEntry.billableTime) || 0);
                            break;
                        default:
                            row.push('');
                    }
                } catch (fieldError) {
                    console.error('Error processing field ' + field.name + ': ' + fieldError.message);
                    row.push('');
                }
            });
            
            return {'values': row};
        });

        let returnedData = {
            schema: requestedFields.build(),
            rows: formattedData
        };

        return returnedData;
    } catch (error) {
        console.error('Error in getData: ' + error.message);
        throw new Error('Data retrieval failed: ' + error.message);
    }
}

function isAdminUser() {
    // TODO: Remove when deploying for real.
    return true;
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