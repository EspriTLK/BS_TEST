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
		// const qp = await this.sanitizeParams(ctx);
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
			const { id } = currentUser
			queryParams.where = {

				$and: [
					{ id },
					{
						$or:
							[
								{ author: currentUser },
								{ author: { role: { name: 'Author' } } }
							]
					}
				]
			}
		}


		const publication = await strapi.db.query(publicationApi).findOne(queryParams);
		const sanitizedResults = await this.sanitizeOutput(publication, ctx);
		console.log(publication);
		// console.log(ctx.state.user.role.id);

		return this.transformResponse(sanitizedResults);


		// const { id } = ctx.params

		// const { publishedAt, author } = await strapi.entityService.findOne(publicationApi, id, { populate: { author: true } })

		// const currentUser = ctx.state.user
		// const isPublished = publishedAt !== null
		// const isAuthor = currentUser?.id === author.id
		// const isEditor = currentUser?.role.name === 'Editor'

		// if (!isPublished && (!currentUser || !isAuthor) && !isEditor) {
		// 	ctx.throw(403, 'You are not allowed to edit this publication')
		// }

		// return await super.findOne(ctx);
	},

	// async findOne(ctx) {
	// 	// some logic here
	// 	if (!ctx?.params) {
	// 		return
	// 	}

	// 	const { id } = ctx.params

	// 	const { publishedAt, author } = await strapi.entityService.findOne(publicationApi, id, { populate: { author: true } })

	// 	const currentUser = ctx.state.user
	// 	const isPublished = publishedAt !== null
	// 	const isAuthor = currentUser?.id === author.id
	// 	const isEditor = currentUser?.role.name === 'Editor'

	// 	if (!isPublished && (!currentUser || !isAuthor) && !isEditor) {
	// 		ctx.throw(403, 'You are not allowed to edit this publication')
	// 	}

	// 	return await super.findOne(ctx);
	// },

	// async findOne(ctx) {
	// 	// some logic here
	// 	const currentUser = ctx.state.user

	// 	ctx.query = {
	// 		...ctx.query,
	// 		populate: { author: true }
	// 	}


	// 	let resp = await super.findOne(ctx)
	// 	resp.data.attributes.author = undefined

	// 	return resp

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
