'use strict';

import { dynamicResponse } from '@dr';
import toObjectId from 'misc/toobjectid';

import { addSecret, deleteSecretById, getSecretById, getSecretsByTeam } from '../db/secret';

export async function secretsData(req, res, _next) {
	const secrets = await getSecretsByTeam(req.params.resourceSlug);
	return {
		csrf: req.csrfToken(),
		secrets,
	};
}

/**
 * GET /[resourceSlug]/secrets
 * secrets page
 */
export async function secretsPage(app, req, res, next) {
	const data = await secretsData(req, res, next);
	res.locals.data = { ...data, account: res.locals.account };
	return app.render(req, res, `/${req.params.resourceSlug}/secrets`);
}

/**
 * GET /[resourceSlug]/secrets.json
 * team secrets json data
 */
export async function secretsJson(req, res, next) {
	const data = await secretsData(req, res, next);
	return res.json({ ...data, account: res.locals.account });
}

/**
 * GET /[resourceSlug]/secret/add
 * secret add page
 */
export async function secretAddPage(app, req, res, next) {
	const data = await secretsData(req, res, next);
	res.locals.data = { ...data, account: res.locals.account };
	return app.render(req, res, `/${req.params.resourceSlug}/secret/add`);
}

export async function secretData(req, res, _next) {
	const secret = await getSecretById(req.params.resourceSlug, req.params.secretId);
	return {
		csrf: req.csrfToken(),
		secret,
	};
}

/**
 * GET /[resourceSlug]/secret/[secretId].json
 * team secret json data
 */
export async function secretJson(req, res, next) {
	const data = await secretData(req, res, next);
	return res.json({ ...data, account: res.locals.account });
}

/**
 * @api {post} /forms/secret/add Add a secret
 * @apiName add
 * @apiGroup Secret
 *
 * @apiParam {String} key Secret key
 * @apiParam {String} value Secret value
 */
export async function addSecretApi(req, res, next) {
	const { key, value, name } = req.body;

	if (!key || typeof key !== 'string' || key.length === 0 ||
        !value || typeof value !== 'string') {
		return dynamicResponse(req, res, 400, { error: 'Invalid inputs' });
	}

	const newSecret = {
		orgId: res.locals.matchingOrg.id,
		teamId: toObjectId(req.params.resourceSlug),
		key,
		value,
		name,
		createdDate: new Date(),
	};

	const addedSecret = await addSecret(newSecret);

	return dynamicResponse(req, res, 302, { _id: addedSecret.insertedId, redirect: `/${req.params.resourceSlug}/secrets` });
}

/**
 * @api {delete} /forms/secret/[secretId] Delete a secret
 * @apiName delete
 * @apiGroup Secret
 *
 * @apiParam {String} secretId Secret id
 */
export async function deleteSecretApi(req, res, next) {
	const { secretId } = req.body;

	if (!secretId || typeof secretId !== 'string' || secretId.length !== 24) {
		return dynamicResponse(req, res, 400, { error: 'Invalid inputs' });
	}

	await deleteSecretById(req.params.resourceSlug, secretId);

	return dynamicResponse(req, res, 302, { redirect: `/${req.params.resourceSlug}/secrets` });
}