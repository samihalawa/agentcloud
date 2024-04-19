'use strict';

import * as db from 'db/index';
import { Secret } from 'lib/struct/secret';  // Assuming the structure is exported from 'lib/struct/secret'
import toObjectId from 'misc/toobjectid';
import { ObjectId } from 'mongodb';

export function SecretCollection(): any {
	return db.db().collection('secrets');
}

export async function getSecretById(teamId: db.IdOrStr, secretId: db.IdOrStr): Promise<Secret> {
	return SecretCollection().findOne({
		_id: toObjectId(secretId),
		teamId: toObjectId(teamId),
	});
}

export async function getSecretsByTeam(teamId: db.IdOrStr): Promise<Secret[]> {
	return SecretCollection().find({
		teamId: toObjectId(teamId),
	}).toArray();
}

export async function updateSecret(teamId: db.IdOrStr, secretId: db.IdOrStr, update: Partial<Secret>): Promise<Secret[]> {
	return SecretCollection().updateOne({
		_id: toObjectId(secretId),
		teamId: toObjectId(teamId),
	}, {
		$set: update,
	});
}

export async function addSecret(secret: Secret): Promise<any> {
	return SecretCollection().insertOne(secret);
}

export async function deleteSecretById(teamId: db.IdOrStr, secretId: db.IdOrStr): Promise<any> {
	return SecretCollection().deleteOne({
		_id: toObjectId(secretId),
		teamId: toObjectId(teamId),
	});
}
