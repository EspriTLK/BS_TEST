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
  async bootstrap({ strapi }) {
    // const entry = await strapi.db.query('plugin::users-permissions.role');
    // const getRoleId = async () => {
    //   const roleId = (await entry.findMany())
    //   const lastRoleId = roleId[roleId.length - 1].id
    //   return lastRoleId + 1
    // }
    // const permissions = await strapi.db.query('plugin::users-permissions.permission');
    // const getPermId = async () => {
    //   const permId = (await permissions.findMany());
    //   const lastPermId = permId[permId.length - 1].id
    //   return lastPermId + 1
    // }
    // const actions = ['create', 'update', 'delete', 'find', 'findOne']

    // const author = await entry.findOne({ select: ['name'], where: { name: 'Author' } })
    // const editor = await entry.findOne({ select: ['name'], where: { name: 'Editor' } })
    // const publicRole = await entry.findOne({ where: { name: 'Public' } })
    // const publicPermission = await permissions.findMany({ where: { $and: [{ role: publicRole.id, }, { action: { $contains: 'api::publication.publication' } }] } })

    // if (publicRole && publicPermission.length === 0) {
    //   const permissionsToDelete = await permissions.findMany({ where: { role: publicRole.id, } })

    //   for (let permission of permissionsToDelete) {
    //     if (!permission.action.includes('callback')) {
    //       await permissions.delete({ where: { id: permission.id } })
    //     }
    //   }

    //   // await permissions.create({ data: { id: (await getPermId()), action: `api::publication.publication.find`, role: { id: publicRole.id } } })
    //   // await permissions.create({ data: { id: (await getPermId()), action: `api::publication.publication.findOne`, role: { id: publicRole.id } } })
    // }

    // if (!author) {
    //   const curRoleId = await getRoleId() || 3
    //   await entry.create({ data: { id: curRoleId, name: 'Author', description: 'Author role', type: 'author' } })

    //   for (let i = 0; i < actions.length; i++) {
    //     await permissions.create({ data: { id: (await getPermId()), action: `api::publication.publication.${actions[i]}`, role: { id: curRoleId } } })
    //   }

    //   await permissions.create({ data: { id: (await getPermId()), action: `plugin::users-permissions.auth.changePassword`, role: { id: curRoleId } } })
    //   await permissions.create({ data: { id: (await getPermId()), action: `plugin::users-permissions.user.find`, role: { id: curRoleId } } })
    //   await permissions.create({ data: { id: (await getPermId()), action: `plugin::users-permissions.user.findOne`, role: { id: curRoleId } } })
    // }

    // if (!editor) {
    //   const curRoleId = await getRoleId() || 4
    //   await entry.create({ data: { id: curRoleId, name: 'Editor', description: 'Editor role', type: 'editor' } })

    //   for (let i = 0; i < actions.length; i++) {
    //     await permissions.create({ data: { id: (await getPermId()), action: `api::publication.publication.${actions[i]}`, role: { id: curRoleId } } })

    //   }

    //   await permissions.create({ data: { id: (await getPermId()), action: `plugin::users-permissions.auth.changePassword`, role: { id: curRoleId } } })
    //   await permissions.create({ data: { id: (await getPermId()), action: `plugin::users-permissions.auth.register`, role: { id: curRoleId } } })
    //   await permissions.create({ data: { id: (await getPermId()), action: `plugin::users-permissions.user.find`, role: { id: curRoleId } } })
    //   await permissions.create({ data: { id: (await getPermId()), action: `plugin::users-permissions.user.findOne`, role: { id: curRoleId } } })
    //   await permissions.create({ data: { id: (await getPermId()), action: `plugin::users-permissions.user.create`, role: { id: curRoleId } } })
    //   await permissions.create({ data: { id: (await getPermId()), action: `plugin::users-permissions.user.update`, role: { id: curRoleId } } })
    // }

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

        if (role.name === "Authenticated") {
          const setRole = await strapi.db.query('plugin::users-permissions.role').findOne({ select: 'id', where: { name: 'Author' } });
          await strapi.entityService.update("plugin::users-permissions.user", id, {
            data: {
              role: setRole,
            }
          })
        }
      }
    })
  },
};
