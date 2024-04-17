'use strict';

import { IdOrStr } from 'db/index';  // Ensure IdOrStr is exported from the relevant module
import { ObjectId } from 'mongodb';

export enum ModelType {
    EMBEDDING = 'embedding',
    LLM = 'llm',  // Large Language Model
}

export enum ModelSystem {
    FASTEMBED = 'fastembed',
    OPENAI = 'open_ai',
    HUGGING_FACE = 'hugging_face',
    OLLAMA = 'ollama',
    // More types can be added here
}

export enum ModelCapability {
    EMBEDDING = 'embedding',
    LLM = 'llm',
    // Uncomment or add new capabilities as needed
    // AUDIO = 'audio',
    // VIDEO = 'video'
}

export type Model = {
    _id?: ObjectId;
    orgId: ObjectId;
    teamId: ObjectId;
    name: string;
    model: string;
    type: ModelType;
    system: ModelSystem;
    embeddingLength: number;
    config: Record<string, IdOrStr>;  // Configurations can be direct values or references to secrets
};

export enum OpenAIModels {
    TEXT_EMBEDDING_LARGE = 'text-embedding-3-large',
    TEXT_EMBEDDING_SMALL = 'text-embedding-3-small',
    TEXT_EMBEDDING_ADA = 'text-embedding-ada-002',
    GPT4 = 'gpt-4',
    GPT35_TURBO = 'gpt-3.5-turbo',
    GPT35_TURBO_0125 = 'gpt-3.5-turbo-0125',
    GPT4_1106_PREVIEW = 'gpt-4-1106-preview'
}

export enum FastEmbedModels {
    FAST_BGE_SMALL_EN = 'fast-bge-small-en',
    FAST_BGE_BASE_EN = 'fast-bge-base-en',
    FAST_BGE_SMALL_EN_V15 = 'fast-bge-small-en-v1.5',
    FAST_BGE_BASE_EN_V15 = 'fast-bge-base-en-v1.5',
    FAST_MULTILINGUAL_E5_LARGE = 'fast-multilingual-e5-large'
}

export enum OllamaModels {
    MISTRAL = 'mistral',
    LLAMA2 = 'llama2',
    LLAMA2_13B = 'llama2:13b',
    LLAMA2_70B = 'llama2:70b',
    LLAMA2_UNCENSORED = 'llama2-uncensored',
    CODELLAMA = 'codellama',
    ORCA_MINI = 'orca-mini',
    VICUNA = 'vicuna',
    NOUS_HERMES = 'nous-hermes',
    NOUS_HERMES_13B = 'nous-hermes:13b',
    WIZARD_VICUNA = 'wizard-vicuna'
}

export enum HuggingFaceModels {
    COMING_SOON = 'coming soon...'
}

export const ModelList = {
	[ModelSystem.OPENAI]: [
		{ name: OpenAIModels.TEXT_EMBEDDING_LARGE, capabilities: [ModelCapability.EMBEDDING] },
		{ name: OpenAIModels.TEXT_EMBEDDING_SMALL, capabilities: [ModelCapability.EMBEDDING] },
		{ name: OpenAIModels.TEXT_EMBEDDING_ADA, capabilities: [ModelCapability.EMBEDDING] },
		{ name: OpenAIModels.GPT4, capabilities: [ModelCapability.LLM] },
		{ name: OpenAIModels.GPT35_TURBO, capabilities: [ModelCapability.LLM] },
		{ name: OpenAIModels.GPT35_TURBO_0125, capabilities: [ModelCapability.LLM] },
		{ name: OpenAIModels.GPT4_1106_PREVIEW, capabilities: [ModelCapability.LLM] }
	],
	[ModelSystem.FASTEMBED]: [
		{ name: FastEmbedModels.FAST_BGE_SMALL_EN, capabilities: [ModelCapability.EMBEDDING] },
		{ name: FastEmbedModels.FAST_BGE_BASE_EN, capabilities: [ModelCapability.EMBEDDING] },
		{ name: FastEmbedModels.FAST_BGE_SMALL_EN_V15, capabilities: [ModelCapability.EMBEDDING] },
		{ name: FastEmbedModels.FAST_BGE_BASE_EN_V15, capabilities: [ModelCapability.EMBEDDING] },
		{ name: FastEmbedModels.FAST_MULTILINGUAL_E5_LARGE, capabilities: [ModelCapability.EMBEDDING] }
	],
	[ModelSystem.OLLAMA]: [
		{ name: OllamaModels.MISTRAL, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.LLAMA2, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.LLAMA2_13B, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.LLAMA2_70B, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.LLAMA2_UNCENSORED, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.CODELLAMA, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.ORCA_MINI, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.VICUNA, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.NOUS_HERMES, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.NOUS_HERMES_13B, capabilities: [ModelCapability.LLM] },
		{ name: OllamaModels.WIZARD_VICUNA, capabilities: [ModelCapability.LLM] }
	],
	[ModelSystem.HUGGING_FACE]: [
		{ name: HuggingFaceModels.COMING_SOON, capabilities: [] }
	]
};

export const ModelEmbeddingLength = {
	'text-embedding-3-large': 3072,
	'text-embedding-3-small': 1536,
	'text-embedding-ada-002': 1536,
	'fast-bge-small-en': 384,
	'fast-bge-small-en-v1.5': 384,
	'fast-bge-base-en': 768,
	'fast-bge-base-en-v1.5': 786,
	'fast-bge-small-zh-v1.5': 512,
	'fast-all-MiniLM-L6-v2': 384,
	'fast-multilingual-e5-large': 1024,
};
