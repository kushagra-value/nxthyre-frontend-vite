import React from 'react';
import { CompanyResearchData } from '../../../services/organizationService';
import {
    Building2,
    Users,
    Globe,
    Target,
    Award,
    ShieldCheck,
    Heart,
    MapPin,
    Calendar,
    ArrowLeft,
    Star,
    Layers,
    TrendingUp,
    Zap,
    UserCheck,
    CheckCircle2,
    AlertCircle,
    Sparkles,
} from 'lucide-react';

interface CompanyInfoTabProps {
    data: CompanyResearchData;
    onBack?: () => void;
    onEdit?: () => void;
    onCreateJob?: () => void;
}

const PH = '--';

const getInitials = (name?: string): string => {
    if (!name || name === PH) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
};

const CompanyInfoTab: React.FC<CompanyInfoTabProps> = ({ data, onBack }) => {
    if (!data) return <div className="text-center py-12 text-slate-400">No company details available.</div>;

    const d = data as CompanyResearchData;

    const companyName = d.company_name || PH;
    const website = d.website || PH;
    const headquarters = d.headquarters || PH;
    const foundedYear = d.founded_year || PH;
    const companyType = d.company_type || d.industry || PH;
    const overallRating = d.overall_rating || 0;
    const companyOverview = d.company_overview || d.founding_story || PH;
    const employeeCount = d.employee_count || PH;
    const annualRevenue = d.annual_revenue || PH;
    const growthStage = d.growth_stage || PH;
    const hiringTrend = d.hiring_trend || PH;
    const founders = d.founders || [];
    const techStack = d.tech_stack || [];
    const coreCompetencies = d.core_competencies || [];
    const culturePros = d.culture_pros || [];
    const cultureCons = d.culture_cons || [];
    const coreValues = d.core_values || [];
    const complianceCerts = (d as any).compliance_certifications || d.regulatory_frameworks || [];
    const awards = d.awards_certifications || [];
    const valueProposition = d.value_proposition || d.vision || d.mission || null;

    return (
        <div className="bg-slate-50/50 flex flex-col h-full w-full custom-scrollbar overflow-y-auto">

            {/* ── Header / Hero Banner ── */}
            <div className="bg-white px-6 py-6 border-b border-slate-200/80 shadow-2xs sticky top-0 z-10 backdrop-blur-md bg-white/95">
                <div className="flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto w-full">
                    <div className="flex items-center gap-4 min-w-0">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0 text-slate-500 hover:text-slate-900"
                                title="Back"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        {/* Company Logo Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F47F2] to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md border border-indigo-400/30 text-2xl font-bold">
                            {companyName !== PH ? companyName.charAt(0) : '?'}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                                    {companyName}
                                </h2>
                                {companyType !== PH && (
                                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                        {companyType}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                                {website !== PH && (
                                    <a
                                        href={website.startsWith('http') ? website : `https://${website}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 hover:text-[#0F47F2] transition-colors"
                                    >
                                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate max-w-[180px]">{website}</span>
                                    </a>
                                )}
                                {headquarters !== PH && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{headquarters}</span>
                                    </span>
                                )}
                                {foundedYear !== PH && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Est. {foundedYear}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons & Rating */}
                    <div className="flex items-center gap-3 shrink-0">
                        {overallRating > 0 && (
                            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-full shadow-2xs">
                                <Star className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                                <span className="text-sm font-bold text-emerald-700">
                                    {overallRating.toFixed(1)} <span className="text-xs font-normal text-emerald-600">/ 5</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main Content Container ── */}
            <div className="p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col gap-8">

                {/* ── Overview & Value Proposition ── */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <div className="p-2 rounded-xl bg-indigo-50 text-[#0F47F2]">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Company Overview</h3>
                    </div>
                    
                    {companyOverview !== PH ? (
                        <p className="text-sm leading-relaxed text-slate-600 font-normal">
                            {companyOverview}
                        </p>
                    ) : (
                        <p className="text-sm italic text-slate-400">No detailed overview provided.</p>
                    )}

                    {valueProposition && valueProposition !== PH && (
                        <div className="mt-2 p-4 rounded-xl bg-gradient-to-r from-indigo-50/60 to-blue-50/40 border border-indigo-100/80 flex items-start gap-3 text-xs text-slate-700">
                            <Sparkles className="w-4 h-4 text-[#0F47F2] shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-slate-900">Value Proposition & Vision</span>
                                <span className="leading-relaxed text-slate-600">{valueProposition}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Key Metrics Grid (4 Stat Cards) ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Total Employees',
                            value: employeeCount,
                            icon: <Users className="w-5 h-5 text-indigo-600" />,
                            bg: 'bg-indigo-50/70',
                            border: 'border-indigo-100',
                        },
                        {
                            label: 'Annual Revenue',
                            value: annualRevenue,
                            icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
                            bg: 'bg-emerald-50/70',
                            border: 'border-emerald-100',
                        },
                        {
                            label: 'Growth Stage',
                            value: growthStage,
                            icon: <Zap className="w-5 h-5 text-purple-600" />,
                            bg: 'bg-purple-50/70',
                            border: 'border-purple-100',
                        },
                        {
                            label: 'Hiring Trend',
                            value: hiringTrend,
                            icon: <UserCheck className="w-5 h-5 text-amber-600" />,
                            bg: 'bg-amber-50/70',
                            border: 'border-amber-100',
                        },
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {stat.label}
                                </span>
                                <div className={`p-2 rounded-xl ${stat.bg} ${stat.border} border`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">
                                {stat.value !== PH ? stat.value : '--'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Leadership Team ── */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Leadership</h3>
                    </div>

                    {founders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {founders.map((founder: any, i: number) => {
                                const initials = getInitials(founder.name);
                                return (
                                    <div
                                        key={i}
                                        className="bg-slate-50/80 hover:bg-white rounded-xl p-4 border border-slate-200/70 shadow-2xs hover:shadow-md transition-all duration-200 flex items-start gap-3.5"
                                    >
                                        <div className="w-11 h-11 rounded-full  bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                                            {initials}
                                        </div>
                                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                                            <span className="text-sm font-bold text-slate-900 truncate">
                                                {founder.name || PH}
                                            </span>
                                            {founder.title && founder.title !== PH && (
                                                <span className="text-[11px] font-semibold text-[#0F47F2] bg-indigo-50/80 px-2 py-0.5 rounded-md self-start border border-indigo-100">
                                                    {founder.title}
                                                </span>
                                            )}
                                            {founder.bio && founder.bio !== PH && (
                                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mt-1">
                                                    {founder.bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <span className="text-sm italic text-slate-400">No leadership details listed.</span>
                    )}
                </div>

                {/* ── Tech Stack & Core Competencies ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tech Stack */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Tech Stack</h3>
                        </div>

                        {techStack.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {techStack.map((tech: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-blue-50 text-slate-700 hover:text-[#0F47F2] border border-slate-200/70 hover:border-blue-200 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F47F2]" />
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm italic text-slate-400">No tech stack details available.</span>
                        )}
                    </div>

                    {/* Core Competencies */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <Target className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Core Competencies</h3>
                        </div>

                        {coreCompetencies.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {coreCompetencies.map((comp: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200/70 hover:border-amber-200 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        {comp}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm italic text-slate-400">No core competencies listed.</span>
                        )}
                    </div>
                </div>

                {/* ── Culture & Values ── */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                            <Heart className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Culture & Values</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pros */}
                        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Pros</span>
                            </div>
                            {culturePros.length > 0 ? (
                                <ul className="flex flex-col gap-2">
                                    {culturePros.map((pro: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                            <span>{pro}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-xs italic text-slate-400">No pros listed.</span>
                            )}
                        </div>

                        {/* Cons */}
                        <div className="bg-rose-50/60 border border-rose-200/70 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                                <span>Cons</span>
                            </div>
                            {cultureCons.length > 0 ? (
                                <ul className="flex flex-col gap-2">
                                    {cultureCons.map((con: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                            <span>{con}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-xs italic text-slate-400">No cons listed.</span>
                            )}
                        </div>
                    </div>

                    {/* Core Values Pills */}
                    {coreValues.length > 0 && (
                        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Core Values</span>
                            <div className="flex flex-wrap gap-2">
                                {coreValues.map((val: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70 text-xs font-semibold"
                                    >
                                        {val}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Compliance, Certifications & Awards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    {/* Compliance */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Compliance & Security</h3>
                        </div>

                        {complianceCerts.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {complianceCerts.map((cert: string, i: number) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-lg bg-teal-50/70 text-teal-800 border border-teal-200/70 text-xs font-semibold flex items-center gap-1.5"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm italic text-slate-400">No compliance certifications listed.</span>
                        )}
                    </div>

                    {/* Awards */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <Award className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Awards & Recognition</h3>
                        </div>

                        {awards.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {awards.map((award: string, i: number) => (
                                    <div
                                        key={i}
                                        className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50/40 to-indigo-50/30 border border-amber-200/50 flex items-center gap-3"
                                    >
                                        <div className="p-2 rounded-lg bg-amber-100/80 text-amber-700 shrink-0">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-800 leading-snug">
                                            {award}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm italic text-slate-400">No awards listed.</span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CompanyInfoTab;
