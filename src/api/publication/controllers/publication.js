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
	// 	ctx.query = {
	// 		...ctx.query,
	// 		where: { author: ctx.state.user.id }
	// 	}

	// 	const response = await super.findOne(ctx);

	// 	const { data } = response
	// 	if (currentUser) {

	// 	}
	// 	// some more logic
	// 	response.data.attributes.author = undefined

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
		const queryParams = {
			where: {
				$and: [
					{ id },

				]
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

			const publication = await strapi.db.query(publicationApi).findOne(queryParams)
			console.log(publication);

			if (publication) {

				if (body.data.publish) {
					body.data = {
						...ctx.request.body.data,
						publishedAt: new Date()
					}

				}
				return await super.update(ctx);
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

		const publication = await strapi.db.query(publicationApi).findOne(queryParams)

		if (publication) {
			return await super.delete(ctx);
		}

		return ctx.forbidden('publication not found or you can`t delete it')
	}
})
);
