'use strict';

/**
 * publication controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const PUB_API = 'api::publication.publication'

const publicationController = ({ strapi }) => ({
	async find(ctx) {
		const { query, state } = ctx
		const currentUser = state.user
		const publicationState = query.publicationState === 'live' ? 'live' : 'preview'
		ctx.query = {
			...query,
			publicationState: 'live'
		}

		if (currentUser && currentUser.role.name === 'Editor') {
			ctx.query = {
				...query,
				publicationState
			}
		}

		if (currentUser && currentUser.role.name === 'Author') {
			ctx.query = {
				...query,
				publicationState,
				filters: {
					...query.filters,
					$or: [
						{ author: currentUser.id, publishedAt: { $null: true } },
						{ publishedAt: { $notNull: true } }
					]
				}
			}
		}

		const { data, meta } = await super.find(ctx);

		return { data, meta };
	},

	// async findOne(ctx) {
	// 	const { params, state } = ctx
	// 	const { id } = params
	// 	const currentUser = state.user

	// 	const queryParams = {
	// 		where: {
	// 			$and: [
	// 				{ id },
	// 				{ publishedAt: { $notNull: true } }
	// 			]
	// 		}
	// 	}

	// 	if (currentUser) {
	// 		const { id: author, role } = currentUser
	// 		const { name: roleName } = role

	// 		if (roleName === 'Editor') {
	// 			queryParams.where = {
	// 				$and: [
	// 					{ id },
	// 					{
	// 						$or:
	// 							[
	// 								{ author },
	// 								{ author: { role: { name: 'Author' } } }
	// 							]
	// 					}
	// 				]
	// 			}
	// 		}

	// 		if (roleName === 'Author') {
	// 			queryParams.where = {
	// 				$and: [
	// 					{ id },
	// 					{
	// 						$or:
	// 							[
	// 								{ author },
	// 								{ publishedAt: { $notNull: true } }
	// 							]
	// 					}
	// 				]
	// 			}
	// 		}
	// 	}

	// 	const publication = await strapi.db.query(PUB_API).findOne(queryParams);

	// 	if (!publication) {
	// 		ctx.notFound('publication not found')
	// 	}
	// 	return await super.findOne(ctx)
	// const sanitizedResults = await this.sanitizeOutput(publication, ctx);

	// return this.transformResponse(sanitizedResults);
	// },

	async create(ctx) {
		const author = ctx.state.user.id
		const newPublication = await ctx.request.body.data

		ctx.request.body = {
			data: {
				...newPublication,
				author,
				publishedAt: null
			}
		}

		const response = await super.create(ctx);

		return response;
	},

	async update(ctx) {
		const { params, state, request } = ctx
		const { body } = request
		const { id } = params

		const currentUser = state.user

		const sanitizedInput = await this.sanitizeInput(body.data, ctx)

		const queryParams = {
			where: {
				$and: [
					{ id },
				]
			},
			data: { ...sanitizedInput }
		}

		if (!currentUser) {
			return
		}

		const { id: author, role } = currentUser

		if (role.name === 'Author') {
			queryParams.where.$and.push({ author })

			if (body.data.publish) {
				queryParams.where.$and.push(
					{ author: { canPublish: true } },
					{ publishedAt: { $null: true } }
				)
				queryParams.data.publishedAt = Date.now()
			}
		}

		if (role.name === 'Editor' && body.data.publish) {
			queryParams.data.publishedAt = Date.now()
		}

		const publication = await strapi.db.query(PUB_API).update(queryParams)

		if (!publication) {
			return ctx.badRequest('publication not found or you can`t update it')
		}

		const sanitizePublication = await this.sanitizeOutput(publication, ctx)

		return this.transformResponse(sanitizePublication)
	},

	async delete(ctx) {
		const { params, state } = ctx
		const { id } = params

		const currentUser = state.user
		const { id: author, role } = currentUser

		const queryParams = {
			where: {
				$and: [
					{ id },
				]
			}
		}

		if (role.name === 'Author') {
			queryParams.where.$and.push({ author })
		}

		const publication = await strapi.db.query(PUB_API).delete(queryParams)

		if (!publication) {
			return ctx.badRequest('publication not found or you can`t delete it')
		}

		return ctx.send({
			message: 'The publication was removed!'
		}, 204)
	}
})

module.exports = createCoreController(PUB_API, publicationController);