'use strict';

/**
 * publication controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::publication.publication', ({ strapi }) => ({
	async find(ctx) {
		// some logic here
		const currentUser = ctx.state.user

		const { data, meta } = await super.find(ctx);
		// some more logic
		if (!currentUser) {
			return { data, meta };
		}

		if (currentUser.role.name === 'Edithor') {
			const publications = await strapi.entityService.findMany('api::publication.publication', {
				publicationState: "preview",
			})

			return { publications, meta }
		}

		const authorDraft = await strapi.entityService.findMany('api::publication.publication', {
			publicationState: "preview",
			filters: { author: currentUser.id, publishedAt: null }
		})

		const authorPub = [...data, ...authorDraft]

		return { authorPub, meta }

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
		const author = await strapi.entityService.findOne('api::publication.publication', id, { populate: { author: true } })

		if (ctx.state.user.id !== author.author.id && ctx.state.user.role.name !== 'Edithor') {
			ctx.throw(403, 'You are not allowed to edit this publication')
		}

		if (author.author.IsPublished === false && 'publishedAt' in ctx.request.body.data) {
			ctx.throw(403, 'You are not allowed to published')
		}

		if ('publishedAt' in ctx.request.body.data && author.publishedAt === null) {
			ctx.request.body = {
				data: {
					...ctx.request.body.data,
					publishedAt: new Date()
				}
			}
		}

		const response = await super.update(ctx);
		// some more logic

		return response;
	}
})
);
