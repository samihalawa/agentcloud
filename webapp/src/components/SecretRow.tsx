import { PencilIcon,TrashIcon } from '@heroicons/react/20/solid';
import {
	ArrowUturnLeftIcon,
	CheckIcon,
	EyeIcon,
	EyeSlashIcon} from '@heroicons/react/24/outline';
import DeleteModal from 'components/DeleteModal';
import { useRouter } from 'next/router';
import { useEffect,useState } from 'react';
import { toast } from 'react-toastify';
import { Secret } from 'struct/secret';

import * as API from '../api';
import { useAccountContext } from '../context/account';

export default function SecretRow({ secret={}, fetchSecrets }: { secret?: Partial<Secret>, fetchSecrets?: Function }) {
	const [accountContext]: any = useAccountContext();
	const { account, csrf, teamName } = accountContext as any;
	const router = useRouter();
	const { resourceSlug } = router.query;
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [key, setKey] = useState(secret.key || '');
	const [value, setValue] = useState(secret.value || '');
	const [label, setLabel] = useState(secret.label || '');
	const [deletingSecret, setDeletingSecret] = useState(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		let timeout;
		if (!open) {
			timeout = setTimeout(() => {
				setDeletingSecret(null);
			}, 500);
		}
		return () => clearTimeout(timeout);
	}, [open]);

	async function deleteSecret() {
		setDeleting(true);
		const start = Date.now();
		const body = {
			_csrf: csrf,
			resourceSlug,
			secretId: secret._id,
			key,
			value,
			label,
		};
		try {
			await API.deleteSecret(body, async () => {
				await new Promise(res => setTimeout(res, 700-(Date.now()-start)));
				fetchSecrets && fetchSecrets();
				setDeleting(false);
			}, (err) => {
				toast.error(err);
				setDeleting(false);
			}, router);
			setEditing(!editing);
			setShowPassword(false);
		} catch (e) {
			console.error(e);
			toast.error('Failed to delete secret');
		} finally {
			setOpen(false);
		}
	}
	
	async function saveSecret() {
		const body = {
			_csrf: csrf,
			resourceSlug,
			secretId: secret._id,
			key,
			value,
			label,
		};
		try {
			await API.editSecret(secret._id, body, null, (err) => {
				toast.error(err);
			}, router);
			setEditing(!editing);
			setShowPassword(false);
		} catch (e) {
			console.error(e);
			toast.error('Failed to edit secret');
		} finally {
			fetchSecrets && fetchSecrets();
		}
	}
	
	return (<tr>
		<td className='px-6 py-4 whitespace-nowrap'>
			<DeleteModal
				open={open}
				confirmFunction={deleteSecret}
				cancelFunction={() => {
					setOpen(false);
				}}
				title={'Delete Secret'}
				message={`Are you sure you want to delete the secret "${deletingSecret?.name}". This action cannot be undone.`}
			/>
			<div className='text-sm text-gray-900'>{secret.label}</div>
		</td>
		<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
			{editing
				? <input
					id='key'
					name='key'
					type='text'
					required
					defaultValue={secret.key}
					onChange={e => setKey(e.target.value)}
					className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white'
				/>
				: <div className='text-sm text-gray-900'>{secret.key}</div>}
		</td>
		<td className='px-6 py-4 whitespace-nowrap'>
			{editing
				? <div className='relative'>
					<input
						id='value'
						name='value'
						type={showPassword ? 'text' : 'password'}
						required
						defaultValue=''
						className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:ring-slate-600 dark:text-white'
					/>
					<div onClick={() => setShowPassword(o => !o)} className='cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3'>
						{showPassword
							? <EyeIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
							: <EyeSlashIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />}
					</div>
				</div>
				: <div className='text-sm text-gray-900'>**********</div>}
		</td>
		{/* Add more columns as necessary */}
		<td className='px-6 py-6 whitespace-nowrap text-right text-sm font-medium flex flex-row w-full justify-end'>
			<div className={'flex flex-row justify-between w-10'}>
				{editing && <button
					onClick={() => {
						saveSecret();
					}}
					className='text-gray-500 hover:text-gray-700'
				>
					<CheckIcon className='h-5 w-5' aria-hidden='true' />
				</button>}
			</div>
			<div className={'flex flex-row justify-between w-16'}>
				<button
					onClick={() => {
						setEditing(!editing);
						setShowPassword(false);
						setKey(secret.key);
						setValue(secret.value);
						
					}}
					className='text-gray-500 hover:text-gray-700'
				>
					{editing
						? <ArrowUturnLeftIcon className='h-5 w-5' aria-hidden='true' />
						: <PencilIcon className='h-5 w-5' aria-hidden='true' />}
				</button>
				<button
					onClick={() => {
						setDeletingSecret(secret);
						setOpen(true);
					}}
					className='text-red-500 hover:text-red-700'
				>
					<TrashIcon className='h-5 w-5' aria-hidden='true' />
				</button>
			</div>
		</td>
	</tr>);
}
