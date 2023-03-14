const request = require('supertest')

const mockEditorUser = {
	username: "test_jest_editor",
	email: "test_editor@test.com",
	provider: 'local',
	password: "123456",
	canPublish: true,
	confirmed: true,
	role: {
		id: 4
	}
}

const mockUserData = {
	username: "test_jest_author",
	email: "test@test.com",
	provider: 'local',
	password: "123456",
	canPublish: false,
	confirmed: true,
	role: {
		id: 3
	}
}

const testUserRegister = {
	username: "test_jest_author_created",
	email: "test_jest@test.com",
	password: "123456",
}

it("login user - success", async () => {
	await strapi.plugins["users-permissions"].services.user.add({
		...mockUserData,
	})

	await request(strapi.server.httpServer)
		.post("/api/auth/local")
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.send({
			identifier: mockUserData.username,
			password: mockUserData.password
		})
		.expect("Content-Type", /json/)
		.expect(200)
		.then((data) => {
			expect(data.body.jwt).toBeDefined()
		})
})


it("login user - error", async () => {
	const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockUserData.username } })

	await request(strapi.server.httpServer)
		.post("/api/auth/local")
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.send({
			identifier: user.username,
			password: '12211221'
		})
		.expect("Content-Type", /json/)
		.expect(400)
		.then((data) => {
			expect(data.body.error.message).toBe("Invalid identifier or password")
		})
})

it('Register user by Editor - success', async () => {
	const user = await strapi.plugins["users-permissions"].services.user.add({
		...mockEditorUser,
	})

	const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
		id: user.id
	})

	await request(strapi.server.httpServer)
		.post("/api/auth/local/register")
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.set("Authorization", `Bearer ${jwt}`)
		.send({
			username: testUserRegister.username,
			password: testUserRegister.password,
			email: testUserRegister.email
		})
		.expect(200)
		.then((data) => {
			expect(data.body.user).toBeDefined()
			expect(data.body.user.username).toBe(testUserRegister.username)
		})
})


it('Register user by Editor without required field  - error', async () => {
	const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockEditorUser.username } })

	const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
		id: user.id
	})

	await request(strapi.server.httpServer)
		.post("/api/auth/local/register")
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.set("Authorization", `Bearer ${jwt}`)
		.send({
			username: testUserRegister.username,
			email: testUserRegister.email
		})
		.expect(400)
		.then((data) => {
			expect(data.body.error).toBeDefined()
			expect(data.body.error.name).toBe('ValidationError')
		})
})

it('Register user by Author - error', async () => {
	const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockUserData.username } })

	const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
		id: user.id
	})

	await request(strapi.server.httpServer)
		.post("/api/auth/local/register")
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.set("Authorization", `Bearer ${jwt}`)
		.send({
			username: testUserRegister.username,
			password: testUserRegister.password,
			email: testUserRegister.email
		})
		.expect(403)
})

it('Edit user by Author - error', async () => {
	const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockUserData.username } })

	const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
		id: user.id
	})

	await request(strapi.server.httpServer)
		.put(`/api/users/${user.id}`)
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.set("Authorization", `Bearer ${jwt}`)
		.send({
			publish: true
		})
		.expect(403)
})

it('Author change password - success', async () => {
	const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockUserData.username } })

	const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
		id: user.id
	})

	await request(strapi.server.httpServer)
		.post("/api/auth/change-password")
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.set("Authorization", `Bearer ${jwt}`)
		.send({
			currentPassword: testUserRegister.password,
			password: "654321",
			passwordConfirmation: "654321"
		})
		.expect(200)
		.then((data) => {
			expect(data.body.jwt).toBeDefined()
			expect(data.body.user).toBeDefined()
			expect(data.body.user.id).toBe(user.id)
		})
})

it('Author change password with incorrect data - error', async () => {
	const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockUserData.username } })

	const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
		id: user.id
	})

	await request(strapi.server.httpServer)
		.post("/api/auth/change-password")
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.set("Authorization", `Bearer ${jwt}`)
		.send({
			currentPassword: "1",
			password: "654321",
			passwordConfirmation: "654321"
		})
		.expect(400)
		.then((data) => {
			expect(data.body.error).toBeDefined()
			expect(data.body.error.name).toBe("ValidationError")
		})
})

it('Edit user by Editor - success', async () => {
	const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockEditorUser.username } })
	const userToEdit = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockUserData.username } })

	const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
		id: user.id
	})

	await request(strapi.server.httpServer)
		.put(`/api/users/${userToEdit.id}`)
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.set("Authorization", `Bearer ${jwt}`)
		.send({
			canPublish: true
		})
		.expect(200)
		.then((data) => {
			expect(data.body.id).toBe(userToEdit.id)
			expect(data.body.canPublish).toBeTruthy()
		})
})

it('Register by Public role - error', async () => {
	const response = await request(strapi.server.httpServer)
	response
		.post("/api/auth/local/register")
		.expect(403)
})