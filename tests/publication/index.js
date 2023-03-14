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

const mockSecondAuthor = {
	username: "test_jest_author_created",
	email: "test_jest@test.com",
	password: "123456",
}

let AUTHOR_PUB_ID
let AUTHOR2_PUB_ID
let EDITOR_PUB_ID

describe('POST', () => {
	it('create publication by author can publish - success', async () => {
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
				AUTHOR_PUB_ID = data.body.data.id
			})
	})

	it("create publication by Author can't publish - success", async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockSecondAuthor.username } })

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
					title: "test_second_author_pub",
					content: "Some test content"
				}
			})
			.expect(200)
			.then((data) => {
				// console.log(data.body);
				expect(data.body.data).toBeDefined()
				expect(data.body.data.attributes.publishedAt).toBeNull()
				AUTHOR2_PUB_ID = data.body.data.id
			})
	})

	it("create publication by Editor - success", async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockEditorUser.username } })

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
					title: "test_editor_pub",
					content: "Some test content"
				}
			})
			.expect(200)
			.then((data) => {
				// console.log(data.body);
				expect(data.body.data).toBeDefined()
				expect(data.body.data.attributes.publishedAt).toBeNull()
				EDITOR_PUB_ID = data.body.data.id
			})
	})

	it("create publication by public - error", async () => {
		const response = await request(strapi.server.httpServer)

		response
			.post("/api/publications")
			.set("accept", "application/json")
			.set("Content-Type", "application/json")
			// .set("Authorization", `Bearer ${jwt}`)
			.send({
				data: {
					title: "test_author_pub",
					content: "Some test content"
				}
			})
			.expect(403)
	})


})

describe('PUT', () => {
	it('should update publication by author - success', async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockAuthorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.put(`/api/publications/${AUTHOR_PUB_ID}`)
			.set("accept", "application/json")
			.set("Content-Type", "application/json")
			.set("Authorization", `Bearer ${jwt}`)
			.send({
				data: {
					title: "changed_title_author_pub",
					publish: true
				}
			})
			.expect(200)
			.then((data) => {
				// console.log(data.body);
				expect(data.body.data).toBeDefined()
				expect(data.body.data.id).toBe(AUTHOR_PUB_ID)
				expect(data.body.data.attributes.title).toBe("changed_title_author_pub")
				expect(data.body.data.attributes.publishedAt).not.toBeNull()
			})
	})

	it('should not update publication by other author - error', async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockAuthorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.put(`/api/publications/${AUTHOR2_PUB_ID}`)
			.set("accept", "application/json")
			.set("Content-Type", "application/json")
			.set("Authorization", `Bearer ${jwt}`)
			.send({
				data: {
					title: "changed_title_author_pub",
					publish: true
				}
			})
			.expect(400)
			.then((data) => {
				// console.log(data.body);
				expect(data.body.error).toBeDefined()
				expect(data.body.error.message).toBe("publication not found or you can`t update it")
			})
	})

	it('should not publish publication by author not canPublish - error', async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockSecondAuthor.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.put(`/api/publications/${AUTHOR2_PUB_ID}`)
			.set("accept", "application/json")
			.set("Content-Type", "application/json")
			.set("Authorization", `Bearer ${jwt}`)
			.send({
				data: {
					publish: true
				}
			})
			.expect(400)
			.then((data) => {
				// console.log(data.body);
				expect(data.body.error).toBeDefined()
				expect(data.body.error.message).toBe("publication not found or you can`t update it")
			})
	})

	it('should update publication by editor for any author - success', async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockEditorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.put(`/api/publications/${AUTHOR_PUB_ID}`)
			.set("accept", "application/json")
			.set("Content-Type", "application/json")
			.set("Authorization", `Bearer ${jwt}`)
			.send({
				data: {
					title: "Changed by editor"
				}
			})
			.expect(200)
			.then((data) => {
				expect(data.body.data).toBeDefined()
				expect(data.body.data.id).toBe(AUTHOR_PUB_ID)
				expect(data.body.data.attributes.title).toBe("Changed by editor")
			})
	})
})

