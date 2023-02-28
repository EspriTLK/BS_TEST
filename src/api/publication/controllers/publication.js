'use strict';

/**
 * publication controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const publicationApi = 'api::publication.publication'

module.exports = createCoreController(publicationApi, ({ strapi }) => ({
	async find(ctx) {
		// some logic here
		const currentUser = ctx.state.user

		// some more logic
		if (currentUser && currentUser.role.name === 'Editor') {
			// const data = await strapi.entityService.findMany(publicationApi, {
			// 	publicationState: "preview",
			// })
			const { data, meta } = await super.find({ ctx, publicationState: "preview" })


			return { data, meta }
		}

		let { data, meta } = await super.find(ctx);

		if (currentUser && currentUser.role.name === 'Author') {
			const authorDraft = await strapi.entityService.findMany(publicationApi, {
				publicationState: "preview",
				filters: { author: currentUser.id, publishedAt: null }
			})

			data = [...data, ...authorDraft]
		}

		return { data, meta };



	},

	async findOne(ctx) {
		// some logic here
		if (!ctx?.params) {
			return
		}

		const { id } = ctx.params

		const { publishedAt, author } = await strapi.entityService.findOne(publicationApi, id, { populate: { author: true } })

		const currentUser = ctx.state.user
		const isPublished = publishedAt !== null
		const isAuthor = currentUser?.id === author.id
		const isEditor = currentUser?.role.name === 'Editor'

		if (!isPublished && (!currentUser || !isAuthor) && !isEditor) {
			ctx.throw(403, 'You are not allowed to edit this publication')
		}

		return await super.findOne(ctx);
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
