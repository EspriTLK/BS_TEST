module.exports = async (policyContext, config, { strapi }) => {
	if (policyContext.state.user.role.name === 'Editor') {
		// Go to next policy or will reach the controller's action.
		return true;
	}

	return false;
};