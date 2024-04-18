'use strict';

import { TrashIcon } from '@heroicons/react/20/solid';
import DeleteModal from 'components/DeleteModal';
import { useRouter } from 'next/router';
import { useEffect,useState } from 'react';
import { toast } from 'react-toastify';

import * as API from '../api';
import { useAccountContext } from '../context/account';

export default function SecretTable({ secrets, fetchSecrets }: { secrets: any[], fetchSecrets?: any }) {

	const [accountContext]: any = useAccountContext();
	const { csrf } = accountContext as any;
	const router = useRouter();
	const { resourceSlug } = router.query;
	const [deletingSecret, setDeletingSecret] = useState(null);
	const [open, setOpen] = useState(false);

	async function deleteSecret() {
		await API.deleteSecret({
			_csrf: csrf,
			secretId: deletingSecret._id,
			resourceSlug,
		}, () => {
			fetchSecrets();
			toast('Deleted secret');
		}, () => {
			toast.error('Error deleting secret');
		}, router);
		setOpen(false);
	}

	useEffect(() => {
		let timeout;
		if (!open) {
			timeout = setTimeout(() => {
				setDeletingSecret(null);
			}, 500);
		}
		return () => clearTimeout(timeout);
	}, [open]);

	return (
		<>
			<DeleteModal
				open={open}
				confirmFunction={deleteSecret}
				cancelFunction={() => {
					setOpen(false);
				}}
				title={'Delete Secret'}
				message={deletingSecret && `Are you sure you want to delete the secret "${deletingSecret?.name}". This action cannot be undone.`}
			/>
			<div className='rounded-lg overflow-hidden shadow overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-50'>
						<tr>
							<th scope='col' className='w-min px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Name
							</th>
							<th scope='col' className='w-min px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Value
							</th>
							<th scope='col' className='w-min px-6 py-3 w-20 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className='bg-white divide-y divide-gray-200'>
						{secrets.map((secret) => (
							<tr key={secret._id}>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-900'>{secret.name}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-900'>***</div>
								</td>
								{/* Add more columns as necessary */}
								<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
									<button
										onClick={() => {
											setDeletingSecret(secret);
											setOpen(true);
										}}
										className='text-red-500 hover:text-red-700'
									>
										<TrashIcon className='h-5 w-5' aria-hidden='true' />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
