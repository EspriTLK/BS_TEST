'use strict';

/**
 * publication controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const publicationApi = 'api::publication.publication'

module.exports = createCoreController(publicationApi, ({ strapi }) => ({
	async find(ctx) {

		const { query, state } = ctx
		const currentUser = state.user
		const isPublicationState = query.publicationState === 'live' ? 'live' : 'preview'

		if (currentUser && currentUser.role.name === 'Editor') {
			ctx.query = {
				...query,
				publicationState: isPublicationState
			}
		}

		if (currentUser && currentUser.role.name === 'Author') {
			ctx.query = {
				...query,
				publicationState: isPublicationState,
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

	async findOne(ctx) {
		// some logic here
		const { params, state } = ctx
		const { id } = params
		const currentUser = state.user
		const queryParams = {
			where: {
				$and: [
					{ id },
					{ publishedAt: { $notNull: true } }
				]
			}
		}

		if (currentUser) {
			const { id: authorId, role } = currentUser
			const { name: roleName } = role
			if (roleName === 'Editor') {
				queryParams.where = {
					$and: [
						{ id },
						{
							$or:
								[
									{ author: authorId },
									{ author: { role: { name: 'Author' } } }
								]
						}
					]
				}
			}

			if (roleName === 'Author') {
				queryParams.where = {
					$and: [
						{ id },
						{
							$or:
								[
									{ author: authorId },
									{ publishedAt: { $notNull: true } }
								]
						}
					]
				}
			}


		}

		const publication = await strapi.db.query(publicationApi).findOne(queryParams);
		const sanitizedResults = await this.sanitizeOutput(publication, ctx);
		// console.log(publication);
		return this.transformResponse(sanitizedResults);
		// if (publication) {
		// 	return await super.findOne(ctx);
		// }

		// return ctx.forbidden('oops')


	},

	// async findOne(ctx) {
	// 	// some logic here
	// 	const { params, state } = ctx
	// 	const { id } = params
	// 	const currentUser = state.user
	// 	params.query = {
	// 		publishedAt: { $notNull: true }
	// 	}


	// 	const response = await super.findOne(ctx);

	// 	const { data } = response
	// 	if (currentUser) {

	// 	}
	// 	// some more logic
	// 	// response.data.attributes.author = undefined
	// 	console.log(params)
	// 	return response;
	// },

	async create(ctx) {
		// some logic here
		const currentUser = ctx.state.user.id
		const newPublication = await ctx.request.body.data

		ctx.request.body = {
			data: {
				...newPublication,
				author: currentUser,
				publishedAt: null
			}
		}

		const response = await super.create(ctx);
		// some more logic

		return response;
	},

	async update(ctx) {
		// some logic here
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
			data: {
				...sanitizedInput
			}
		}

		if (currentUser) {
			const { id: authorId, role } = currentUser
			if (role.name === 'Author') {
				queryParams.where.$and.push({ author: authorId })

				if (body.data.publish) {
					queryParams.where.$and.push(
						{ author: { canPublish: true } },
						{ publishedAt: { $null: true } }
					)
				}
			}

			const publication = await strapi.db.query(publicationApi).update(queryParams)
			console.log(publication);

			if (publication) {
				const sanitizePublication = await this.sanitizeOutput(publication, ctx)
				// if (body.data.publish) {
				// 	body.data = {
				// 		...ctx.request.body.data,
				// 		publishedAt: new Date()
				// 	}

				// }
				// return await super.update(ctx);
				return this.transformResponse(sanitizePublication)
			}

			return ctx.badRequest('publication not found or you can`t update it')

		}
	},

	async delete(ctx) {
		// some logic here
		const { params, state } = ctx
		const { id } = params
		const currentUser = state.user
		const { id: authorId, role } = currentUser
		const queryParams = {
			where: {
				$and: [
					{ id },

				]
			}
		}

		if (role.name === 'Author') {
			queryParams.where.$and.push({ author: authorId })
		}

		const publication = await strapi.db.query(publicationApi).delete(queryParams)

		if (publication) {
			// return await super.delete(ctx);
			return ctx.send({
				message: 'The publication was removed!'
			}, 204)
		}

		return ctx.forbidden('publication not found or you can`t delete it')
	}
})
);
