import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../features/authStore';

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  usn: z.string().min(3, 'USN is required'),
  department: z.string().min(1, 'Department is required'),
  cgpa: z.string().refine(v => { const n = parseFloat(v); return n >= 0 && n <= 10; }, 'CGPA must be 0-10'),
  phone: z.string().min(10, 'Phone is required'),
});

const alumniSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  company: z.string().min(1, 'Company is required'),
  jobRole: z.string().min(1, 'Job role is required'),
  salary: z.string().optional(),
  batchYear: z.string().min(4, 'Batch year is required'),
  department: z.string().min(1, 'Department is required'),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

const departments = ['CSE', 'ECE', 'ISE', 'MECH', 'CIVIL', 'EEE'];

export default function Register() {
  const [activeRole, setActiveRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();

  const schema = activeRole === 'student' ? studentSchema : alumniSchema;
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (formData) => {
    try {
      const payload = { ...formData, role: activeRole };
      const data = await registerUser(payload);
      toast.success(data.message || 'Registration successful!');
      if (activeRole === 'alumni') {
        navigate('/login');
      } else {
        navigate(`/${activeRole}/dashboard`);
      }
    } catch (err) {}
  };

  const inputClass = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary-700 to-primary-900 p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">PlaceIQ</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Join the placement<br />revolution
          </h2>
          <p className="text-primary-200 text-lg">Create your account and start your journey to getting placed at your dream company.</p>
        </div>
        <p className="text-primary-300 text-sm">&copy; {new Date().getFullYear()} PlaceIQ</p>
      </div>

      <div className="w-full lg:w-7/12 flex items-start justify-center p-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-lg py-4">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 mb-6">Select your role and fill in the details</p>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {['student', 'alumni'].map((role) => (
              <button key={role} onClick={() => { setActiveRole(role); reset(); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${activeRole === role ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register('name')} className={inputClass} placeholder="Enter your full name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input {...register('email')} type="email" className={inputClass} placeholder="email@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} className={`${inputClass} pr-10`} placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select {...register('department')} className={inputClass}>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
            </div>

            {activeRole === 'student' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">USN</label>
                    <input {...register('usn')} className={inputClass} placeholder="1RV21CS001" />
                    {errors.usn && <p className="text-red-500 text-xs mt-1">{errors.usn.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                    <input {...register('cgpa')} type="number" step="0.01" className={inputClass} placeholder="8.5" />
                    {errors.cgpa && <p className="text-red-500 text-xs mt-1">{errors.cgpa.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input {...register('phone')} className={inputClass} placeholder="9876543210" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </>
            )}

            {activeRole === 'alumni' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input {...register('company')} className={inputClass} placeholder="Company name" />
                    {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                    <input {...register('jobRole')} className={inputClass} placeholder="Software Engineer" />
                    {errors.jobRole && <p className="text-red-500 text-xs mt-1">{errors.jobRole.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Year</label>
                    <input {...register('batchYear')} className={inputClass} placeholder="2023" />
                    {errors.batchYear && <p className="text-red-500 text-xs mt-1">{errors.batchYear.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary (LPA)</label>
                    <input {...register('salary')} type="number" className={inputClass} placeholder="12" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input {...register('linkedin')} className={inputClass} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    <input {...register('github')} className={inputClass} placeholder="https://github.com/..." />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-800 transition-colors disabled:opacity-50 shadow-lg shadow-primary-700/25 flex items-center justify-center gap-2">
              {isSubmitting ? 'Creating Account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {activeRole === 'alumni' && (
            <p className="mt-4 text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">Note: Alumni registrations require admin approval before access is granted.</p>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-primary-700 font-semibold hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
