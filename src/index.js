'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],
      afterCreate: async ({ result }) => {

        const { id, role, canPublish } = result;
        if (role.name === "Editor" && !canPublish) {
          await strapi.entityService.update("plugin::users-permissions.user", id, {
            data: {
              canPublish: true,
            }
          })
        }
        console.log('[TRY USER CREATE]');
      }
    })
  },
};
