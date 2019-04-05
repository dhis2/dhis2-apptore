

const Boom = require('boom')
const Joi = require('joi')

const { deleteDir } = require('@utils')
const defaultFailHandler = require('../../defaultFailHandler')

const { canDeleteApp } = require('@security')
const getAppsByUuidAsync = require('@data/getAppsByUuidAsync')
const deleteAppAsync = require('@data/deleteAppAsync')

module.exports = {
    //authenticated endpoint returning all apps no matter which status they have
    method: 'DELETE',
    path: '/v1/apps/{appUuid}',
    config: {
        auth: 'jwt',
        tags: ['api', 'v1'],
        response: {
            status: {
                200: Joi.any(),
                500: Joi.any()
            },
            failAction: defaultFailHandler
        }
    },
    handler: async (request, h) => {


        //request.logger.info('In handler %s', request.path)

        if ( !canDeleteApp(request, h) ) {
            throw Boom.unauthorized();
        }
        //todo: validate

        const knex = h.context.db;

        const appUuid = request.params.appUuid

        const appRows = await getAppsByUuidAsync(appUuid, 'en', knex)

        const item = appRows[0]
        //TODO: delete files. All versions?

        try {
            await deleteDir(`${item.uuid}`)
            const result = await deleteAppAsync(appUuid, knex)
            console.log(result)

            return { message: 'Successfully deleted app', httpStatus: 'OK', httpStatusCode: 200 }
        } catch ( err ) {
            return { message: 'An error occurred', httpStatus: 'Internal Server Error', httpStatusCode: 500 }
        }
    }
}
