class ProductiveApi {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        if (apiKey.length !== 32) {
            throw new Error('API key is invalid');
        }

        this.apiKey = apiKey;
    }

    getProjects() {
        var response = UrlFetchApp.fetch('https://api.productive.io/api/v2/projects', {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        let projects = JSON.parse(response.getContentText());

        return projects.map((project) => ({
            id: project.id,
            name: project.name
        }));
    }
}