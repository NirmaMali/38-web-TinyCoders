import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, IdCard } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../features/authStore';

const schema = z.object({
  email: z.string().min(1, 'Email or USN is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState('student');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (formData) => {
    try {
      const data = await login(formData.email, formData.password);
      toast.success(data.message || 'Login successful!');
      const role = data.data.role;
      navigate(`/${role}/dashboard`);
    } catch (err) {
      // Toast already shown by axios interceptor
    }
  };

  const roles = [
    { key: 'student', label: 'Student' },
    { key: 'admin', label: 'Admin' },
    { key: 'alumni', label: 'Alumni' },
  ];

  const demoCredentials = {
    student: { email: '1RV21CS001', pass: 'Student@123', label: 'USN' },
    admin: { email: 'admin@placeiq.com', pass: 'Admin@123', label: 'Email' },
    alumni: { email: 'rajesh.alumni@placeiq.com', pass: 'Alumni@123', label: 'Email' },
  };

  const isStudentRole = activeRole === 'student';

  const fillDemo = () => {
    const creds = demoCredentials[activeRole];
    setValue('email', creds.email);
    setValue('password', creds.pass);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 to-primary-900 p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">PlaceIQ</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Welcome back to your<br />placement hub
          </h2>
          <p className="text-primary-200 text-lg leading-relaxed">
            Access your personalized dashboard, track applications, and stay connected with opportunities.
          </p>
          {isStudentRole && (
            <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <IdCard className="w-5 h-5 text-primary-200" />
                <p className="text-sm font-semibold text-white">Students — Login with your USN</p>
              </div>
              <p className="text-primary-200 text-sm leading-relaxed">
                Your academic data has been pre-loaded by the admin. Just enter your USN and default password to access your profile.
              </p>
            </div>
          )}
        </div>
        <p className="text-primary-300 text-sm">&copy; {new Date().getFullYear()} PlaceIQ</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">PlaceIQ</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h1>
          <p className="text-gray-500 mb-8">Select your role and enter your credentials</p>

          {/* Role Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {roles.map((role) => (
              <button key={role.key} onClick={() => setActiveRole(role.key)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeRole === role.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {role.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isStudentRole ? (
                  <span className="flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5" /> USN or Email
                  </span>
                ) : 'Email'}
              </label>
              <input {...register('email')} type="text"
                placeholder={isStudentRole ? 'Enter your USN (e.g. 1RV21CS001)' : demoCredentials[activeRole].email}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
              {isStudentRole && (
                <p className="text-xs text-gray-400 mt-1">Enter your USN number — your profile has been pre-loaded by admin</p>
              )}
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'}
                  placeholder={isStudentRole ? 'Default: Student@123' : 'Enter your password'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-700/25">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-primary-700">Demo Credentials ({activeRole})</p>
              <button onClick={fillDemo} className="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-200 transition-colors">
                Auto-fill
              </button>
            </div>
            <p className="text-xs text-primary-600">{demoCredentials[activeRole].label}: {demoCredentials[activeRole].email}</p>
            <p className="text-xs text-primary-600">Password: {demoCredentials[activeRole].pass}</p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-700 font-semibold hover:underline">Register</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
