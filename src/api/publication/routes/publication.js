'use strict';

/**
 * publication router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::publication.publication', {
	// config: {
	// 	find: {
	// 		// policies: ['api::publication.is-editor'],
	// 		auth: false
	// 	}
	// }
});