describe('GET', () => {
	it("should return all published publications and author draft list ", async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockSecondAuthor.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.get("/api/publications?populate[author][fields]=id")
			.set("Authorization", `Bearer ${jwt}`)
			.expect(200)
			.then((data) => {
				expect(data.body.data).toBeInstanceOf(Array);
				expect(data.body.data)
					.toEqual(expect.arrayContaining([
						expect.objectContaining({
							attributes: expect.objectContaining({
								publishedAt: null,
								author: expect.objectContaining({ data: expect.objectContaining({ id: user.id }) })
							})
						})
					]))
				// .toMatchObject([{ attributes: { publishedAt: null } }]);
			})
	})

	it("should return all published publications for author without drafts", async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockAuthorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.get("/api/publications?populate[author][fields]=id")
			.set("Authorization", `Bearer ${jwt}`)
			.expect(200)
			.then((data) => {
				expect(data.body.data).toBeInstanceOf(Array);
				expect(data.body.data)
					.toEqual(expect.arrayContaining([
						expect.objectContaining({
							attributes: expect.not.objectContaining({ publishedAt: null })
						})
					]))
			})
	})

	it("should return all publications for editor role with all drafts", async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockEditorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.get("/api/publications?populate[author][fields]=id")
			.set("Authorization", `Bearer ${jwt}`)
			.expect(200)
			.then((data) => {
				expect(data.body.data).toBeInstanceOf(Array);
				expect(data.body.data)
					.toEqual(expect.arrayContaining([
						expect.objectContaining({
							attributes: expect.objectContaining({ publishedAt: null })
						})
					]))
			})
	})

	it('should return only published publication for public role', async () => {
		const response = await request(strapi.server.httpServer).get("/api/publications")

		expect(response.statusCode).toBe(200)
		expect(response.body.data).toBeInstanceOf(Array)
		expect(response.body.data).not.toMatchObject([{ attributes: { publishedAt: null } }]);
	})

	it("should return publication by ID for author - success ", async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockSecondAuthor.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.get(`/api/publications/${AUTHOR2_PUB_ID}`)
			.set("Authorization", `Bearer ${jwt}`)
			.expect(200)
			.then((data) => {
				expect(data.body.data).toBeInstanceOf(Object);
				expect(data.body.data)
					.toEqual(expect.objectContaining({
						id: AUTHOR2_PUB_ID
					})
					)
				// .toMatchObject([{ attributes: { publishedAt: null } }]);
			})
	})

	it("should not return draft publication by ID for not author of publication - error ", async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockAuthorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.get(`/api/publications/${AUTHOR2_PUB_ID}`)
			.set("Authorization", `Bearer ${jwt}`)
			.expect(403)
		// .then((data) => {
		// 	expect(data.body.data).toBeInstanceOf(Object);
		// 	expect(data.body.data)
		// 		.toEqual(expect.objectContaining({
		// 			id: AUTHOR2_PUB_ID
		// 		})
		// )
		// .toMatchObject([{ attributes: { publishedAt: null } }]);
	})

	it("should return any draft publication by ID for editor - success ", async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockEditorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.get(`/api/publications/${AUTHOR2_PUB_ID}`)
			.set("Authorization", `Bearer ${jwt}`)
			.expect(200)
			.then((data) => {
				expect(data.body.data).toBeInstanceOf(Object);
				expect(data.body.data)
					.toEqual(expect.objectContaining({
						id: AUTHOR2_PUB_ID
					})
					)
				// .toMatchObject([{ attributes: { publishedAt: null } }]);
			})
	})

})

describe('DELETE', () => {
	it('should not delete publication by not its author', async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockAuthorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.delete(`/api/publications/${AUTHOR2_PUB_ID}`)
			.set("Authorization", `Bearer ${jwt}`)
			.expect(400)

	})

	it('should delete publication by its author', async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockAuthorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.delete(`/api/publications/${AUTHOR_PUB_ID}`)
			.set("Authorization", `Bearer ${jwt}`)
			.expect(204)

	})

	it('should delete any publication by editor', async () => {
		const user = await strapi.query("plugin::users-permissions.user").findOne({ where: { username: mockEditorUser.username } })

		const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
			id: user.id
		})

		await request(strapi.server.httpServer)
			.delete(`/api/publications/${AUTHOR2_PUB_ID}`)
			.set("Authorization", `Bearer ${jwt}`)
			.expect(204)

	})
})