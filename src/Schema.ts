// Schema.js
// https://developers.google.com/looker-studio/connector/build#define_the_fields_with_getschema
var cc = DataStudioApp.createCommunityConnector();

/**
 * Get the fields
 * @returns {GoogleAppsScript.Data_Studio.Fields}
 */
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

    fields.newDimension()
        .setId('serviceId')
        .setName('Service ID')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('serviceName')
        .setName('Service')
        .setType(types.TEXT);

    fields.newMetric()
        .setId('serviceWorkedTime')
        .setName('Service Worked Time')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);

    fields.newMetric()
        .setId('serviceBudgetedTime')
        .setName('Service Budgeted Time')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);

    fields.newMetric()
        .setId('serviceBillableTime')
        .setName('Service Billable Time')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);

    fields.newMetric()
        .setId('serviceEstimatedTime')
        .setName('Service Estimated Time')
        .setType(types.NUMBER)
        .setAggregation(aggregations.SUM);

    return fields;
}

function getSchema(request: GoogleAppsScript.Data_Studio.Request<any>): GoogleAppsScript.Data_Studio.GetSchemaResponse {
    return cc.newGetSchemaResponse().setFields(getFields()).build();
}