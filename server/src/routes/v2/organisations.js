const Boom = require('@hapi/boom')
const Joi = require('../../utils/CustomJoi')
const {
    currentUserIsManager,
    getCurrentUserFromRequest,
} = require('../../security')
const getUserByEmail = require('../../data/getUserByEmail')
const { Organisation } = require('../../services')
const OrgModel = require('../../models/v2/Organisation')
const debug = require('debug')('apphub:server:routes:handlers:organisations')

module.exports = [
    {
        method: 'GET',
        path: '/v2/organisations',
        config: {
            tags: ['api', 'v2'],
            response: {
                schema: Joi.array()
                    .items(
                        OrgModel.externalDefintion.fork('users', s =>
                            s.forbidden()
                        )
                    )
                    .label('Organisations'),
            },
            validate: {
                query: Joi.object({
                    name: Joi.filter().description(
                        'The name of the organisation'
                    ),
                    owner: Joi.filter(Joi.string().guid())
                        .operator(Joi.valid('eq'))
                        .description(
                            'The uuid of the owner of the organisations'
                        ),
                    user: Joi.filter(Joi.string().guid())
                        .operator(Joi.valid('eq'))
                        .description(
                            'The uuid of the user to get organisations for'
                        ),
                }),
            },
            plugins: {
                queryFilter: {
                    enabled: true,
                    rename: OrgModel.dbDefinition,
                },
            },
        },
        handler: async (request, h) => {
            const { db } = h.context
            const filters = request.plugins.queryFilter

            const orgs = await Organisation.find({ filters }, db)
            return orgs
        },
    },
    {
        method: 'GET',
        path: '/v2/organisations/{orgId}',
        config: {
            auth: 'token',
            validate: {
                params: Joi.object({
                    orgId: OrgModel.definition.extract('id').required(),
                }),
            },
            tags: ['api', 'v2'],
            response: {
                schema: OrgModel.externalDefintion.label(
                    'OrganisationWithUsers'
                ),
            },
        },
        handler: async (request, h) => {
            const { db } = h.context
            const { orgId } = request.params
            const organisation = await Organisation.findOne(orgId, true, db)
            return organisation
        },
    },
    {
        method: 'POST',
        path: '/v2/organisations',
        config: {
            auth: 'token',
            validate: {
                payload: Joi.object({
                    name: OrgModel.definition.extract('name').required(),
                }),
            },
            tags: ['api', 'v2'],
            response: {
                schema: Joi.object({
                    id: Joi.string().uuid(),
                }),
            },
        },

        handler: async (request, h) => {
            const { db } = h.context

            const { id: userId } = await getCurrentUserFromRequest(request, db)
            //TODO: should everyone be able to create new organisations?

            const createOrgAndAddUser = async trx => {
                const organisation = await Organisation.create(
                    { userId, name: request.payload.name },
                    trx
                )
                await Organisation.addUserById(organisation.id, userId, trx)
                return organisation
            }

            const organisation = await db.transaction(createOrgAndAddUser)

            return h
                .response(organisation)
                .created(`/v2/organisations/${organisation.id}`)
        },
    },
    {
        method: 'PATCH',
        path: '/v2/organisations/{orgId}',
        config: {
            auth: 'token',
            tags: ['api', 'v2'],
            validate: {
                payload: Joi.object({
                    name: OrgModel.definition.extract('name'),
                    owner: OrgModel.definition.extract('owner'),
                }),
                params: Joi.object({
                    orgId: OrgModel.definition.extract('id').required(),
                }),
            },
            response: {
                schema: Joi.object({
                    id: Joi.string().uuid(),
                }),
            },
        },
        handler: async (request, h) => {
            const { db } = h.context
            const { id: userId } = await getCurrentUserFromRequest(request, db)
            const isManager = currentUserIsManager(request)

            const updateObj = request.payload

            const updateOrganisation = async trx => {
                const organisation = await Organisation.findOne(
                    request.params.orgId,
                    false,
                    trx
                )
                if (organisation.owner !== userId && !isManager) {
                    throw Boom.forbidden(
                        'You do not have permissions to update this organisation'
                    )
                }
                await Organisation.update(organisation.id, updateObj, db)
                return {
                    id: organisation.id,
                }
            }

            const transaction = await db.transaction(updateOrganisation)
            return h.response(transaction).code(200)
        },
    },
    {
        method: 'POST',
        path: '/v2/organisations/{orgId}/user',
        config: {
            auth: 'token',
            tags: ['api', 'v2'],
            validate: {
                payload: Joi.object({
                    email: Joi.string()
                        .email()
                        .required(),
                }),
                params: Joi.object({
                    orgId: OrgModel.definition.extract('id').required(),
                }),
            },
            // response: {
            //     status: {
            //         //TODO: add response statuses
            //     },
            // },
        },
        handler: async (request, h) => {
            const { db } = h.context
            const { id } = await getCurrentUserFromRequest(request, db)

            const addUserToOrganisation = async trx => {
                const org = await Organisation.findOne(
                    request.params.orgId,
                    true,
                    trx
                )

                const isManager = currentUserIsManager(request)
                const isMember = org.users.findIndex(u => u.id === id) > -1
                const canAdd = org.owner === id || isMember || isManager

                if (!canAdd) {
                    throw Boom.forbidden(
                        'You do not have permission to add users'
                    )
                }

                const userToAdd = await getUserByEmail(
                    request.payload.email,
                    trx
                )
                if (userToAdd && userToAdd.id) {
                    await Organisation.addUserById(org.id, userToAdd.id, trx)
                    return userToAdd
                } else {
                    throw Boom.conflict(`User with email not found.`)
                }
            }

            await db.transaction(addUserToOrganisation)

            return {
                statusCode: 200,
            }
        },
    },
    {
        method: 'DELETE',
        path: '/v2/organisations/{orgId}/user',
        config: {
            auth: 'token',
            tags: ['api', 'v2'],
            validate: {
                payload: Joi.object({
                    user: OrgModel.definition.extract('id').required(),
                }),
                params: Joi.object({
                    orgId: OrgModel.definition.extract('id').required(),
                }),
            },
            // response: {
            //     status: {
            //         //TODO: add response statuses
            //     },
            // },
        },
        handler: async (request, h) => {
            const { db } = h.context
            const { id } = await getCurrentUserFromRequest(request, db)

            const userIdToRemove = request.payload.user

            const removeUserFromOrganisation = async trx => {
                const org = await Organisation.findOne(
                    request.params.orgId,
                    true,
                    trx
                )

                const isManager = currentUserIsManager(request)
                const isMember = org.users.findIndex(u => u.id === id) > -1
                const canRemove = org.owner === id || isMember || isManager

                if (org.owner === userIdToRemove) {
                    throw Boom.conflict(
                        'Cannot remove the owner of the organisation'
                    )
                }
                if (!canRemove) {
                    throw Boom.forbidden(
                        'You do not have permission to remove users'
                    )
                }
                const deletedRes = await Organisation.removeUser(
                    org.id,
                    userIdToRemove,
                    trx
                )
                if (deletedRes < 1) {
                    throw Boom.conflict(
                        'User not found or not a member of organisation'
                    )
                }
            }

            await db.transaction(removeUserFromOrganisation)

            return {
                statusCode: 200,
            }
        },
    },
]
