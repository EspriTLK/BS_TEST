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
		const { query, state } = ctx
		const params = {
			...ctx,
			query: {
				...query,
				populate: { author: true }
			}
		}

		try {
			const { data } = await super.findOne(params)
			const { attributes } = data
			const { publishedAt, author } = attributes

			const currentUser = state.user
			const isPublished = publishedAt !== null
			const isAuthor = currentUser?.id === author.data.id
			const isEditor = currentUser?.role.name === 'Editor'

			if (!isPublished && (!currentUser || !isAuthor) && !isEditor) {
				ctx.forbidden('You are not allowed to view this publication')
			}

			return await super.findOne(ctx);
		} catch {

			return
		}

	},

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
		const { id } = ctx.params
		const { publishedAt, author } = await strapi.entityService.findOne(publicationApi, id, { populate: { author: true } })

		const currentUser = ctx.state.user
		const isAuthor = currentUser?.id === author.id
		const isEditor = currentUser?.role.name === 'Editor'

		if (!isAuthor && !isEditor) {
			ctx.throw(403, 'You are not allowed to edit this publication')
		}

		if (isAuthor && author.canPublish === false && ctx.request.body.data.publish) {
			ctx.throw(403, 'You are not allowed to published')
		}

		if (ctx.request.body.data.publish && publishedAt === null) {
			ctx.request.body = {
				data: {
					...ctx.request.body.data,
					publishedAt: new Date()
				}
			}
		}

		return await super.update(ctx);
	},

	async delete(ctx) {
		// some logic here
		const { id } = ctx.params
		const { author } = await strapi.entityService.findOne(publicationApi, id, { populate: { author: true } })

		const currentUser = ctx.state.user
		const isAuthor = currentUser?.id === author.id
		const isEditor = currentUser?.role.name === 'Editor'

		if (!isAuthor && !isEditor) {
			ctx.throw(403, 'You are not allowed to remove this publication')
		}

		return await super.delete(ctx);
	}
})
);
