import React from 'react';

interface SpinnerProps {
    loadingText?: string;
    color?: string,
}

const Spinner: React.FC<SpinnerProps> = function ({ loadingText, color = 'white', size=16 }) {

	const spinnerClasses = `w-${size} h-${size} rounded-full animate-spin border-4 border-solid border-${color}-500 border-t-transparent`;

	return (
		<div className='absolute left-1/2 bottom-1/2  transform translate-x-1/2 translate-y-1/2 '>
			<div className={spinnerClasses}></div>
			<br />
			{loadingText}
		</div>
	);
};

export default Spinner;
