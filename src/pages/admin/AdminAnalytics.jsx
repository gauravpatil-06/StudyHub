import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, CheckCircle2, Clock, Flame, BookOpen,
    Target, Zap, Award, Activity, FileText, FolderOpen,
    Brain, RefreshCw, ChevronUp, ChevronDown, Minus, Info,
    Calendar, Star, AlertCircle, Code, MonitorPlay,
    History as HistoryIcon, Search, Filter, ArrowUpDown, LayoutGrid
} from 'lucide-react';
import api from '../../utils/api';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';
import { PageLoader } from '../../components/ui/PageLoader';
import { PageHeader } from '../../components/ui/PageHeader';
import toast from 'react-hot-toast';

/* ─── Constants ─── */
const TEAL = '#47C4B7';
const AMBER = '#f59e0b';
const INDIGO = '#6366f1';
const ROSE = '#f43f5e';
const PURPLE = '#8b5cf6';
const AMBER_ALT = '#fbbf24';
const PIE_COLORS = [TEAL, AMBER];
const BREAKDOWN_COLORS = { 'Study': TEAL, 'Coding': INDIGO, 'Watching': ROSE, 'Countdown': AMBER_ALT, 'Stopwatch': PURPLE };

/* ─── Helpers ─── */
const formatHMS = (decimalHours) => {
    const totalMinutes = Math.round(parseFloat(decimalHours || 0) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
};

const formatMins = (h) => {
    const m = Math.round((h || 0) * 60);
    return m === 0 ? '—' : m < 60 ? `${m}m` : `${Math.floor(m / 60)}hrs ${m % 60}m`;
};

const formatAxis = (v) => {
    if (v === 0) return '0m';
    if (v < 1) return `${Math.round(v * 60)}m`;
    return `${v}h`;
};

const scoreLabel = (s) =>
    s >= 80 ? { text: 'Excellent Performance 🚀', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' }
        : s >= 55 ? { text: 'Platform healthy 👍', color: 'text-[#47C4B7]', bg: 'bg-[#47C4B7]/10' }
            : { text: 'Attention Needed 📈', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' };

/* ─── Sub-components ─── */
const cardBaseStyle = {
    transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.28s ease',
};
const cardHoverStyle = {
    transform: 'scale(1.02) translateY(-4px)',
    boxShadow: '0 20px 40px -8px rgba(71,196,183,0.18), 0 8px 16px -4px rgba(71,196,183,0.1)',
    borderColor: 'rgba(71,196,183,0.5)',
};

const HoverCard = ({ children, className, style, delay, rKey, extraHover = {} }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            key={rKey}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
            className={className}
            style={{
                ...cardBaseStyle,
                ...(hovered ? { ...cardHoverStyle, ...extraHover } : {}),
                ...style,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
        </motion.div>
    );
};

const Sk = ({ className }) => (
    <div className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl ${className}`} />
);

const CustomTooltip = ({ active, payload, label, chartType }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;

    const Row = ({ label, value, labelColor = "text-gray-900 dark:text-white", valueColor = "text-teal-700 dark:text-[#47C4B7]" }) => (
        <div className="flex items-center justify-between gap-4">
            <span className={`text-[13px] font-bold capitalize ${labelColor}`}>{label}:</span>
            <span className={`text-[13px] font-bold ${valueColor}`}>{value}</span>
        </div>
    );

    const renderContent = () => {
        switch (chartType) {
            case 'user-dist':
            case 'user-trend':
                return (
                    <>
                        <Row label={chartType === 'user-dist' ? "Users Registered" : "New Users"} value={data.users} />
                        <Row label="Total Users" value={data.totalUsers} />
                    </>
                );
            case 'task-dist':
                return (
                    <>
                        <Row label="Completed Tasks" value={data.tasks} />
                        <Row label="Pending Tasks" value={data.pendingTasks} valueColor="text-amber-500" />
                        <Row label="Total Tasks" value={data.totalTasks} />
                    </>
                );
            case 'task-trend':
                return (
                    <>
                        <Row label="Completed Tasks" value={data.tasks} />
                        <Row label="Completion Rate" value={`${data.totalTasks > 0 ? Math.round((data.tasks / data.totalTasks) * 100) : 0}%`} />
                    </>
                );
            case 'study-break':
                const sVal = data.breakdown?.Study || 0;
                const cVal = data.breakdown?.Coding || 0;
                const wVal = data.breakdown?.Watching || 0;
                const cdVal = data.breakdown?.Countdown || 0;
                const swVal = data.breakdown?.Stopwatch || 0;
                const total = sVal + cVal + wVal + cdVal + swVal;

                return (
                    <>
                        <Row label="Study" value={formatMins(sVal)} labelColor="text-[#47C4B7]" />
                        <Row label="Coding" value={formatMins(cVal)} labelColor="text-[#6366f1]" />
                        <Row label="Watching" value={formatMins(wVal)} labelColor="text-[#f43f5e]" />
                        <Row label="Countdown" value={formatMins(cdVal)} labelColor="text-[#fbbf24]" />
                        <Row label="Stopwatch" value={formatMins(swVal)} labelColor="text-[#8b5cf6]" />
                        <div className="pt-2 mt-2 border-t border-teal-700/20 dark:border-[#47C4B7]/20">
                            <Row label="Total" value={formatMins(total)} labelColor="text-gray-900 dark:text-white" />
                        </div>
                    </>
                );
            case 'study-trend':
                return <Row label="Study Hours" value={formatMins(data.hours)} />;
            case 'mat-dist':
                return (
                    <>
                        <Row label="Materials Uploaded" value={data.materials} />
                        <Row label="Total Materials" value={data.totalMaterials} />
                    </>
                );
            case 'mat-trend':
                return <Row label="Materials Added" value={data.materials} />;
            case 'feed-dist':
            case 'feed-trend':
                return (
                    <>
                        <Row label="Total Feedback" value={data.feedback} />
                        <Row label="Average Rating" value={`${data.avgRating} / 5`} />
                    </>
                );
            case 'growth':
                return (
                    <>
                        <Row label="Users" value={data.users} />
                        <Row label="Tasks Completed" value={data.tasks} />
                        <Row label="Study Hours" value={formatMins(data.hours)} />
                        <Row label="Materials Added" value={data.materials} />
                        <Row label="Feedback Submitted" value={data.feedback} />
                    </>
                );
            default:
                return <Row label={payload[0].name} value={payload[0].value} />;
        }
    };

    return (
        <div className="relative bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg shadow-xl drop-shadow-md min-w-[160px]">
            <div className="absolute w-3.5 h-3.5 bg-white dark:bg-gray-900 border-b border-l border-gray-300 dark:border-gray-600 transform -rotate-45 -bottom-[7.5px] left-2.5 rounded-bl-[2px] pointer-events-none"></div>
            <div className="relative z-10">
                <p className="text-[10px] font-black text-teal-700 dark:text-[#47C4B7] uppercase tracking-wider mb-2 border-b border-teal-700/20 dark:border-[#47C4B7]/20 pb-1.5">
                    {label || data.name || data.label}
                </p>
                <div className="space-y-2">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};


const EmptyChartState = ({ icon: Icon, title, message }) => (
    <div className="flex flex-col items-center justify-center h-[220px] text-center px-4">
        <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3.5 rounded-2xl mb-3.5 border border-gray-200 dark:border-gray-700/50 shadow-sm">
            <Icon size={22} className="text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-[11px] font-medium text-gray-400 max-w-[220px] leading-relaxed">{message}</p>
    </div>
);

export const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [summary, setSummary] = useState(null);
    const [allTasks, setAllTasks] = useState([]);
    const [allMaterials, setAllMaterials] = useState([]);
    const [allActivities, setAllActivities] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allFeedback, setAllFeedback] = useState([]);
    const [weeklyBase, setWeeklyBase] = useState([]);
    const [showGrowthTotals, setShowGrowthTotals] = useState(false);

    const [filters, setFilters] = useState({
        searchTerm: '',
        from: '',
        to: '',
        timeFilter: '7d',
        sortBy: 'latest'
    });

    const filterOpts = [
        { id: '7d', label: 'Last 7 Days' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' }
    ];

    const fetchData = useCallback(async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setLoading(true);

        try {
            const [s, t, m, a, w, u, f] = await Promise.all([
                api.get('/admin/analytics/summary'),
                api.get('/admin/tasks'),
                api.get('/admin/materials'),
                api.get('/admin/activity'),
                api.get('/admin/analytics/weekly'),
                api.get('/admin/users'),
                api.get('/admin/feedback')
            ]);
            setSummary(s.data);
            setAllTasks(t.data || []);
            setAllMaterials(m.data || []);
            setAllActivities(a.data || []);
            setWeeklyBase(w.data || []);
            setAllUsers(u.data || []);
            setAllFeedback(f.data || []);
            if (refresh) setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Failed to fetch platform analytics', error);
            toast.error('Platform data sync failed');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData(true);
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 600);
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const matchesSearch = useCallback((item, query) => {
        if (!query) return true;
        const q = query.toLowerCase().trim();
        const userName = (item.userId?.name || item.name || '').toLowerCase();
        const email = (item.email || '').toLowerCase();
        const title = (item.title || item.name || '').toLowerCase();
        const topic = (item.topic || '').toLowerCase();
        const desc = (item.description || item.notes || item.comment || item.suggestion || '').toLowerCase();

        let dateStr = '';
        const itemDate = item.date || item.createdAt;
        if (itemDate) {
            const d = new Date(itemDate);
            dateStr = `${format(d, 'MMM d yyyy')} ${format(d, 'd MMM yyyy')} ${format(d, 'EEEE')} ${format(d, 'yyyy-MM-dd')}`.toLowerCase();
        }

        return userName.includes(q) || email.includes(q) || title.includes(q) || topic.includes(q) || desc.includes(q) || dateStr.includes(q);
    }, []);

    const dynamicTrendData = useMemo(() => {
        const now = new Date();
        const startOf7d = subDays(now, 6);
        const startOfMonthVal = startOfMonth(now);
        const startOfYearVal = startOfYear(now);

        let fromDate = filters.from ? new Date(filters.from) : null;
        let toDate = filters.to ? new Date(filters.to) : null;
        const isCustomRange = !!(filters.from || filters.to);

        if (!isCustomRange) {
            if (filters.timeFilter === '7d') fromDate = startOf7d;
            else if (filters.timeFilter === 'monthly') fromDate = startOfMonthVal;
            else if (filters.timeFilter === 'yearly') fromDate = startOfYearVal;
            toDate = now;
        }

        const initPoint = (label, date = null) => ({
            label, date, tasks: 0, pendingTasks: 0, totalTasks: 0,
            hours: 0, materials: 0, users: 0, feedback: 0,
            ratings: [], avgRating: 0, Study: 0, isActive: false,
            breakdown: { Study: 0, Coding: 0, Watching: 0, Countdown: 0, Stopwatch: 0 }
        });

        let result = [];
        if (filters.timeFilter === 'monthly' && !isCustomRange) {
            result = [
                initPoint('Week 1'), initPoint('Week 2'),
                initPoint('Week 3'), initPoint('Week 4')
            ];
            const process = (item, dateField, cb) => {
                const d = new Date(item[dateField]);
                if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && matchesSearch(item, filters.searchTerm)) {
                    const day = d.getDate();
                    const wIdx = day > 21 ? 3 : day > 14 ? 2 : day > 7 ? 1 : 0;
                    cb(result[wIdx], item);
                    result[wIdx].isActive = true;
                }
            };
            allTasks.forEach(t => process(t, 'createdAt', (s, item) => {
                if (item.status === 'completed') s.tasks += 1;
                else s.pendingTasks += 1;
            }));
            allMaterials.forEach(m => process(m, m.createdAt ? 'createdAt' : 'date', s => s.materials += 1));
            allActivities.forEach(a => process(a, a.date ? 'date' : 'createdAt', (s, item) => {
                const h = (item.minutes || 0) / 60;
                s.hours += h; s.Study += h;
                const type = item.type || 'Study';
                if (s.breakdown[type] !== undefined) s.breakdown[type] += h;
            }));
            allUsers.forEach(u => process(u, 'createdAt', s => s.users += 1));
            allFeedback.forEach(f => process(f, 'createdAt', (s, item) => {
                s.feedback += 1;
                if (item.rating) s.ratings.push(item.rating);
            }));
        } else if (filters.timeFilter === 'yearly' && !isCustomRange) {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                result.push(initPoint(months[d.getMonth()], d));
            }
            const process = (item, dateField, cb) => {
                const d = new Date(item[dateField]);
                const entry = result.find(s => s.date && s.date.getMonth() === d.getMonth() && s.date.getFullYear() === d.getFullYear());
                if (entry && matchesSearch(item, filters.searchTerm)) {
                    cb(entry, item); entry.isActive = true;
                }
            };
            allTasks.forEach(t => process(t, 'createdAt', (s, item) => {
                if (item.status === 'completed') s.tasks += 1;
                else s.pendingTasks += 1;
            }));
            allMaterials.forEach(m => process(m, m.createdAt ? 'createdAt' : 'date', s => s.materials += 1));
            allActivities.forEach(a => process(a, a.date ? 'date' : 'createdAt', (s, item) => {
                const h = (item.minutes || 0) / 60;
                s.hours += h; s.Study += h;
                const type = item.type || 'Study';
                if (s.breakdown[type] !== undefined) s.breakdown[type] += h;
            }));
            allUsers.forEach(u => process(u, 'createdAt', s => s.users += 1));
            allFeedback.forEach(f => process(f, 'createdAt', (s, item) => {
                s.feedback += 1;
                if (item.rating) s.ratings.push(item.rating);
            }));
        } else {
            let curr = new Date(fromDate || startOf7d);
            curr.setHours(0, 0, 0, 0);
            const end = new Date(toDate || now);
            end.setHours(23, 59, 59, 999);
            while (curr <= end) {
                const dStart = new Date(curr);
                const dEnd = new Date(curr);
                dEnd.setHours(23, 59, 59, 999);
                const p = initPoint(format(dStart, 'EEE'), dStart);
                const dTasks = allTasks.filter(t => { const td = new Date(t.createdAt); return td >= dStart && td <= dEnd && matchesSearch(t, filters.searchTerm); });
                p.tasks = dTasks.filter(t => t.status === 'completed').length;
                p.pendingTasks = dTasks.filter(t => t.status !== 'completed').length;
                p.materials = allMaterials.filter(m => { const md = new Date(m.createdAt || m.date); return md >= dStart && md <= dEnd && matchesSearch(m, filters.searchTerm); }).length;
                const dActs = allActivities.filter(a => { const ad = new Date(a.date || a.createdAt); return ad >= dStart && ad <= dEnd && matchesSearch(a, filters.searchTerm); });
                dActs.forEach(a => {
                    const h = (a.minutes || 0) / 60;
                    p.hours += h; p.Study += h;
                    const type = a.type || 'Study';
                    if (p.breakdown[type] !== undefined) p.breakdown[type] += h;
                });
                p.users = allUsers.filter(u => { const ud = new Date(u.createdAt); return ud >= dStart && ud <= dEnd && matchesSearch(u, filters.searchTerm); }).length;
                const dFeed = allFeedback.filter(f => { const fd = new Date(f.createdAt); return fd >= dStart && fd <= dEnd && matchesSearch(f, filters.searchTerm); });
                p.feedback = dFeed.length;
                p.ratings = dFeed.map(f => f.rating).filter(Boolean);
                p.isActive = p.tasks > 0 || p.hours > 0 || p.materials > 0 || p.users > 0 || p.feedback > 0;
                result.push(p);
                curr.setDate(curr.getDate() + 1);
                if (result.length > 366) break;
            }
        }

        // Post-process cumulative totals and averages
        let cumulativeUsers = allUsers.filter(u => fromDate && new Date(u.createdAt) < fromDate).length;
        let cumulativeMaterials = allMaterials.filter(m => fromDate && new Date(m.createdAt || m.date) < fromDate).length;

        const finalResult = result.map(p => {
            cumulativeUsers += p.users;
            cumulativeMaterials += p.materials;
            return {
                ...p,
                totalUsers: cumulativeUsers,
                totalMaterials: cumulativeMaterials,
                totalTasks: p.tasks + p.pendingTasks,
                avgRating: p.ratings.length ? (p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length).toFixed(1) : 0
            };
        });

        return filters.sortBy === 'latest' ? [...finalResult].reverse() : finalResult;
    }, [allTasks, allMaterials, allActivities, allUsers, allFeedback, filters, matchesSearch]);

    const dynamicMetrics = useMemo(() => {
        const trend = filters.sortBy === 'oldest' ? dynamicTrendData : [...dynamicTrendData].reverse();
        if (!trend.length) return { completion: 0, activeDays: 0, totalHours: 0, totalCompleted: 0 };
        const totalCompleted = trend.reduce((acc, d) => acc + d.tasks, 0);
        const totalHours = trend.reduce((acc, d) => acc + d.hours, 0);
        const activeDays = trend.filter(d => d.isActive).length;
        let startBound, endBound;
        if (filters.timeFilter === 'monthly' && trend.length === 4 && !(filters.from || filters.to)) {
            startBound = startOfMonth(new Date()); endBound = new Date();
        } else if (filters.timeFilter === 'yearly' && trend.length === 12 && !(filters.from || filters.to)) {
            startBound = subDays(new Date(), 365); endBound = new Date();
        } else {
            startBound = trend[0]?.date || new Date(); endBound = trend[trend.length - 1]?.date || new Date();
        }
        const sB = startBound instanceof Date ? new Date(startBound) : new Date(startBound);
        const eB = endBound instanceof Date ? new Date(endBound) : new Date(endBound);
        const start = sB < eB ? sB : eB;
        const end = sB < eB ? eB : sB;
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const totalPotentialTasks = allTasks.filter(t => {
            const d = new Date(t.createdAt);
            return d >= start && d <= end && matchesSearch(t, filters.searchTerm);
        }).length;
        const completion = totalPotentialTasks > 0 ? Math.min(Math.round((totalCompleted / totalPotentialTasks) * 100), 100) : 0;
        return { completion, activeDays, totalHours, totalCompleted };
    }, [dynamicTrendData, allTasks, filters, matchesSearch]);

    const prodScore = useMemo(() => {
        const completionScore = Math.min(dynamicMetrics.completion * 0.5, 50);
        const studyScore = Math.min(dynamicMetrics.totalHours * 1, 30);
        const activityScore = Math.min((dynamicMetrics.activeDays / (dynamicTrendData.length || 1)) * 20, 20);
        return Math.min(Math.round(completionScore + studyScore + activityScore), 100);
    }, [dynamicMetrics, dynamicTrendData]);

    const badge = scoreLabel(prodScore);
    const hasUsers = dynamicTrendData.some(d => d.users > 0);
    const hasTasks = dynamicTrendData.some(d => d.tasks > 0);
    const hasStudy = dynamicTrendData.some(d => d.hours > 0);
    const hasMaterials = dynamicTrendData.some(d => d.materials > 0);
    const hasFeedback = dynamicTrendData.some(d => d.feedback > 0);
    const hasAnyGrowth = hasTasks || hasStudy || hasMaterials || hasUsers || hasFeedback;

    return (
        <div className="space-y-3 pb-10 max-w-full mx-auto px-0">
            <PageHeader
                icon={LayoutGrid}
                title="Platform Analytics"
                subtitle="Insights into user activity and platform performance."
                right={
                    <button
                        onClick={handleRefresh}
                        className={`shrink-0 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:text-[#47C4B7] transition-all hover:shadow-md ${isRefreshing ? 'cursor-not-allowed opacity-50' : ''}`}
                        title="Refresh Data"
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-500'} />
                    </button>
                }
            />

            {/* Filter Bar */}
            <div className="p-2 sm:p-0">
                <HoverCard
                    rKey={`filters-${refreshKey}`}
                    delay={0.1}
                    className="p-1 mb-0"
                    style={{ border: 'none', background: 'transparent', boxShadow: 'none', transform: 'none' }}
                >
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
                        }}
                        className="flex flex-col gap-3 mb-0"
                    >
                        <motion.div
                            variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                            className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4"
                        >
                            <div className="relative flex-1 group min-w-0">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isRefreshing ? 'text-[#47C4B7] animate-pulse' : 'text-gray-400'}`} size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by students, topic, tasks, study materials, date (e.g. 14 Mar)..."
                                    value={filters.searchTerm}
                                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                    className="w-full pl-11 pr-4 py-2 sm:py-2.5 bg-transparent border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-1 focus:ring-[#47C4B7]/30 focus:border-[#47C4B7] text-[15px] text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 shadow-sm"
                                />
                            </div>

                            <div className="flex flex-row flex-nowrap items-center justify-start gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all whitespace-nowrap bg-transparent text-gray-500/80 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700">
                                    <input 
                                        type={filters.from ? "date" : "text"} 
                                        placeholder="DD-MM-YYYY"
                                        onFocus={(e) => (e.target.type = "date")}
                                        onBlur={(e) => !e.target.value && (e.target.type = "text")}
                                        value={filters.from} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))} 
                                        className="bg-transparent border-none text-[11px] font-black focus:ring-0 p-0 w-[105px] text-gray-500/80 hover:text-gray-500 outline-none uppercase" 
                                    />
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all whitespace-nowrap bg-transparent text-gray-500/80 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700">
                                    <input 
                                        type={filters.to ? "date" : "text"} 
                                        placeholder="DD-MM-YYYY"
                                        onFocus={(e) => (e.target.type = "date")}
                                        onBlur={(e) => !e.target.value && (e.target.type = "text")}
                                        value={filters.to} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))} 
                                        className="bg-transparent border-none text-[11px] font-black focus:ring-0 p-0 w-[105px] text-gray-500/80 hover:text-gray-500 outline-none uppercase" 
                                    />
                                </div>
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, sortBy: prev.sortBy === 'latest' ? 'oldest' : 'latest' }))}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all whitespace-nowrap bg-transparent text-gray-500/80 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 min-w-[75px] justify-center"
                                >
                                    <ArrowUpDown size={11} className="text-[#47C4B7]" />
                                    {filters.sortBy === 'latest' ? 'Newest' : 'Oldest'}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
                            className="flex items-center gap-2 flex-nowrap overflow-x-auto custom-scrollbar pb-2 md:pb-0"
                        >
                            {filterOpts.map(pill => (
                                <button
                                    key={pill.id}
                                    onClick={() => setFilters(prev => ({ ...prev, timeFilter: pill.id, from: '', to: '' }))}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all whitespace-nowrap ${filters.timeFilter === pill.id
                                        ? 'bg-[#47C4B7] text-white shadow-lg shadow-[#47C4B7]/20 border-none'
                                        : 'bg-transparent text-gray-500/80 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
                                        }`}
                                >
                                    {pill.label}
                                </button>
                            ))}
                        </motion.div>
                    </motion.div>
                </HoverCard>
            </div>

            {/* Fine-tuned spacer for exact balance */}
            <div className="h-1 sm:h-3" />

            {/* ── Productivity Score Banner ── */}
            {!loading && (
                <HoverCard
                    rKey={`prod-banner-${refreshKey}`}
                    delay={0.05}
                    className="glass-card border-2 border-[#47C4B7]/20 dark:border-[#47C4B7]/30 bg-gradient-to-br from-[#47C4B7]/10 to-white/50 dark:from-[#47C4B7]/10 dark:to-gray-900/50 backdrop-blur-sm rounded-3xl py-2 sm:py-3 px-4 sm:px-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 shadow-xl relative overflow-hidden"
                >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="40" fill="none" stroke={TEAL} strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={2 * Math.PI * 40 * (1 - prodScore / 100)}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-baseline">
                                <span className={`text-2xl sm:text-3xl font-bold ${badge.color} tracking-tight`}>{prodScore}</span>
                                <span className="text-[10px] sm:text-[13px] font-bold text-gray-400">/100</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-[11px] font-bold text-gray-400 tracking-tight mb-0.5 uppercase">Impact Score</p>
                        <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{badge.text}</p>
                        <div className="flex flex-row flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar justify-start">
                            {[
                                { l: 'Completion', v: `${dynamicMetrics.completion}%`, c: 'text-[#47C4B7]' },
                                { l: 'Active Users', v: `${summary?.totalUsers || 0}`, c: 'text-indigo-500' },
                                { l: 'Study', v: formatMins(dynamicMetrics.totalHours), c: 'text-purple-500' },
                                { l: 'Active Days', v: `${dynamicMetrics.activeDays}/${dynamicTrendData.length}`, c: 'text-blue-500' },
                            ].map(x => (
                                <span key={x.l} className="shrink-0 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] sm:text-[13px] font-bold text-gray-500">
                                    {x.l}: <span className={`font-black ${x.c}`}>{x.v}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </HoverCard>
            )}

            {/* ── Main Charts Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* ROW 1 LEFT: User Registration Distribution (Bar) */}
                <HoverCard rKey={`user-dist-${refreshKey}`} delay={0.05} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500 shrink-0">
                            <Brain size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">User Registration Distribution</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Overview of user growth and activity across the platform.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasUsers ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dynamicTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip chartType="user-dist" />} cursor={false} />
                                <Bar dataKey="users" name="New Students" fill={PURPLE} radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={Brain} title="No users found" message="No registration data matches your selected timeframe or search." />}
                </HoverCard>

                {/* ROW 1 RIGHT: User Growth Trend (Area) */}
                <HoverCard rKey={`user-trend-${refreshKey}`} delay={0.08} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500 shrink-0">
                            <Award size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">User Growth Trend</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Daily trend of new users joining the platform.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasUsers ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={dynamicTrendData}>
                                <defs>
                                    <linearGradient id="ugA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={PURPLE} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={PURPLE} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip chartType="user-trend" />} />
                                <Area type="monotone" dataKey="users" name="New Registrations" stroke={PURPLE} strokeWidth={2.5} fill="url(#ugA)" dot={{ r: 3, fill: PURPLE, strokeWidth: 0 }} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={TrendingUp} title="No growth data" message="User registration patterns will appear here as the platform scales." />}
                </HoverCard>

                {/* ROW 2 LEFT: Tasks by Topic (Bar) */}
                <HoverCard rKey={`task-dist-${refreshKey}`} delay={0.1} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 shrink-0">
                            <Target size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">Tasks by Topic</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Distribution of student tasks across different learning subjects.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasTasks ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dynamicTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip chartType="task-dist" />} cursor={false} />
                                <Bar dataKey="tasks" name="Completed Tasks" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={Target} title="No tasks found" message="No completed tasks match your selected timeframe or search." />}
                </HoverCard>

                {/* ROW 2 RIGHT: Task Completion Trend (Area) */}
                <HoverCard rKey={`task-trend-${refreshKey}`} delay={0.15} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 shrink-0">
                            <Activity size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">Task Completion Trend</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Daily progress and student productivity momentum.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasTasks ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={dynamicTrendData}>
                                <defs>
                                    <linearGradient id="tgA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip chartType="task-trend" />} />
                                <Area type="monotone" dataKey="tasks" name="Daily Tasks" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#tgA)" dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={Activity} title="No task trends" message="Stay ahead of your goals. Completion patterns will emerge as you start checking off your daily targets." />}
                </HoverCard>

                {/* ROW 3 LEFT: Study Hours Breakdown (Bar) */}
                <HoverCard rKey={`study-break-${refreshKey}`} delay={0.2} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-500 shrink-0">
                            <Clock size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">Study Hours Breakdown</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Distribution of time spent on study, coding, and watching sessions.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasStudy ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dynamicTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} tickFormatter={formatAxis} />
                                <Tooltip content={<CustomTooltip chartType="study-break" />} cursor={false} />
                                <Bar dataKey="breakdown.Study" name="Study" stackId="a" fill={BREAKDOWN_COLORS.Study} radius={[0, 0, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                                <Bar dataKey="breakdown.Coding" name="Coding" stackId="a" fill={BREAKDOWN_COLORS.Coding} radius={[0, 0, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                                <Bar dataKey="breakdown.Watching" name="Watching" stackId="a" fill={BREAKDOWN_COLORS.Watching} radius={[0, 0, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                                <Bar dataKey="breakdown.Countdown" name="Countdown" stackId="a" fill={BREAKDOWN_COLORS.Countdown} radius={[0, 0, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                                <Bar dataKey="breakdown.Stopwatch" name="Stopwatch" stackId="a" fill={BREAKDOWN_COLORS.Stopwatch} radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={Clock} title="No study sessions" message="Every minute counts. Your session breakdown will appear here as soon as platform activity is recorded." />}
                </HoverCard>

                {/* ROW 3 RIGHT: Study Hours Trend (Area) */}
                <HoverCard rKey={`study-trend-${refreshKey}`} delay={0.25} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-500 shrink-0">
                            <Zap size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">Study Hours Trend</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Daily learning activity and study time growth.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasStudy ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={dynamicTrendData}>
                                <defs>
                                    <linearGradient id="sgA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={TEAL} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={TEAL} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} tickFormatter={formatAxis} />
                                <Tooltip content={<CustomTooltip chartType="study-trend" />} />
                                <Area type="monotone" dataKey="hours" name="Daily Study" stroke={TEAL} strokeWidth={2.5} fill="url(#sgA)" dot={{ r: 3, fill: TEAL, strokeWidth: 0 }} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={Zap} title="No study trends" message="Your learning velocity starts here. Timed study sessions will map your growth momentum." />}
                </HoverCard>

                {/* ROW 4 LEFT: Materials by Topic (Bar) */}
                <HoverCard rKey={`mat-dist-${refreshKey}`} delay={0.3} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-500 shrink-0">
                            <BookOpen size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">Materials by Topic</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Study resources shared and organized across different subjects.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasMaterials ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dynamicTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip chartType="mat-dist" />} cursor={false} />
                                <Bar dataKey="materials" name="Resources" fill={AMBER} radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={FolderOpen} title="No materials found" message="The library is waiting. Resources shared by the community will be showcased here." />}
                </HoverCard>

                {/* ROW 4 RIGHT: Materials Added Trend (Area) */}
                <HoverCard rKey={`mat-trend-${refreshKey}`} delay={0.35} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-500 shrink-0">
                            <FileText size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">Materials Added Trend</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Trend of newly added study materials by students.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasMaterials ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={dynamicTrendData}>
                                <defs>
                                    <linearGradient id="mgA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={AMBER} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={AMBER} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip chartType="mat-trend" />} />
                                <Area type="monotone" dataKey="materials" name="Weekly Content" stroke={AMBER} strokeWidth={2.5} fill="url(#mgA)" dot={{ r: 3, fill: AMBER, strokeWidth: 0 }} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={FileText} title="No content trend" message="Growth is a collective effort. Added resources will build the trend graph as students share materials." />}
                </HoverCard>

                {/* ROW 5 LEFT: User Feedback Insights (Bar) */}
                <HoverCard rKey={`feed-dist-${refreshKey}`} delay={0.4} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 shrink-0">
                            <Star size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">User Feedback Insights</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Analysis of student feedback, ratings, and platform responses.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasFeedback ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={dynamicTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip chartType="feed-dist" />} cursor={false} />
                                <Bar dataKey="feedback" name="Feedback Sent" fill={ROSE} radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={Star} title="No feedback data" message="We value every voice. Student ratings and insights will appear here as the community shares their thoughts." />}
                </HoverCard>

                {/* ROW 5 RIGHT: Feedback Activity Trend (Area) */}
                <HoverCard rKey={`feed-trend-${refreshKey}`} delay={0.45} className="glass-card bg-white/60 backdrop-blur-lg dark:bg-gray-900/40 border-2 border-gray-100/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 shrink-0">
                            <Star size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">Feedback Activity Trend</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Daily pattern of feedback submissions from students.</p>
                        </div>
                    </div>
                    {loading ? <Sk className="h-52" /> : hasFeedback ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={dynamicTrendData}>
                                <defs>
                                    <linearGradient id="fgA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={ROSE} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={ROSE} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip chartType="feed-trend" />} />
                                <Area type="monotone" dataKey="feedback" name="Weekly Feedback" stroke={ROSE} strokeWidth={2.5} fill="url(#fgA)" dot={{ r: 3, fill: ROSE, strokeWidth: 0 }} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={Star} title="No trend data" message="Community engagement is key. Feedback submission patterns will develop as voices are heard." />}
                </HoverCard>

                {/* 7. Overall Growth Momentum */}
                <HoverCard rKey={`growth-trend-${refreshKey}`} delay={0.4} className="lg:col-span-2 glass-card bg-white dark:bg-gray-900/40 border-2 border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-500 shrink-0">
                            <TrendingUp size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight">Overall Growth Momentum</h2>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Tracking overall learning growth and study performance over time</p>
                        </div>
                    </div>
                    <AnimatePresence>
                        {showGrowthTotals && (
                            <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 16 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</p>
                                        <p className="text-[15px] font-bold text-gray-900 dark:text-white">{summary?.totalUsers || 0}</p>
                                    </div>
                                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pt-3 sm:pt-0 sm:pl-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Study</p>
                                        <p className="text-[15px] font-bold text-[#47C4B7]">{formatMins(dynamicMetrics.totalHours)}</p>
                                    </div>
                                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pt-3 sm:pt-0 sm:pl-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Average</p>
                                        <p className="text-[15px] font-bold text-amber-500">{formatMins(dynamicMetrics.totalHours / (dynamicTrendData.length || 1))}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {hasAnyGrowth ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={dynamicTrendData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="ggA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={TEAL} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={TEAL} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} axisLine={false} tickLine={false} padding={{ left: 30, right: 30 }} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={45} tickFormatter={formatAxis} />
                                <Tooltip content={<CustomTooltip chartType="growth" />} />
                                <Area type="monotone" dataKey="hours" name="Global Presence" stroke={TEAL} strokeWidth={3} fill="url(#ggA)" dot={{ r: 3, fill: TEAL, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <EmptyChartState icon={TrendingUp} title="No growth recorded" message="Charts will reflect the platform's heartbeat as usage data and learning activity grows." />}
                </HoverCard>
            </div>
        </div>
    );
};
