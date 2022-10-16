const siteRoute = require('./site.route');
const apiRoute = require('./api.route')

function route(app) {
    app.use('/api', apiRoute)
    app.use('/', siteRoute);
}

module.exports = route;