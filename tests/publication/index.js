const request = require('supertest')

const mockEditorUser = {
	username: "test_jest_editor",
	email: "test_editor@test.com",
	password: "123456",
}

const mockAuthorUser = {
	username: "test_jest_author",
	email: "test@test.com",
	password: "123456",
}

const testUserRegister = {
	username: "test_jest_author_created",
	email: "test_jest@test.com",
	password: "123456",
}


it("create publication by Author - success", async () => {
	const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockAuthorUser.username } })

	const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
		id: user.id
	})

	await request(strapi.server.httpServer)
		.post("/api/publications")
		.set("accept", "application/json")
		.set("Content-Type", "application/json")
		.set("Authorization", `Bearer ${jwt}`)
		.send({
			data: {
				title: "test_author_pub",
				content: "Some test content"
			}
		})
		.expect(200)
		.then((data) => {
			// console.log(data.body);
			expect(data.body.data).toBeDefined()
			expect(data.body.data.attributes.publishedAt).toBeNull()
		})
})


it("should return publications list", async () => {
	const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockAuthorUser.username } })

	const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
		id: user.id
	})

	await request(strapi.server.httpServer)
		.get("/api/publications")
		.set("Authorization", `Bearer ${jwt}`)
		.expect(200)
		.then((data) => {
			console.log(data.body.data);
			expect(data.body.data).toBeInstanceOf(Array);
			expect(data.body.data).toMatchObject([{ attributes: { publishedAt: null } }]);
		})
})

it("create publication by public - error", () => {
	request(strapi.server.httpServer)
		.post("/api/publications")
		.expect(403)
})