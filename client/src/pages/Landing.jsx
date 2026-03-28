import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Users, TrendingUp, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
  { icon: Briefcase, title: 'Smart Job Matching', desc: 'AI-powered job recommendations based on your skills, CGPA, and interests.' },
  { icon: Users, title: 'Alumni Network', desc: 'Connect with alumni mentors from top companies for career guidance.' },
  { icon: TrendingUp, title: 'Placement Analytics', desc: 'Real-time dashboards with placement rates, salary trends, and insights.' },
  { icon: Shield, title: 'Resume Builder', desc: 'Build professional resumes with AI-powered tips and multiple templates.' },
  { icon: GraduationCap, title: 'Student Profiles', desc: 'Comprehensive profiles with skills, projects, certifications, and more.' },
  { icon: Sparkles, title: 'AI Career Advisor', desc: 'Get personalized career path suggestions powered by Google Gemini.' },
];

const stats = [
  { value: '500+', label: 'Students Placed' },
  { value: '50+', label: 'Partner Companies' },
  { value: '200+', label: 'Active Alumni' },
  { value: '95%', label: 'Placement Rate' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Place<span className="text-primary-700">IQ</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors">Login</Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-700 rounded-xl hover:bg-primary-800 transition-colors shadow-lg shadow-primary-700/25">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full mb-6">
              <Sparkles className="w-4 h-4" /> AI-Powered Placement Platform
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
              Your One-Stop<br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">Placement Hub</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connecting students, alumni, and administrators with intelligent job matching, career guidance, and comprehensive placement analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-primary-700 rounded-xl hover:bg-primary-800 transition-all shadow-lg shadow-primary-700/25 flex items-center justify-center gap-2">
                Start Your Journey <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary-700">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</p>
              <p className="text-primary-200 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A comprehensive platform designed to streamline the placement process for everyone involved.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-100 transition-all group">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Built for Everyone</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Students', items: ['AI job matching & applications', 'Resume builder with templates', 'Profile management & tracking', 'Alumni mentorship access'], color: 'primary' },
              { title: 'Administrators', items: ['Post & manage job openings', 'Track placement analytics', 'Manage student applications', 'Approve alumni registrations'], color: 'primary' },
              { title: 'Alumni', items: ['Mentorship opportunities', 'Career path showcasing', 'Direct messaging with students', 'Stay connected with campus'], color: 'primary' },
            ].map((role, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{role.title}</h3>
                <ul className="space-y-3">
                  {role.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">PlaceIQ</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} PlaceIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
