import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';
import { Camera, Printer, Lock, Mail, Eye, EyeOff, Sparkles, LogIn } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to authenticate.';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Email/Password authentication is not enabled in your Firebase project. To use Email/Password, please enable it in the Firebase Console (Authentication > Sign-in method). Otherwise, please use the "Sign in with Google" button below.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered as an admin.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password should be at least 6 characters.';
      } else {
        errMsg = err.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Google Sign-In failed.';
      if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Google authentication is not enabled in your Firebase project. Please enable Google Sign-in provider in the Firebase Console (Authentication > Sign-in method).';
      } else {
        errMsg = err.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    // Use standard/default login credentials or auto-register a demo admin for easy previewing
    const demoEmail = 'admin@shivstudio.com';
    const demoPass = 'admin123';
    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      onLoginSuccess();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is disabled. Please use "Sign in with Google" or enable Email/Password provider in the Firebase Console.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // If not found, automatically register it for demo ease!
        try {
          await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          onLoginSuccess();
        } catch (createErr: any) {
          setError('Demo credentials error: ' + createErr.message);
        }
      } else {
        setError('Demo credentials error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 transition-colors duration-300">
      <div id="login-card" className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden transform transition-all">
        {/* Banner with logo representation */}
        <div className="bg-linear-to-r from-amber-500 via-orange-500 to-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
                <Camera className="h-6 w-6 text-amber-300" />
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
                <Printer className="h-6 w-6 text-indigo-300" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight">SHIV STUDIO</h1>
            <p className="text-xs text-amber-100 font-medium tracking-wider uppercase mt-1">&amp; PRINTERS MANAGEMENT</p>
          </div>
        </div>

        {/* Form area */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {isSignUp ? 'Create Admin Account' : 'Admin Secure Login'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isSignUp ? 'Register administrative credentials' : 'Sign in to access control panel'}
            </p>
          </div>

          {error && (
            <div id="login-error" className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shivstudio.com"
                  className="w-full pl-10.5 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 dark:focus:ring-indigo-500 dark:text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10.5 pr-10.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 dark:focus:ring-indigo-500 dark:text-white transition-all"
                />
                <button
                  id="toggle-password-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              id="submit-auth-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-linear-to-r from-amber-500 to-orange-500 dark:from-indigo-600 dark:to-indigo-500 hover:opacity-95 text-white font-semibold rounded-xl text-sm shadow-lg shadow-orange-500/10 dark:shadow-indigo-600/10 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Admin Account' : 'Secure Login'}</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500">Or Quick Preview</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            id="google-login-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 mb-3.5 bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Quick Demo Access */}
          <button
            id="demo-login-btn"
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl text-xs transition-colors border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Login with Demo Admin (auto-create admin@shivstudio.com)</span>
          </button>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {isSignUp ? 'Already have an admin account?' : 'Need to set up a new system?'}
            <button
              id="toggle-signup-btn"
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 text-amber-600 dark:text-indigo-400 font-bold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Register Admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
