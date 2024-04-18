import Head from 'next/head';
import React, { useEffect, useState } from 'react';

import SecretForm from '../../../components/SecretForm';
import { useAccountContext } from '../../../context/account';

export default function AddSecret(props) {

	const [accountContext]: any = useAccountContext();
	const { teamName } = accountContext as any;

	return (<>

		<Head>
			<title>{`New Secret - ${teamName}`}</title>
		</Head>

		<SecretForm />

	</>);

}

export async function getServerSideProps({ req, res, query, resolvedUrl, locale, locales, defaultLocale }) {
	return JSON.parse(JSON.stringify({ props: res?.locals?.data || {} }));
}
