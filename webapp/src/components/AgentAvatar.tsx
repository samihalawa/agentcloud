import ButtonSpinner from 'components/ButtonSpinner';
import Blockies from 'react-blockies';
import StorageProviderFactory from 'storage/index';

export default function AgentAvatar({ agent, fill=false, size=16, loading=true }) {
	const storageProvider = StorageProviderFactory.getStorageProvider();
	return <span className='rounded-full overflow-hidden'>
		{loading
			? <span className='flex flex-col items-center justify-center h-full space-y-2'>
				<ButtonSpinner />
				<div className='text-xs'>Uploading...</div>
			</span>
			: (agent?.icon?.filename
				? <img className={`object-cover ${fill ? 'w-full h-full' : `h-${size} w-${size}`}`} src={`${storageProvider.getBasePath()}/${agent.icon.filename}`} />
				: <Blockies seed={agent?.name} size={16} />)}
	</span>;
}
