let route = App.Router;
let fs = require( 'fs');

module.exports = (project) => {
    let projectPath = `./api/${project}/`;
    let routes = [];
    
    try {
        routes = require(projectPath + 'configRoutes');
    } catch (err) {
        routes = [];
    }
    if (!routes.length) return console.log(routes + 'undefined project');

    routes.forEach((item) => {
        let methods = item.method || ["get", "post", 'options', 'put', 'patch', 'delete'],
            pathStr = projectPath + 'controller/' + (item.controller || item.api),
            api = '/' + project + '/' + item.api;

        methods = (typeof methods === "string") ? [methods] : methods;
        methods.forEach((method) => {
            route[method](api, (req, res) => {
                let data;
                let query = req.method === 'GET' ? req.params : req.rawBody;

                if (req.method === 'OPTIONS') {
                    return Tools.json(res, {}, '', {
                        cookies: {
                            cors: req.headers.origin
                        }
                    });
                }
                
                try {
                    data = require(pathStr)(query || {});
                    if (Object.keys(query).length) {
                        Object.assign(data, {
                            params: query
                        });
                    }
                } catch (err) {
                    data = {code: -1, msg: err};
                }
                setTimeout(() => {
                    Tools.json(res, data);
                }, 0);
            });
        });
    });
};