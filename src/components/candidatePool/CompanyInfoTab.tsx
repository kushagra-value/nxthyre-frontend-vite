import React from 'react';
import { CompanyResearchData } from '../../services/organizationService';
import {
    Building2,
    Users,
    Globe,
    Target,
    Award,
    TrendingUp,
    ShieldCheck,
    Heart,
    DollarSign,
    MapPin,
    Calendar,
    Briefcase,
    ArrowLeft,
    Star,
    Edit,
    Plus,
    Layers
} from 'lucide-react';

interface CompanyInfoTabProps {
    data: CompanyResearchData;
    onBack?: () => void;
    onEdit?: () => void;
    onCreateJob?: () => void;
}

const CompanyInfoTab: React.FC<CompanyInfoTabProps> = ({ data, onBack, onEdit, onCreateJob }) => {
    if (!data) return <div className="text-center py-8 text-gray-500">No company details available.</div>;

    const parsedData = data || {} as any;

    return (
        <div className="bg-white flex flex-col h-full font-sans w-full">
            {/* Header Section */}
            <div className="px-6 py-6 border-b border-gray-100 flex flex-wrap gap-4 items-start justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                    <div className="w-16 h-16 rounded-full bg-[#FF7162] text-white flex items-center justify-center text-3xl font-bold shrink-0">
                        {parsedData.company_name?.charAt(0) || 'J'}
                    </div>
                    <div>
                        <h2 className="text-[26px] font-semibold text-gray-900 mb-1">{parsedData.company_name || 'Jupiter'}</h2>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 opacity-70" /> {parsedData.website || 'jupiter.money'}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 opacity-70" /> {parsedData.headquarters || 'Bengaluru, Karnataka'}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-70" /> Est. {parsedData.founded_year || '2019'}</span>
                            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 opacity-70" /> Fintech</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EBFFEE] border border-[#34C759] rounded-md text-sm font-medium text-[#14AE5C]">
                        <Star className="w-4 h-4 fill-current outline-none" /> {parsedData.overall_rating || '4.2'} / 5
                    </div>
                    <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#E7EDFF] text-[#0F47F2] rounded-md text-sm font-medium hover:bg-[#D7E3FF] transition-colors">
                        <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={onCreateJob} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0F47F2] text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                        <Plus className="w-4 h-4" /> Create Job
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
                {/* Overview */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[#4B5563] flex items-center gap-2">
                        <Building2 className="w-4 h-4 opacity-70" />
                        Company Overview
                    </h3>
                    <p className="text-[13px] text-[#4B5563] leading-relaxed font-light">
                        {parsedData.company_overview || 'Jupiter is a neo-banking fintech startup headquartered in Bengaluru, offering a full-stack digital banking experience — including a savings account, UPI, smart spending insights, and rewarding cashback. Founded in 2019 by Jitendra Gupta, Jupiter is backed by Tiger Global, Sequoia India, and Matrix Partners. It serves over 2 million customers across India and is building the next generation of personal finance tools powered by AI and data.'}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {[
                            { label: 'Employees', value: parsedData.employee_count || '850+' },
                            { label: 'Revenue', value: parsedData.annual_revenue || '~₹120Cr' },
                            { label: 'Growth Stage', value: parsedData.growth_stage || 'Series C' },
                            { label: 'Hiring Trend', value: parsedData.hiring_trend || 'Growing' },
                        ].map((stat, idx) => (
                            <div key={idx} className="border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-center bg-white shadow-sm">
                                <span className="text-[11px] text-[#4B5563] mb-1">{stat.label}</span>
                                <span className="text-xl font-medium text-black">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Leadership */}
                <div>
                    <h3 className="text-sm font-semibold text-[#4B5563] flex items-center gap-2 mb-4">
                        <Users className="w-4 h-4 opacity-70" />
                        Leadership
                    </h3>
                    {parsedData.founders && parsedData.founders.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            {parsedData.founders.map((founder: any, i: number) => (
                                <div key={i} className="flex items-center p-3 bg-[#EEF2FF] rounded-xl border border-[#E0E7FF]">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden shrink-0">
                                        <img src={`https://ui-avatars.com/api/?name=${founder.name.split(' ').join('+')}&background=random`} alt={founder.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-semibold text-black">{founder.name}</div>
                                        <div className="text-[11px] text-[#0F47F2] font-medium mb-0.5">{founder.title || 'Leader'}</div>
                                        <div className="text-[10px] text-[#4B5563] line-clamp-1">{founder.bio}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="flex items-center p-3 bg-[#EEF2FF] rounded-xl border border-[#E0E7FF]">
                                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden shrink-0">
                                    <img src={`https://ui-avatars.com/api/?name=Jitendra+Gupta&background=random`} alt="Leader" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-[13px] font-semibold text-black">Jitendra Gupta</div>
                                    <div className="text-[11px] text-[#0F47F2] font-medium mb-0.5">Founder & CEO</div>
                                    <div className="text-[10px] text-[#4B5563]">Previously MD at PayU India</div>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-[#EEF2FF] rounded-xl border border-[#E0E7FF]">
                                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden shrink-0">
                                    <img src={`https://ui-avatars.com/api/?name=Shobhit+Puri&background=random`} alt="Leader" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-[13px] font-semibold text-black">Shobhit Puri</div>
                                    <div className="text-[11px] text-[#0F47F2] font-medium mb-0.5">Co-founder & CTO</div>
                                    <div className="text-[10px] text-[#4B5563]">Ex-Ola, IIT Bombay</div>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-[#EEF2FF] rounded-xl border border-[#E0E7FF]">
                                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden shrink-0">
                                    <img src={`https://ui-avatars.com/api/?name=Arpit+Khandelwal&background=random`} alt="Leader" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-[13px] font-semibold text-black">Arpit Khandelwal</div>
                                    <div className="text-[11px] text-[#0F47F2] font-medium mb-0.5">VP Product</div>
                                    <div className="text-[10px] text-[#4B5563]">Ex-Flipkart, IIM Ahmedabad</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Tech Stack & Core Competencies */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-[#4B5563] flex items-center gap-2 mb-4">
                            <Layers className="w-4 h-4 opacity-70" />
                            Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                            {(parsedData.tech_stack?.length ? parsedData.tech_stack : ['React Native', 'Node.js', 'Python', 'AWS', 'Kafka', 'PostgreSQL', 'Redis', 'ML / AI']).map((tech: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-[#EEF2FF] text-[#0F47F2] rounded-full text-[11px] font-medium">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-[#4B5563] flex items-center gap-2 mb-4">
                            <Target className="w-4 h-4 opacity-70" />
                            Core Competencies
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                            {(parsedData.core_competencies?.length ? parsedData.core_competencies : ['Fintech', 'Neo-banking', 'UX Design', 'Data Science', 'Product Growth', 'Risk & Compliance']).map((tech: string, i: number) => {
                                const colors = ['bg-[#EBFFEE] text-[#069855]', 'bg-[#F3E8FF] text-[#7E22CE]', 'bg-[#FFF7D6] text-[#D97706]'];
                                const colorClass = colors[i % colors.length];
                                return (
                                    <span key={i} className={`px-3 py-1 rounded-full text-[11px] font-medium ${colorClass}`}>
                                        {tech}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Culture & Values */}
                <div>
                    <h3 className="text-sm font-semibold text-[#4B5563] flex items-center gap-2 mb-4">
                        <Heart className="w-4 h-4 opacity-70" />
                        Culture & Values
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-5">
                        <div className="bg-[#F0FDF4] p-5 rounded-xl border border-[#BBF7D0]">
                            <h4 className="text-xs font-semibold text-[#166534] mb-3 flex items-center gap-2">
                                Pros
                            </h4>
                            <ul className="space-y-2.5">
                                {(parsedData.culture_pros?.length ? parsedData.culture_pros : [
                                    'Strong design & product culture',
                                    'ESOPs offered at competitive strike price',
                                    'Flat hierarchy, direct access to founders',
                                    'Fast-growing with clear career paths'
                                ]).map((pro: string, i: number) => (
                                    <li key={i} className="text-[12px] text-[#166534] flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#166534] shrink-0 mt-1 opacity-60"></span>
                                        <span>{pro}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-[#FEF2F2] p-5 rounded-xl border border-[#FECACA]">
                            <h4 className="text-xs font-semibold text-[#991B1B] mb-3 flex items-center gap-2">
                                Cons
                            </h4>
                            <ul className="space-y-2.5">
                                {(parsedData.culture_cons?.length ? parsedData.culture_cons : [
                                    'High pace — not for everyone',
                                    'Processes still maturing (Series C)',
                                    'Limited remote flexibility for core roles'
                                ]).map((con: string, i: number) => (
                                    <li key={i} className="text-[12px] text-[#991B1B] flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B] shrink-0 mt-1 opacity-60"></span>
                                        <span>{con}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {(parsedData.core_values?.length ? parsedData.core_values : ['User Obsessed', 'Radical Transparency', 'Move Fast', 'Own It', 'Stay Curious']).map((val: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-[#EEF2FF] text-[#0F47F2] rounded-full text-[11px] font-medium">
                                {val}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Compliance & Security */}
                <div>
                    <h3 className="text-sm font-semibold text-[#4B5563] flex items-center gap-2 mb-4">
                        <ShieldCheck className="w-4 h-4 opacity-70" />
                        Compliance & Security
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                        {(parsedData.compliance_certifications?.length ? parsedData.compliance_certifications : ['RBI Licensed', 'PCI-DSS Compliant', 'ISO 27001', 'SOC 2 (in progress)']).map((cert: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-[#F9FAFB] border border-[#E5E7EB] text-[#069855] rounded-full text-[11px] font-medium">
                                {cert}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-100"></div>

                {/* Awards */}
                <div>
                    <h3 className="text-sm font-semibold text-[#4B5563] flex items-center gap-2 mb-4">
                        <Award className="w-4 h-4 opacity-70" />
                        Awards & Recognition
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4 pb-6">
                        {(parsedData.awards_certifications?.length ? parsedData.awards_certifications : [
                            'Best Fintech UX — Google Play India Awards 2023',
                            "India's Top 50 Startups to Work For — LinkedIn 2023",
                            'ET Startup of the Year — Fintech Category 2022',
                            'Glassdoor Top Rated CEO — Jitendra Gupta, 91% approval'
                        ]).map((award: string, i: number) => (
                            <div key={i} className="p-4 bg-[#EEF2FF] rounded-xl flex flex-col gap-3 justify-center">
                                <div className="w-7 h-7 rounded bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#E0E7FF]">
                                    <Award className="w-4 h-4 text-[#0F47F2]" />
                                </div>
                                <span className="text-[11px] leading-relaxed text-[#4B5563] font-medium">{award}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfoTab;

