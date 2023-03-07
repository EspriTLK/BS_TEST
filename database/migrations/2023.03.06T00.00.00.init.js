'use strict'

async function up(knex) {
	knex.schema.createTable('up_roles', function (table) {
		table.increments()
		table.string('name')
		table.string('description')
		table.string('type')
		table.timestamps('created_at')
		table.timestamps('updated_at')
		table.integer('created_by_id')
		table.integer('updated_by_id')
	})
	knex.schema.createTable('up_permissions', function (table) {
		table.increments()
		table.string('action')
		table.timestamps('created_at')
		table.timestamps('updated_at')
		table.integer('created_by_id')
		table.integer('updated_by_id')
	})
	knex.schema.createTable('up_permissions_role_links', function (table) {
		table.increments()
		table.integer('permission_id')
		table.integer('role_id')
		table.float('permission_order')
	})
	await knex.from('up_roles').insert([
		{ name: 'Editor', description: 'Editor role', type: 'editor', created_at: new Date(), updated_at: new Date() },
		{ name: 'Author', description: 'Author role', type: 'author', created_at: new Date(), updated_at: new Date() }
	])

	const authorRole = await knex.from('up_roles').where('name', 'Author');
	const editorRole = await knex.from('up_roles').where('name', 'Editor');
	const publicRole = await knex.from('up_roles').where('name', 'Public');
	const roles = [...authorRole, ...editorRole, ...publicRole];

	await knex('up_permissions')
		.whereExists(
			knex
				.from('up_permissions_role_links')
				.where('role_id', publicRole[0].id)
				.whereNot('action', 'plugin::users-permissions.auth.callback')
				.whereRaw('up_permissions.id = up_permissions_role_links.permission_id')
		)
		.del()

	const PUBLIC_ROLE_PERMISSIONS = [
		{ action: 'api::publication.publication.find', created_at: new Date(), updated_at: new Date() },
		{ action: 'api::publication.publication.findOne', created_at: new Date(), updated_at: new Date() },
	]

	const AUTHOR_ROLE_PERMISSIONS = [
		...PUBLIC_ROLE_PERMISSIONS,
		{ action: 'api::publication.publication.create', created_at: new Date(), updated_at: new Date() },
		{ action: 'api::publication.publication.update', created_at: new Date(), updated_at: new Date() },
		{ action: 'api::publication.publication.delete', created_at: new Date(), updated_at: new Date() },
		{ action: 'plugin::users-permissions.auth.changePassword', created_at: new Date(), updated_at: new Date() },
		{ action: 'plugin::users-permissions.users.find', created_at: new Date(), updated_at: new Date() },
		{ action: 'plugin::users-permissions.users.findOne', created_at: new Date(), updated_at: new Date() },
	]

	const EDITOR_ROLE_PERMISSIONS = [
		...AUTHOR_ROLE_PERMISSIONS,
		{ action: 'plugin::users-permissions.auth.register', created_at: new Date(), updated_at: new Date() },
		{ action: 'plugin::users-permissions.users.update', created_at: new Date(), updated_at: new Date() },
	]

	for (let role of roles) {
		let permissions = PUBLIC_ROLE_PERMISSIONS
		if (role.name === "Author") {
			permissions = AUTHOR_ROLE_PERMISSIONS
		}
		if (role.name === "Editor") {
			permissions = EDITOR_ROLE_PERMISSIONS
		}
		for (let permission of permissions) {
			await knex.from('up_permissions')
				.insert(permission)
				.then(async (id) => {
					await knex.from('up_permissions_role_links').insert({ permission_id: +id, role_id: role.id });
				})
		}
	}
}

module.exports = { up };