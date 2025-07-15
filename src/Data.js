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