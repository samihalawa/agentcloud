'use strict';

export enum CredentialType {
	OPENAI = 'open_ai',
	OAUTH = 'oauth',
	FASTEMBED = 'fastembed',
	HUGGING_FACE = 'hugging_face',
	OLLAMA = 'ollama',
	// More here...
}

export const CredentialTypes = Object.values(CredentialType);
