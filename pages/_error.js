import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function Error({ statusCode }) {
  const router = useRouter();

  useEffect(() => {
    if (statusCode === 404) {
      router.push('/');
    }
  }, [statusCode, router]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Head>
        <title>Error {statusCode}</title>
      </Head>
      <h1>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </h1>
      <p>
        {statusCode === 404
          ? 'The page you are looking for does not exist.'
          : 'Please try again later.'}
      </p>
      <button onClick={() => router.push('/')}>Go to Home</button>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 