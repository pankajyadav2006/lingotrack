import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    baseLanguage: 'en',
    targetLanguage: 'es'
  });

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <Languages className="w-12 h-12 text-primary-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            LingoTrack
          </h1>
          <p className="text-gray-500 font-bold mt-2 text-center">
            {isLogin ? 'Welcome back! Ready to learn?' : 'Start your language journey today!'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 font-bold text-center border-2 border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="input-field"
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            required
          />

          {!isLogin && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-500 mb-1 ml-1">Native Language</label>
                <select 
                  name="baseLanguage" 
                  value={formData.baseLanguage} 
                  onChange={handleChange}
                  className="input-field bg-white transition-colors"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-500 mb-1 ml-1">Learning Language</label>
                <select 
                  name="targetLanguage" 
                  value={formData.targetLanguage} 
                  onChange={handleChange}
                  className="input-field bg-white transition-colors"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-4 text-xl">
            {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t-2 border-gray-100">
          <p className="text-gray-500 font-bold">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-secondary-500 border-b-2 border-transparent hover:border-secondary-500 transition-colors uppercase tracking-wide"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
