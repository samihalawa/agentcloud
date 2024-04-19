'use strict';

import { ObjectId } from 'mongodb';

export type Secret = {
	_id?: ObjectId;
	orgId: ObjectId;
	teamId: ObjectId;
	key: string;
	value: string;  // Secret's value as a simple string
	label: string;
	createdDate: Date;
};
