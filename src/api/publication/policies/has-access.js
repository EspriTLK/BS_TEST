module.exports = async (ctx, config, { strapi }) => {
	const PUB_API = 'api::publication.publication'

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
		const { id: author, role } = currentUser
		const { name: roleName } = role

		if (roleName === 'Editor') {
			queryParams.where = {
				$and: [
					{ id },
					{
						$or:
							[
								{ author },
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
								{ author },
								{ publishedAt: { $notNull: true } }
							]
					}
				]
			}
		}
	}

	const publication = await strapi.db.query(PUB_API).findOne(queryParams);
	if (publication) {
		// Go to next policy or will reach the controller's action.
		return true;
	}


	return false;
};