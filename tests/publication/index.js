const request = require('supertest')



it("should return publications list", () => {
	request(strapi.server.httpServer)
		.get("/api/publications")
		.expect(200)
})