import { dynamicResponse } from '@dr';
import { getAccountById } from 'db/account';
import { getOrgById } from 'db/org';
import debug from 'debug';
import { PlanLimitsKeys, pricingMatrix,SubscriptionPlan } from 'struct/billing';
const log = debug('webapp:middleware:auth:checksubscription');

const cache = {};

export async function fetchUsage(req, res, next) {
	const currentOrg = res.locals?.matchingOrg;
	const currentTeam = res.locals?.matchingTeam;

	if (!currentOrg || !currentTeam) {
		return dynamicResponse(req, res, 400, { error: 'Missing org or team in usage check context' });
	}

	try {
	
		// Count the number of members in the team
		const teamMembersCount = currentTeam.members?.length || 0;

		// Add usage data to the response locals
		res.locals.usage = {
			...(res.locals.usage || {}),
			[PlanLimitsKeys.users]: teamMembersCount,
		};

		next();

	} catch (error) {
		log('Error fetching usage:', error);
		return dynamicResponse(req, res, 500, { error: 'Error fetching usage data' });
	}
}

export async function setSubscriptionLocals(req, res, next) {

	let ownerId = res.locals?.matchingOrg?.ownerId;

	if (!ownerId) {
		const currentOrgId = res.locals?.matchingOrg?.id || res.locals?.account?.currentOrg;
		if (!currentOrgId) {
			return dynamicResponse(req, res, 400, { error: 'Missing org in subscription check context' });
		}
		const parentOrg = await getOrgById(currentOrgId);
		if (!parentOrg) {
			return dynamicResponse(req, res, 400, { error: 'Invalid org in subscription check context' });
		}
		const parentOrgOwner = await getAccountById(parentOrg.ownerId);
		if (!parentOrgOwner) {
			return dynamicResponse(req, res, 400, { error: 'Account error' });
		}
		res.locals.subscription = parentOrgOwner.stripe;
	}

	next();

}

export function checkSubscriptionPlan(plans: SubscriptionPlan[]) {
	// @ts-ignore
	return cache[plans] || (cache[plans] = async function(req, res, next) {
		const { stripePlan } = (res.locals?.subscription || {});
		if (!plans.includes(stripePlan)) {
			return dynamicResponse(req, res, 400, { error: `This feature is only available on plans: ${plans.join('\n')}` });
		}
		next();
	});
}

export function checkSubscriptionLimit(limit: keyof typeof PlanLimitsKeys) {
	// @ts-ignore
	return cache[limit] || (cache[limit] = async function(req, res, next) {
		const { stripePlan } = (res.locals?.subscription || {});
		const usage = res.locals.usage;
		log(`plan: ${stripePlan}, limit: ${limit}, usage: ${usage}, usage[limit]: ${usage[limit]}`);
		// @ts-ignore
		if ((!usage || !stripePlan)
			|| (usage && stripePlan && usage[limit] > pricingMatrix[stripePlan][limit])) {
			return dynamicResponse(req, res, 400, { error: `Usage for "${limit}" exceeded (${usage[limit]}/${res.locals.subscription[limit]}).` });
		}
		next();
	});
}

