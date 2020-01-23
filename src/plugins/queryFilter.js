const { Filter, Filters } = require('../utils/Filter')
const Boom = require('@hapi/boom')
const Bounce = require('@hapi/bounce')
const debug = require('debug')('apphub:server:plugins:queryFilter')
const Joi = require('@hapi/joi')

const defaultOptions = {
    enabled: true,
    method: ['GET'],
    ignoreKeys: ['paging'],
}

const schemaCache = {}
const onPreHandler = function(request, h) {
    //  console.log(request.route)
    const routeOptions = request.route.settings.plugins.queryFilter || {}

    const options = {
        ...this.options,
        ...routeOptions,
        ignoreKeys: this.options.ignoreKeys.concat(
            routeOptions.ignoreKeys || []
        ),
    }
    if (!options.enabled) {
        return h.continue
    }

    const queryFilters = Object.keys(request.query).reduce((acc, curr) => {
        if (options.ignoreKeys.indexOf(curr) === -1) {
            acc[curr] = request.query[curr]
        }
        return acc
    }, {})
    try {
        const filters = Filters.createFromQueryFilters(
            queryFilters,
            routeOptions.validate
        )
        request.plugins.queryFilter = filters
    } catch (e) {
        Bounce.rethrow(e, 'system')
        throw Boom.boomify(e, { statusCode: 400 })
    }

    return h.continue
}

const filterPlugin = {
    name: 'FilterPlugin',
    register: async (server, options) => {
        const opts = {
            ...defaultOptions,
            ...options,
        }
        server.bind({
            options: opts,
        })

        server.ext('onPreHandler', onPreHandler)
    },
}

module.exports = filterPlugin
