import React from 'react';
import { CompanyResearchData } from '../../services/organizationService';
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

// Tech stack color mapping per the design spec
const getTechStackStyle = (tech: string): string => {
    const blueItems = ['React Native', 'Node.js', 'Python', 'ML / AI'];
    const purpleItems = ['AWS', 'Kafka'];
    // PostgreSQL, Redis → gray
    if (blueItems.includes(tech)) return 'bg-[#E7EDFF] text-[#0F47F2]';
    if (purpleItems.includes(tech)) return 'bg-[#E7E5FF] text-[#6155F5]';
    return 'bg-[#F3F5F7] text-[#4B5563]';
};

// Core competencies color mapping per the design spec
const getCompetencyStyle = (comp: string): string => {
    const greenItems = ['Fintech', 'Neo-banking', 'UX Design'];
    const purpleItems = ['Data Science'];
    // Product Growth, Risk & Compliance → amber
    if (greenItems.includes(comp)) return 'bg-[#EBFFEE] text-[#009951]';
    if (purpleItems.includes(comp)) return 'bg-[#E7E5FF] text-[#6155F5]';
    return 'bg-[#FFF7D6] text-[#F59E0B]';
};

// Compliance cert color mapping
const getComplianceStyle = (cert: string): string => {
    if (cert.toLowerCase().includes('soc')) return 'bg-[#E5E5EA] text-[#4B5563]';
    return 'bg-[#EBFFEE] text-[#009951]';
};

