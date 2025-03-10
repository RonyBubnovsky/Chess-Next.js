import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white bg-opacity-90 backdrop-blur-md rounded-xl p-8 shadow-lg">
        <SignIn
          path="/sign-in"
          routing="path"
          appearance={{
            elements: {
              card: {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                border: 'none'
              },
              formButtonPrimary: {
                backgroundColor: '#7c3aed',
                color: '#FFFFFF',
                borderRadius: '6px'
              },
              formFieldInput: {
                borderRadius: '6px'
              },
              footerActionLink: {
                color: '#7c3aed'
              },
              headerTitle: {
                color: '#333',
                fontSize: '1.6rem'
              }
            },
            variables: {
              colorPrimary: '#7c3aed',
              fontFamily: 'Inter, sans-serif'
            }
          }}
        />
      </div>
    </div>
  );
}
