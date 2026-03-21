import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, BookOpen, User, Mail, Lock, Building, Calendar, Clock, BarChart3, CheckCircle2, Target, ShieldCheck, X } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const { login, register, googleLogin } = useAuth();
    const navigate = useNavigate();

    // Form states
    const [formData, setFormData] = useState({ name: '', college: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotDialog, setShowForgotDialog] = useState(false);

    useEffect(() => {
        // Clear form and error when switching login modes
        setFormData(prev => ({ ...prev, email: '', password: '' }));
        setError('');
    }, [isAdminLogin, isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password, isAdminLogin);
            } else {
                if (formData.password.length < 8) {
                    setError('Password must be at least 8 characters long');
                    setIsLoading(false);
                    return;
                }
                await register(formData.name, formData.college, formData.email, formData.password);
            }
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        setIsLoading(true);
        setError('');
        try {
            // Fetch user profile from Google using the access token
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const data = await res.json();
            
            // Send this to our backend via AuthContext
            await googleLogin(null, data);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError('Google Sign In failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError('Google Sign In failed'),
    });

    return (
        <div className="flex min-h-screen lg:h-screen w-full lg:overflow-hidden bg-white dark:bg-[#020617] overflow-y-auto">
            {/* LEFT SIDE: Animation & Branding */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-[#1e4643] via-[#163331] to-[#112726] p-12">
                {/* Subtle Background Glows */}
                <div className="absolute w-[600px] h-[600px] bg-[#47C4B7]/15 rounded-full blur-[120px] -top-20 -left-20 animate-pulse pointer-events-none" />
                <div className="absolute w-[500px] h-[500px] bg-[#47C4B7]/10 rounded-full blur-[100px] -bottom-20 -right-20 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

                {/* Content Container */}
                <div className="z-10 flex flex-col items-start w-full max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <div className="p-2 bg-[#47C4B7]/15 rounded-2xl border border-[#47C4B7]/20">
                            <BookOpen size={28} className="text-[#47C4B7]" />
                        </div>
                        <h1 className="text-[32px] font-bold tracking-tight text-white mb-0">StudyHub</h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-8 text-left"
                    >
                        <h2 className="text-[32px] text-white font-bold mb-3 leading-tight tracking-tight">Master Your Academic Journey 🚀</h2>
                        <p className="text-[15px] text-gray-300 font-medium leading-relaxed opacity-90">
                            The ultimate all-in-one workspace for focused learning. Stay organized, monitor progress, and build consistent study habits every day.
                        </p>
                    </motion.div>

                    {/* Direct Feature List with Emojis */}
                    <div className="space-y-[22px] w-full">
                        {[
                            { emoji: "🚀", title: "Smart Task Management", desc: "Create and organize daily study tasks effortlessly." },
                            { emoji: "⏱️", title: "Focus Sessions & Timer", desc: "Concentrate deeply with smart countdown and stopwatch timers." },
                            { emoji: "📊", title: "Advanced Analytics", desc: "Visualize your study hours and productivity patterns clearly." },
                            { emoji: "📁", title: "Study Materials", desc: "Upload and manage your PDFs, notes, and documents in one place." },
                            { emoji: "🎯", title: "Monthly Goals & Progress", desc: "Set clear targets and track your journey toward achievement." },
                            { emoji: "🔥", title: "Streak & History Tracking", desc: "Maintain daily consistency and review past learning sessions." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 + (idx * 0.1), ease: [0.22, 1, 0.36, 1] }}
                                className="flex items-center gap-4 group"
                            >
                                <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 group-hover:bg-[#47C4B7]/20 group-hover:border-[#47C4B7]/30 transition-all duration-300 shadow-sm group-hover:scale-105">
                                    <span className="text-lg leading-none filter drop-shadow-sm">{feature.emoji}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-[14.5px] tracking-tight mb-0.5 group-hover:text-[#47C4B7] transition-colors">{feature.title}</h3>
                                    <p className="text-gray-300/60 text-[12px] leading-snug font-medium">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>


                </div>
            </div>

            {/* RIGHT SIDE: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative z-10 bg-gray-50 dark:bg-transparent">
                <motion.div
                    initial={{ opacity: 0, x: 120 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[calc(100%-0.5rem)] sm:max-w-md bg-white dark:bg-gray-900 rounded-3xl px-5 py-5 sm:px-10 sm:py-5 shadow-xl border-2 border-gray-100 dark:border-gray-800 relative"
                >
                    {/* Mobile Logo inside Card */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-3 pointer-events-none">
                        <BookOpen size={32} className="text-[#47C4B7]" />
                        <span className="text-3xl font-extrabold logo-text text-gray-900 dark:text-white">StudyHub</span>
                    </div>

                    {/* Welcome Text */}
                    <div className="text-center mb-8 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                            {isLogin ? 'Welcome back!' : 'Get Started'}
                        </h2>
                        <p className="text-[13px] sm:text-[15px] font-medium text-gray-500 dark:text-gray-400">
                            {isLogin ? 'Please login to your account.' : 'Create a new account to get started.'}
                        </p>
                    </div>

                    {/* Admin / User Segmented Toggle */}
                    {isLogin && (
                        <div className="flex p-1.5 bg-gray-100/80 dark:bg-gray-800/40 rounded-2xl mb-8 sm:mb-6 relative border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={() => { setIsAdminLogin(false); setError(''); }}
                                className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl z-10 transition-all flex items-center justify-center gap-2 ${!isAdminLogin ? 'bg-white dark:bg-gray-700 text-[#47C4B7] shadow-lg shadow-black/5 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <User size={16} strokeWidth={2.5} />
                                User Login
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsAdminLogin(true); setError(''); }}
                                className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl z-10 transition-all flex items-center justify-center gap-2 ${isAdminLogin ? 'bg-white dark:bg-gray-700 text-[#47C4B7] shadow-lg shadow-black/5 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <ShieldCheck size={16} strokeWidth={2.5} />
                                Admin Login
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    key="register-fields"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5"
                                >
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[15px] font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#47C4B7] transition-colors">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                autoComplete="name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#47C4B7] focus:ring-1 focus:ring-[#47C4B7] text-gray-900 dark:text-white transition-all placeholder-gray-400"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[15px] font-semibold text-gray-700 dark:text-gray-300">College Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#47C4B7] transition-colors">
                                                <Building size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="college"
                                                autoComplete="organization"
                                                required
                                                value={formData.college}
                                                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                                className="w-full pl-10 pr-3 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#47C4B7] focus:ring-1 focus:ring-[#47C4B7] text-gray-900 dark:text-white transition-all placeholder-gray-400"
                                                placeholder="Enter your college name"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            className="flex flex-col gap-1"
                        >
                            <label className="text-[15px] font-semibold text-gray-700 dark:text-gray-300">Email</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#47C4B7] transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#47C4B7] focus:ring-1 focus:ring-[#47C4B7] text-gray-900 dark:text-white transition-all placeholder-gray-400"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="flex flex-col gap-1"
                        >
                            <label className="text-[15px] font-semibold text-gray-700 dark:text-gray-300">Password</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#47C4B7] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-10 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#47C4B7] focus:ring-1 focus:ring-[#47C4B7] text-gray-900 dark:text-white transition-all placeholder-gray-400"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#47C4B7] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Remember me & Forgot Password Link - Only show on Login */}
                        {isLogin && (
                            <div className="flex justify-between items-center pt-1 !mb-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-400 text-[#47C4B7] focus:ring-[#47C4B7] bg-white dark:bg-gray-900 cursor-pointer" />
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Remember me</span>
                                </label>
                                {!isAdminLogin && (
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotDialog(true)}
                                        className="text-sm font-semibold text-[#47C4B7] hover:text-[#3bb5a8] hover:underline transition-all"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="-mt-1.5 mb-4"
                                    >
                                        <p className="text-[13px] font-bold text-red-500 text-center">
                                            {error}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 px-4 bg-[#47C4B7] hover:bg-[#3bb1a5] text-white font-bold rounded-xl shadow-lg shadow-[#47C4B7]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center text-[15px]"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    isLogin ? (isAdminLogin ? 'Sign In as Admin' : 'Sign In') : 'Sign Up'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Google Login Section - Only show for User Login */}
                    {!isAdminLogin && (
                        <div className="mt-5 space-y-5">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 font-bold tracking-wider">OR</span>
                                </div>
                            </div>

                            <div className="flex justify-center w-full">
                                <button
                                    onClick={() => handleGoogleLogin()}
                                    type="button"
                                    className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3 text-[15px] hover:bg-gray-50 dark:hover:bg-gray-750"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>{isLogin ? 'Sign in with Google' : 'Sign up with Google'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Toggle Login/Register Mode */}
                    <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {isLogin ? (
                            <>Don't have an account? <button onClick={() => { setIsLogin(false); setIsAdminLogin(false); }} className="font-bold text-[#47C4B7] hover:underline transition-all ml-1">Sign up</button></>
                        ) : (
                            <>Already have an account? <button onClick={() => setIsLogin(true)} className="font-bold text-[#47C4B7] hover:underline transition-all ml-1">Sign in</button></>
                        )}
                    </div>

                </motion.div>
            </div>
            <ForgotPasswordDialog isOpen={showForgotDialog} onClose={() => setShowForgotDialog(false)} />
        </div >
    );
};

const ForgotPasswordDialog = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: New Password
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const handleVerifyEmail = async () => {
        if (!email) return setMsg({ text: 'Please enter your email', type: 'error' });
        setLoading(true);
        setMsg({ text: '', type: '' });
        try {
            await api.post('/auth/verify-email', { email });
            setStep(2);
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Email verification failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) return setMsg({ text: 'Please fill all fields', type: 'error' });
        if (newPassword.length < 8) return setMsg({ text: 'Password must be at least 8 characters long', type: 'error' });
        if (newPassword !== confirmPassword) return setMsg({ text: 'Passwords do not match', type: 'error' });

        setLoading(true);
        setMsg({ text: '', type: '' });
        try {
            await api.post('/auth/update-password-direct', { email, newPassword });
            setMsg({ text: 'Password Forgot Successfully', type: 'success' });
            setTimeout(() => {
                onClose();
                // Reset states
                setStep(1);
                setEmail('');
                setNewPassword('');
                setConfirmPassword('');
                setMsg({ text: '', type: '' });
            }, 1000);
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 relative"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                            {step === 1 ? 'Verify your email' : 'Update Password'}
                        </h3>

                        <div className="space-y-4">
                            {step === 1 ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#47C4B7] focus:ring-1 focus:ring-[#47C4B7] text-gray-900 dark:text-white"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleVerifyEmail}
                                        disabled={loading}
                                        className="w-full py-2 bg-[#47C4B7] text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Verify Email'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-10 pr-10 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#47C4B7] focus:ring-1 focus:ring-[#47C4B7] text-gray-900 dark:text-white"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#47C4B7] transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-10 py-2 text-[14px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md outline-none focus:border-[#47C4B7] focus:ring-1 focus:ring-[#47C4B7] text-gray-900 dark:text-white"
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#47C4B7] transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={loading}
                                        className="w-full py-2 bg-[#47C4B7] text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Update Password'}
                                    </button>
                                </div>
                            )}

                            {msg.text && (
                                <p className={`text-[13px] font-bold text-center mt-2 ${msg.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {msg.text}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
