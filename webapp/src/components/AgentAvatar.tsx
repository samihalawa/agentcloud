import Blockies from 'react-blockies';
export default function AgentAvatar({ agent }) {
	return <span className='rounded-full overflow-hidden'>
		{agent?.icon?.filename
			? <img className='object-cover h-16 w-16' src={`https://storage.googleapis.com/${process.env.NEXT_PUBLIC_GCS_BUCKET_NAME}/${agent.icon.filename}`} />
			: <Blockies seed={agent?.name} size={16} />}
	</span>;
}
