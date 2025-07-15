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