const CompanyInfoTab: React.FC<CompanyInfoTabProps> = ({ data, onBack, onEdit, onCreateJob }) => {
    if (!data) return <div className="text-center py-8 text-gray-500">No company details available.</div>;

    const d = data || {} as any;

    return (
        <div className="bg-white flex flex-col h-full w-full" style={{ overflowY: 'scroll' }}>

            {/* ── Header ── */}
            <div className="px-[30px] py-[36px] flex flex-wrap gap-[30px] items-center justify-between" style={{ borderBottom: '0.5px solid #C7C7CC' }}>
                <div className="flex items-center gap-[10px]">
                    {onBack && (
                        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-[#4B5563]" />
                        </button>
                    )}
                    <div className="flex items-center gap-[10px]">
                        {/* 86×86 avatar */}
                        <div className="w-[86px] h-[86px] rounded-full bg-[#FF7162] text-white flex items-center justify-center shrink-0" style={{ fontSize: '36px', fontWeight: 500 }}>
                            {d.company_name?.charAt(0) || 'J'}
                        </div>
                        <div className="flex flex-col gap-[10px] px-[10px]">
                            {/* Company Name — 32px Gellix 500 */}
                            <h2 style={{ fontSize: '32px', lineHeight: '40px', fontWeight: 500 }} className="text-[#4B5563]">
                                {d.company_name || 'Jupiter'}
                            </h2>
                            {/* Sub-meta — 12px Gellix 400 #8E8E93 */}
                            <div className="flex flex-wrap items-start gap-[15px]">
                                <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                                    <Globe className="w-4 h-4 text-[#8E8E93]" /> {d.website || 'jupiter.money'}
                                </span>
                                <span className="flex items-start gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                                    <MapPin className="w-4 h-4 text-[#8E8E93]" /> {d.headquarters || 'Bengaluru, Karnataka'}
                                </span>
                                <span className="flex items-start gap-[4px] text-[12px] leading-[14px] text-[#8E8E93]">
                                    <Calendar className="w-4 h-4 text-[#8E8E93]" /> Est. {d.founded_year || '2019'}
                                </span>
                                <span className="flex items-start gap-[4px] text-[12px] leading-[14px] text-[#8E8E93]">
                                    <Building2 className="w-4 h-4 text-[#8E8E93]" /> {d.company_type || 'Fintech'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-[10px]">
                    {/* Rating badge */}
                    <div className="flex items-center gap-[10px] px-[10px] h-[37px] rounded-[5px]" style={{ background: '#EBFFEE', border: '1px solid #34C759' }}>
                        <Star className="w-4 h-4 text-[#14AE5C] fill-[#AFF4C6]" style={{ stroke: '#14AE5C' }} />
                        <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-[#14AE5C]">
                            {d.overall_rating || '4.2'} / 5
                        </span>
                    </div>
                    {/* Edit */}
                    <button onClick={onEdit} className="flex items-center gap-[5px] px-[10px] h-[37px] rounded-[5px] hover:opacity-90 transition-opacity" style={{ background: '#E7EDFF', border: '1px solid #0F47F2' }}>
                        <Edit className="w-4 h-4 text-[#0F47F2]" />
                        <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 400 }} className="text-[#0F47F2]">Edit</span>
                    </button>
                    {/* Create Job */}
                    <button onClick={onCreateJob} className="flex items-center gap-[5px] px-[10px] h-[37px] rounded-[5px] bg-[#0F47F2] hover:opacity-90 transition-opacity">
                        <Plus className="w-4 h-4 text-white" />
                        <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 400 }} className="text-white">Create Job</span>
                    </button>
                </div>
            </div>

            {/* ── Body Content ── */}
            <div className="px-[30px] pt-[20px] pb-[50px]">

                {/* ── Company Overview ── */}
                <div className="pl-[25px] mb-[20px]">
                    <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <Building2 className="w-5 h-5 text-[#4B5563]" />
                        <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Company Overview</span>
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: '24px', fontWeight: 400, maxWidth: '738px' }} className="text-[#727272]">
                        {d.company_overview || 'Jupiter is a neo-banking fintech startup headquartered in Bengaluru, offering a full-stack digital banking experience — including a savings account, UPI, smart spending insights, and rewarding cashback. Founded in 2019 by Jitendra Gupta, Jupiter is backed by Tiger Global, Sequoia India, and Matrix Partners. It serves over 2 million customers across India and is building the next generation of personal finance tools powered by AI and data.'}
                    </p>
                </div>

                {/* ── Stats Cards ── */}
                <div className="pl-[25px] flex flex-wrap gap-[30px] mb-[20px]">
                    {[
                        { label: 'Employees', value: d.employee_count || '850+' },
                        { label: 'Revenue', value: d.annual_revenue || '~₹120Cr' },
                        { label: 'Growth Stage', value: d.growth_stage || 'Series C' },
                        { label: 'Hiring Trend', value: d.hiring_trend || 'Growing' },
                    ].map((stat, idx) => (
                        <div key={idx} className="flex flex-col gap-[8px] bg-white rounded-[10px] p-[20px]" style={{ border: '0.5px solid #D1D1D6' }}>
                            <span style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }} className="text-[#4B5563]">{stat.label}</span>
                            <span style={{ fontSize: '24px', lineHeight: '29px', fontWeight: 500 }} className="text-black">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                {/* ── Leadership ── */}
                <div className="pl-[25px] mb-[20px]">
                    <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <Users className="w-5 h-5 text-[#4B5563]" />
                        <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Leadership</span>
                    </h3>
                    <div className="flex flex-wrap gap-[10px]">
                        {(d.founders?.length ? d.founders : [
                            { name: 'Jitendra Gupta', title: 'Founder & CEO', bio: 'Previously MD at PayU India' },
                            { name: 'Shobhit Puri', title: 'Co-founder & CTO', bio: 'Ex-Ola, IIT Bombay' },
                            { name: 'Arpit Khandelwal', title: 'VP Product', bio: 'Ex-Flipkart, IIM Ahmedabad' },
                        ]).map((founder: any, i: number) => (
                            <div key={i} className="flex items-center gap-[10px] p-[10px] bg-[#E7EDFF] rounded-[10px]">
                                <div className="w-[32px] h-[32px] rounded-full bg-gray-300 overflow-hidden shrink-0">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${(founder.name || '').split(' ').join('+')}&background=random&size=64`}
                                        alt={founder.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col gap-[4px]">
                                    <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-black">{founder.name}</span>
                                    <span style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }} className="text-[#0F47F2]">{founder.title || 'Leader'}</span>
                                    <span style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }} className="text-[#4B5563]">{founder.bio}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                {/* ── Tech Stack & Core Competencies ── */}
                <div className="flex gap-[40px] pl-[25px] mb-[20px]">
                    {/* Tech Stack */}
                    <div className="flex-1">
                        <h3 className="flex items-center gap-[5px] mb-[20px]">
                            <Layers className="w-5 h-5 text-[#4B5563]" />
                            <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Tech Stack</span>
                        </h3>
                        <div className="flex flex-wrap gap-[10px]">
                            {(d.tech_stack?.length ? d.tech_stack : ['React Native', 'Node.js', 'Python', 'AWS', 'Kafka', 'PostgreSQL', 'Redis', 'ML / AI']).map((tech: string, i: number) => (
                                <span key={i} className={`flex items-center justify-center py-[8px] px-[14px] rounded-full ${getTechStackStyle(tech)}`} style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }}>
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Core Competencies */}
                    <div className="flex-1">
                        <h3 className="flex items-center gap-[5px] mb-[20px]">
                            <Target className="w-4 h-4 text-[#4B5563]" />
                            <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Core Competencies</span>
                        </h3>
                        <div className="flex flex-wrap gap-[10px]">
                            {(d.core_competencies?.length ? d.core_competencies : ['Fintech', 'Neo-banking', 'UX Design', 'Data Science', 'Product Growth', 'Risk & Compliance']).map((comp: string, i: number) => (
                                <span key={i} className={`flex items-center justify-center py-[8px] px-[14px] rounded-full ${getCompetencyStyle(comp)}`} style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }}>
                                    {comp}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                {/* ── Culture & Values ── */}
                <div className="pl-[22px] mb-[20px]">
                    <h3 className="flex items-center gap-[5px] mb-[20px]">
                        <Heart className="w-4 h-4 text-[#4B5563]" />
                        <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Culture & Values</span>
                    </h3>

                    {/* Pros */}
                    <div className="rounded-[10px] bg-[#EBFFEE] p-[20px] mb-[14px]" style={{ maxWidth: '380px' }}>
                        <h4 style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-[#4B5563] mb-[10px]">Pros</h4>
                        <ul className="flex flex-col gap-0">
                            {(d.culture_pros?.length ? d.culture_pros : [
                                'Strong design & product culture',
                                'ESOPs offered at competitive strike price',
                                'Flat hierarchy, direct access to founders',
                                'Fast-growing with clear career paths'
                            ]).map((pro: string, i: number) => (
                                <li key={i} style={{ fontSize: '14px', lineHeight: '24px', fontWeight: 400, listStyle: 'disc', marginLeft: '16px' }} className="text-[#727272]">
                                    {pro}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cons */}
                    <div className="rounded-[10px] bg-[#FEE9E7] p-[20px] mb-[20px]" style={{ maxWidth: '380px' }}>
                        <h4 style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-[#4B5563] mb-[10px]">Cons</h4>
                        <ul className="flex flex-col gap-0">
                            {(d.culture_cons?.length ? d.culture_cons : [
                                'High pace — not for everyone',
                                'Processes still maturing (Series C)',
                                'Limited remote flexibility for core roles'
                            ]).map((con: string, i: number) => (
                                <li key={i} style={{ fontSize: '14px', lineHeight: '24px', fontWeight: 400, listStyle: 'disc', marginLeft: '16px' }} className="text-[#727272]">
                                    {con}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Core Values Pills */}
                    <div className="flex flex-wrap gap-[10px]">
                        {(d.core_values?.length ? d.core_values : ['User Obsessed', 'Radical Transparency', 'Move Fast', 'Own It', 'Stay Curious']).map((val: string, i: number) => (
                            <span key={i} className="flex items-center justify-center py-[8px] px-[14px] rounded-full bg-[#E7E5FF] text-[#6155F5]" style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }}>
                                {val}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                {/* ── Compliance & Security ── */}
                <div className="pl-[22px] mb-[20px]">
                    <h3 className="flex items-center gap-[7px] mb-[20px]">
                        <ShieldCheck className="w-4 h-4 text-[#4B5563]" />
                        <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Compliance & Security</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-[10px]">
                        {(d.compliance_certifications?.length ? d.compliance_certifications : ['RBI Licensed', 'PCI-DSS Compliant', 'ISO 27001', 'SOC 2 (in progress)']).map((cert: string, i: number) => (
                            <span key={i} className={`flex items-center justify-center py-[8px] px-[14px] rounded-full ${getComplianceStyle(cert)}`} style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }}>
                                {cert}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                {/* ── Awards & Recognition ── */}
                <div className="pl-[0px] mb-[50px]">
                    <h3 className="flex items-center gap-[7px] mb-[20px]">
                        <Award className="w-4 h-4 text-[#4B5563]" />
                        <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Awards & Recognition</span>
                    </h3>
                    <div className="flex flex-wrap gap-[15px]">
                        {(d.awards_certifications?.length ? d.awards_certifications : [
                            'Best Fintech UX — Google Play India Awards 2023',
                            "India's Top 50 Startups to Work For — LinkedIn 2023",
                            'ET Startup of the Year — Fintech Category 2022',
                            'Glassdoor Top Rated CEO — Jitendra Gupta, 91% approval'
                        ]).map((award: string, i: number) => (
                            <div key={i} className="flex flex-col justify-between items-start p-[20px] gap-[8px] bg-[#E7EDFF] rounded-[10px]" style={{ width: '204px', height: '98px' }}>
                                <div className="w-[20px] h-[20px] rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                                    <Award className="w-[16px] h-[16px] text-[#0F47F2]" />
                                </div>
                                <span style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400, width: '164px' }} className="text-[#4B5563]">{award}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfoTab;
