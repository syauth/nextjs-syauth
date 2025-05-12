import Link from 'next/link'

export default function Home() {
  return (
    <main className='flex min-h-[80vh] flex-col items-center justify-center p-8'>
      <div className='max-w-lg w-full bg-white shadow-lg rounded-lg p-8 text-center'>
        <h1 className='text-4xl font-bold mb-6'>OAuthDemoKit</h1>
        <p className='text-gray-600 mb-8'>
          Designed for developers who need a{' '}
          <strong>plug-and-play OAuth solution</strong> without reinventing the
          wheel.
        </p>

        <div className='flex flex-col md:flex-row gap-4 justify-center'>
          <Link
            href='/login'
            className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
          >
            Login
          </Link>
          <Link
            href='/welcome'
            className='px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition'
          >
            Protected Page
          </Link>
        </div>
      </div>
    </main>
  )
}
