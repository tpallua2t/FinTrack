import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ThemeToggle from '../components/ui/ThemeToggle';

type AuthMode = 'signin' | 'signup' | 'forgot-password';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        navigate('/');
      } else if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        await signUp(email, password);
        navigate('/');
      } else if (mode === 'forgot-password') {
        await resetPassword(email);
        setMessage('Email de réinitialisation envoyé. Vérifiez votre boîte de réception.');
      }
    } catch (err: any) {
      console.error('Erreur d\'authentification:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Un compte existe déjà avec cet email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresse email invalide.');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou mot de passe incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives échouées. Veuillez réessayer plus tard.');
      } else {
        setError(err.message || 'Échec de l\'authentification. Veuillez réessayer.');
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error('Erreur de connexion Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Connexion annulée.');
      } else {
        setError('Échec de la connexion avec Google. Veuillez réessayer.');
      }
    }
    
    setLoading(false);
  };

  const renderTitle = () => {
    switch (mode) {
      case 'signin':
        return 'Connexion';
      case 'signup':
        return 'Créer un compte';
      case 'forgot-password':
        return 'Réinitialiser le mot de passe';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">FinTrack</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Suivi des finances personnelles</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{renderTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div 
                className="bg-red-50 text-red-800 p-3 rounded-lg mb-4 text-sm dark:bg-red-900/30 dark:text-red-400"
                role="alert"
              >
                {error}
              </div>
            )}
            
            {message && (
              <div 
                className="bg-green-50 text-green-800 p-3 rounded-lg mb-4 text-sm dark:bg-green-900/30 dark:text-green-400"
                role="alert"
              >
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    size={18}
                    aria-hidden="true"
                  />
                  <Input
                    type="email"
                    placeholder="Adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    aria-label="Adresse email"
                  />
                </div>
              </div>
              
              {mode !== 'forgot-password' && (
                <div>
                  <div className="relative">
                    <Lock 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                      size={18}
                      aria-hidden="true"
                    />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10"
                      minLength={6}
                      aria-label="Mot de passe"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
                  )}
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                isLoading={loading}
                aria-label={mode === 'signin' ? 'Se connecter' : mode === 'signup' ? 'S\'inscrire' : 'Réinitialiser le mot de passe'}
              >
                {mode === 'signin' ? 'Se connecter' : mode === 'signup' ? 'S\'inscrire' : 'Réinitialiser le mot de passe'}
              </Button>
              
              {mode !== 'forgot-password' && (
                <>
                  <div className="relative flex items-center justify-center">
                    <hr className="w-full border-t border-gray-300 dark:border-gray-700" />
                    <span className="absolute bg-white dark:bg-gray-900 px-2 text-sm text-gray-500 dark:text-gray-400">ou</span>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    aria-label="Continuer avec Google"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12c0,5.523,4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    Continuer avec Google
                  </Button>
                </>
              )}
            </form>
            
            <div className="text-center mt-6">
              {mode === 'signin' ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pas encore de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium focus:outline-none focus:underline"
                      aria-label="Passer à l'inscription"
                    >
                      S'inscrire
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium mt-2 focus:outline-none focus:underline"
                    aria-label="Réinitialiser le mot de passe"
                  >
                    Mot de passe oublié ?
                  </button>
                </>
              ) : mode === 'signup' ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium focus:outline-none focus:underline"
                    aria-label="Passer à la connexion"
                  >
                    Se connecter
                  </button>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium focus:outline-none focus:underline"
                  aria-label="Retour à la connexion"
                >
                  Retour à la connexion
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;