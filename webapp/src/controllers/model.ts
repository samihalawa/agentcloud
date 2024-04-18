'use strict';

import { dynamicResponse } from '@dr';
import { removeAgentsModel } from 'db/agent';
import { addModel, deleteModelById, getModelById, getModelsByTeam,updateModel } from 'db/model';
import { getSecretById, getSecretsByTeam } from 'db/secret';
import dotenv from 'dotenv';
import toObjectId from 'misc/toobjectid';
import { ObjectId } from 'mongodb';
import { ModelEmbeddingLength, ModelList, ModelSystem } from 'struct/model';
import { chainValidations, PARENT_OBJECT_FIELD_NAME, validateField } from 'utils/validationUtils';

import { addCredential, deleteCredentialById } from '../db/credential';
dotenv.config({ path: '.env' });

export async function modelsData(req, res, _next) {
	const [models, credentials] = await Promise.all([
		getModelsByTeam(req.params.resourceSlug),
		getSecretsByTeam(req.params.resourceSlug)
	]);
	return {
		csrf: req.csrfToken(),
		models,
		credentials,
	};
}

export async function modelData(req, res, _next) {
	const [model, credentials] = await Promise.all([
		getModelById(req.params.resourceSlug, req.params.modelId),
		getSecretsByTeam(req.params.resourceSlug),
	]);
	return {
		csrf: req.csrfToken(),
		model,
		credentials,
	};
}

/**
* GET /[resourceSlug]/models
* models page html
*/
export async function modelsPage(app, req, res, next) {
	const data = await modelsData(req, res, next);
	res.locals.data = { ...data, account: res.locals.account };
	return app.render(req, res, `/${req.params.resourceSlug}/models`);
}

/**
* GET /[resourceSlug]/models.json
* models json data
*/
export async function modelsJson(req, res, next) {
	const data = await modelsData(req, res, next);
	return res.json({ ...data, account: res.locals.account });
}

export async function modelJson(req, res, next) {
	const data = await modelData(req, res, next);
	return res.json({ ...data, account: res.locals.account });
}

/**
* GET /[resourceSlug]/model/add
* models add page html
*/
export async function modelAddPage(app, req, res, next) {
	const data = await modelsData(req, res, next);
	res.locals.data = { ...data, account: res.locals.account };
	return app.render(req, res, `/${req.params.resourceSlug}/model/add`);
}

export async function modelAddApi(req, res, next) {

	let { name, model, modelType, modelSystem, credentialId, litellm_params }  = req.body;

	let validationError = chainValidations(req.body, [
		{ field: 'name', validation: { notEmpty: true }},
		// { field: 'credentialId', validation: { notEmpty: true, hasLength: 24 }},
		{ field: 'model', validation: { notEmpty: true }},
	], { name: 'Name', credentialId: 'Credential', model: 'Model'});
	if (validationError) {	
		return dynamicResponse(req, res, 400, { error: validationError });
	}

	//TODO secrets: check for a duplicate model by name 

	//TODO secrets: loop through keys in litellm_params, perform substitution with secrets

	if (modelSystem !== ModelSystem.FASTEMBED) {
		const litellmResp = await fetch(`${process.env.FASTEMBED_BASE_URL}/model/new`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer sk-CHANGEME', //TODO: make an env for litellm cred
			},
			body: JSON.stringify({
				'model_name': `${req.params.resourceSlug}/${name}`,
				'litellm_params': {
					'model': `${modelSystem}/${model}`,
					...litellm_params, //TODO: validation
				},
			}),
		}).then(res => res.json());
		console.log('litellm response:', litellmResp);
	}

	const addedModel = await addModel({
		orgId: res.locals.matchingOrg.id,
		teamId: toObjectId(req.params.resourceSlug),
		name,
		model: `${req.params.resourceSlug}/${name}`,
		embeddingLength: ModelEmbeddingLength[model] || 0,
		system: modelSystem,
		type: modelType,
	});

	return dynamicResponse(req, res, 302, { _id: addedModel.insertedId, redirect: `/${req.params.resourceSlug}/models` });

}

export async function editModelApi(req, res, next) {

	let { name, model, modelType, modelSystem, config }  = req.body;

	let validationError = chainValidations(req.body, [
		{ field: 'name', validation: { notEmpty: true }},
		// { field: 'credentialId', validation: { notEmpty: true, hasLength: 24 }},
		{ field: 'model', validation: { notEmpty: true }},
	], { name: 'Name', credentialId: 'Credential', model: 'Model'});
	if (validationError) {	
		return dynamicResponse(req, res, 400, { error: validationError });
	}

	//TODO secrets: get the model by req.params.modelId and change the following check to if the current model system is/was something other than fastembed, delete the old 
	
	/*
	//TODO secrets: since there is no EDIT api, DELETE the model first, then re-create it:
	const foundModel = await getModelById(req.params.resourceSlug, req.params.modelId);
	if (foundModel && foundModel.system !== ModelSystem.FASTEMBED) {
		//delete the model in litellm
	}
	*/

	/*
	if (modelSystem !== ModelSystem.FASTEMBED) {
		const litellmResp = await fetch(`${process.env.FASTEMBED_BASE_URL}/model/new`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer sk-CHANGEME', //TODO: make an env for litellm cred
			},
			body: JSON.stringify({
				'model_name': `${req.params.resourceSlug}/${name}`,
				'litellm_params': {
					'model': `${modelSystem}/${model}`,
					...litellm_params, //TODO: validation
				},
			}),
		}).then(res => res.json());
		console.log('litellm response:', litellmResp);
	}
	*/

	const update = {
		name,
		model: `${req.params.resourceSlug}/${name}`,
		embeddingLength: ModelEmbeddingLength[model] || 0,
		system: modelSystem,
		type: modelType,
	};

	//TODO secrets: loop through keys in config, perform substitution

	// Insert model to db
	const updatedModel = await updateModel(req.params.resourceSlug, req.params.modelId, update);

	return dynamicResponse(req, res, 302, { });

}

/**
 * @api {delete} /forms/model/[modelId] Delete a model
 * @apiName delete
 * @apiGroup Model
 *
 * @apiParam {String} modelId Model id
 */
export async function deleteModelApi(req, res, next) {

	const { modelId }  = req.body;

	if (!modelId || typeof modelId !== 'string' || modelId.length !== 24) {
		return dynamicResponse(req, res, 400, { error: 'Invalid inputs' });
	}

	const model = await getModelById(req.params.resourceSlug, modelId);
	if (!model) {
		return dynamicResponse(req, res, 400, { error: 'Invalid inputs' });
	}

	Promise.all([
		removeAgentsModel(req.params.resourceSlug, modelId),
		deleteModelById(req.params.resourceSlug, modelId),
		model?.type === CredentialType.FASTEMBED ? deleteCredentialById(req.params.resourceSlug, model.credentialId) : void 0, //Delete dumym cred if this is a fastembed model
	]);

	return dynamicResponse(req, res, 302, { /*redirect: `/${req.params.resourceSlug}/credentials`*/ });

}
