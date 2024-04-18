'use strict';

import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Select from 'react-tailwindcss-select';
import { toast } from 'react-toastify';
import { ModelList, ModelSystem } from 'struct/model';
import SelectClassNames from 'styles/SelectClassNames';

import * as API from '../api';
import CreateSecretModal from '../components/CreateSecretModal';
import { useAccountContext } from '../context/account';

export default function ModelForm({ _model = { type: ModelSystem.OPENAI }, secrets = [], editing, compact, fetchModelFormData, callback }: { _model?: any, secrets?: any[], editing?: boolean, compact?: boolean, fetchModelFormData?: Function, callback?: Function }) { //TODO: fix any type

	const [accountContext]: any = useAccountContext();
	const { account, csrf } = accountContext as any;
	const router = useRouter();
	const { resourceSlug } = router.query;
	const [modelState, setModelState] = useState(_model);
	const [modelName, setModelName] = useState(modelState?.name || '');
	const [debouncedValue, setDebouncedValue] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);

	const { _id, name, model, type } = modelState;
	async function modelPost(e) {
		e.preventDefault();
		const body = {
			_csrf: e.target._csrf.value,
			resourceSlug,
			name: e.target.modelName.value,
			model: modelState.model,
			modelId: modelState._id,
		};
		if (editing) {			
			await API.editModel(body, () => {
				toast.success('Model Updated');
			}, (res) => {
				toast.error(res);
			}, null);
		} else {
			const addedModel: any = await API.addModel(body, () => {
				toast.success('Added Model');
			}, (res) => {
				toast.error(res);
			}, compact ? null : router);
			callback && addedModel && callback(addedModel._id);
		}
	}

	const secretCallback = async (addedSecretId) => {
		await fetchModelFormData && fetchModelFormData();
		setModalOpen(false);
	};

	return (<>
		<CreateSecretModal open={modalOpen} setOpen={setModalOpen} callback={secretCallback} />
		<form onSubmit={modelPost}>
			<input
				type='hidden'
				name='_csrf'
				value={csrf}
			/>
			<div className='space-y-12'>
			
				<div className='space-y-6'>
					{!compact && !editing &&  <div>
						<h2 className='text-base font-semibold leading-7 text-gray-900 dark:text-white'>Model</h2>
						<p className='mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400'>Configure models to be used for agents and/or embedding data sources.</p>
					</div>}
					<div>
						<label htmlFor='modelName' className='block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400'>
							Name
						</label>
						<div className='mt-2'>
							<input
								type='text'
								name='modelName'
								id='modelName'
								className='w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
								onChange={e => setModelName(e.target.value)}
								required
								value={modelName}
							/>
						</div>
					</div>
					{/* TODO: other form params here */}
					<div className='sm:col-span-12'>
						<label htmlFor='type' className='block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400'>
							Type
						</label>
						<div className='mt-2'>
							<select
								required
								id='type'
								name='type'
								className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white'
								value={type}
								onChange={(e: any) => {
									setModelState(oldModel => ({
										...oldModel,
										modelSystem: null,
										model: '',
										type: e.target.value,
									}));
								}}
							>
								<option disabled value=''>Select a type...</option>
								<option value={ModelSystem.OPENAI}>OpenAI</option>
								<option value={ModelSystem.FASTEMBED}>FastEmbed</option>
								<option value={ModelSystem.OLLAMA}>Ollama</option>
								<option disabled value={ModelSystem.HUGGING_FACE}>Hugging Face (Coming soon...)</option>
							</select>
						</div>
					</div>

					{/* TODO: the different forms e.g. api_base, api_key for litellm_params depending on ModelSystem */}
					{[ModelSystem.OLLAMA].includes(type) && <div className='sm:col-span-12'>
						<label htmlFor='api_base' className='block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400'>
							API Base URL
						</label>
						<div className='mt-2'>
							<input
								required
								placeholder='http://localhost:11434'
								type='text'
								name='api_base'
								id='api_base'
								className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white'
							/>
						</div>
					</div>}

					{[ModelSystem.OLLAMA].includes(type) && <div className='sm:col-span-12'>
						<label htmlFor='api_key' className='block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400'>
							API Key
						</label>
						<div className='mt-2'>
							<input
								disabled={type === ModelSystem.HUGGING_FACE}
								required
								placeholder='sk-something'
								type='text'
								name='api_key'
								id='api_key'
								className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white'
							/>
						</div>
					</div>}

					{ModelList[type]?.length > 0 && <div className='sm:col-span-12'>
						<label htmlFor='model' className='block text-sm font-medium leading-6 text-gray-900 dark:text-slate-400'>
								Model
						</label>
						<div className='mt-2'>
							<Select
								isClearable
					            primaryColor={'indigo'}
					            classNames={SelectClassNames}
					            value={model ? { label: model, value: model } : null}
					            onChange={(v: any) => {
					            	setModelState(oldModel => {
  											return {
  												...oldModel,
  												model: v?.value,
  											};
  										});
				            	}}
					            options={ModelList && ModelList[type] && ModelList[type].map(m => ({ label: m, value: m }))}
					            formatOptionLabel={data => {
					                return (<li
					                    className={`block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded hover:bg-blue-100 hover:text-blue-500 	${
					                        data.isSelected
					                            ? 'bg-blue-100 text-blue-500'
					                            : 'dark:text-white'
					                    }`}
					                >
					                    {data.label}
					                </li>);
					            }}
					        />
						</div>
					</div>}
					
				</div>

			</div>
			<div className='mt-6 flex items-center justify-between gap-x-6'>
				{!compact && <Link
					className='text-sm font-semibold leading-6 text-gray-900'
					href={`/${resourceSlug}/models`}
				>
					Back
				</Link>}
				<button
					type='submit'
					className='rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
				>
					Save
				</button>
			</div>
		</form>
	</>);

}
