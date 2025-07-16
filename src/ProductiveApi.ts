// Productive API
// https://productive.io/docs/api/v2/projects
// https://productive.io/docs/api/v2/time_entries
class ProductiveApi {
    private apiKey: string;

    /**
     * @constructor
     * @param {string} apiKey 
     */
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        this.apiKey = apiKey;
    }

    /**
     * Validate the API key
     * @returns {boolean}
     */
    validateKey() {
        if (this.apiKey.length !== 36) {
            throw new Error('API key is invalid');
        }

        return true;
    }

    /**
     * Get all projects
     * @param {string} organisationId 
     * @returns {Array}
     */
    getProjects(organisationId) {
        try {
            let projects = [];
            let nextUrl = 'https://api.productive.io/api/v2/projects';

            while (nextUrl) {
                try {
                    var response = UrlFetchApp.fetch(nextUrl, {
                        headers: {
                            'X-Auth-Token': `${this.apiKey}`,
                            'X-Organization-Id': `${organisationId}`,
                            'Content-Type': 'application/vnd.api+json; ext=bulk'
                        },
                        muteHttpExceptions: true
                    });

                    if (response.getResponseCode() !== 200) {
                        throw new Error('API request failed with status: ' + response.getResponseCode() + ' - ' + response.getContentText());
                    }

                    let responseData = JSON.parse(response.getContentText());
                    
                    if (!responseData.data || !Array.isArray(responseData.data)) {
                        throw new Error('Invalid API response format: missing or invalid data array');
                    }
                    
                    let currentProjects = responseData.data.map((project) => ({
                        id: project.id,
                        name: project.attributes.name
                    }));

                    projects = projects.concat(currentProjects);

                    nextUrl = responseData.links && responseData.links.next ? responseData.links.next : null;
                } catch (fetchError) {
                    console.error('Error fetching projects: ' + fetchError.message);
                    throw new Error('Failed to fetch projects: ' + fetchError.message);
                }
            }

            return projects;
        } catch (error) {
            console.error('Error in getProjects: ' + error.message);
            throw error;
        }
    }

    /**
     * 
     * @param {number} organisationId 
     * @param {number} projectId 
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Array}
     */
    getTimeEntries(organisationId, projectId, startDate, endDate) {
        try {
            let timeEntries = [];
            let nextUrl = `https://api.productive.io/api/v2/time_entries?include=service&filter[$op]=and&filter[0][project_id]=${projectId}&filter[1][date][gt_eq]=${startDate}&filter[2][date][lt_eq]=${endDate}`;

            // Get project name for the given projectId
            let projectName = this.getProjectName(organisationId, projectId);

            while (nextUrl) {
                try {
                    var response = UrlFetchApp.fetch(nextUrl, {
                        headers: {
                            'X-Auth-Token': `${this.apiKey}`,
                            'X-Organization-Id': `${organisationId}`,
                            'Content-Type': 'application/vnd.api+json; ext=bulk'
                        },
                        muteHttpExceptions: true
                    });

                    if (response.getResponseCode() !== 200) {
                        throw new Error('API request failed with status: ' + response.getResponseCode() + ' - ' + response.getContentText());
                    }

                    let responseData = JSON.parse(response.getContentText());

                    if (!responseData.data || !Array.isArray(responseData.data)) {
                        throw new Error('Invalid API response format: missing or invalid data array');
                    }

                    let currentTimeEntries = responseData.data.map(
                        (timeEntry) => {
                            let service = this.getServiceById(organisationId, timeEntry.relationships.service.data.id);
                        
                            return {
                                id: timeEntry.id,
                                projectId: projectId,
                                projectName: projectName,
                                date: timeEntry.attributes.date,
                                time: timeEntry.attributes.time,
                                billableTime: timeEntry.attributes.billable_time,
                                description: timeEntry.attributes.description,
                                serviceId: service.id,
                                serviceName: service.name,
                                serviceEstimated: service.estimatedTime,
                                serviceBillableTime: service.billableTime,
                                serviceBudgetedTime: service.budgetedTime,
                                serviceWorkedTime: service.workedTime
                            }
                        }
                    );

                    timeEntries = timeEntries.concat(currentTimeEntries);

                    nextUrl = responseData.links && responseData.links.next ? responseData.links.next : null;
                } catch (fetchError) {
                    console.error('Error fetching time entries: ' + fetchError.message);
                    throw new Error('Failed to fetch time entries: ' + fetchError.message);
                }
            }

            return timeEntries;
        } catch (error) {
            console.error('Error in getTimeEntries: ' + error.message);
            throw error;
        }
    }

    /**
     * Get the name of a project
     * @param {number} organisationId 
     * @param {number} projectId 
     * @returns {string}
     */
    getProjectName(organisationId, projectId) {
        try {
            let nextUrl = 'https://api.productive.io/api/v2/projects';

            while (nextUrl) {
                try {
                    var response = UrlFetchApp.fetch(nextUrl, {
                        headers: {
                            'X-Auth-Token': `${this.apiKey}`,
                            'X-Organization-Id': `${organisationId}`,
                            'Content-Type': 'application/vnd.api+json; ext=bulk'
                        },
                        muteHttpExceptions: true
                    });

                    if (response.getResponseCode() !== 200) {
                        throw new Error('API request failed with status: ' + response.getResponseCode() + ' - ' + response.getContentText());
                    }

                    let responseData = JSON.parse(response.getContentText());
                    
                    if (!responseData.data || !Array.isArray(responseData.data)) {
                        throw new Error('Invalid API response format: missing or invalid data array');
                    }
                    
                    // Find the project with matching ID
                    let project = responseData.data.find(p => p.id === projectId);
                    if (project) {
                        return project.attributes.name;
                    }

                    nextUrl = responseData.links && responseData.links.next ? responseData.links.next : null;
                } catch (fetchError) {
                    console.error('Error fetching project name: ' + fetchError.message);
                    throw new Error('Failed to fetch project name: ' + fetchError.message);
                }
            }

            return 'Unknown Project';
        } catch (error) {
            console.error('Error in getProjectName: ' + error.message);
            return 'Unknown Project';
        }
    }

    /**
     * Get the name of a service
     * @param {number} organisationId 
     * @param {number} serviceId 
     * @returns {string}
     */
    getServiceById(organisationId, serviceId) {
        let nextUrl = `https://api.productive.io/api/v2/services/${serviceId}`;

        var response = UrlFetchApp.fetch(nextUrl, {
            headers: {
                'X-Auth-Token': `${this.apiKey}`,
                'X-Organization-Id': `${organisationId}`,
                'Content-Type': 'application/vnd.api+json; ext=bulk'
            },
            muteHttpExceptions: true
        });

        if (response.getResponseCode() !== 200) {
            throw new Error('API request failed with status: ' + response.getResponseCode() + ' - ' + response.getContentText());
        }

        let responseData = JSON.parse(response.getContentText());

        if (!responseData.data) {
            throw new Error('Invalid API response format: missing or invalid data array');
        }

        return {
            id: responseData.data.id,
            name: responseData.data.attributes.name,
            estimatedTime: responseData.data.attributes.estimated_time,
            billableTime: responseData.data.attributes.billable_time,
            budgetedTime: responseData.data.attributes.budgeted_time,
            workedTime: responseData.data.attributes.worked_time
        };
    }
}