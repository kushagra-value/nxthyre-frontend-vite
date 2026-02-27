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

// Rotating color palettes for dynamic data
const TECH_COLORS = [
    'bg-[#E7EDFF] text-[#0F47F2]',   // blue
    'bg-[#E7E5FF] text-[#6155F5]',   // purple
    'bg-[#F3F5F7] text-[#4B5563]',   // gray
];

const COMPETENCY_COLORS = [
    'bg-[#EBFFEE] text-[#009951]',   // green
    'bg-[#E7E5FF] text-[#6155F5]',   // purple
    'bg-[#FFF7D6] text-[#F59E0B]',   // amber
];

const COMPLIANCE_COLORS = [
    'bg-[#EBFFEE] text-[#009951]',   // green
    'bg-[#E5E5EA] text-[#4B5563]',   // gray
];

const CompanyInfoTab: React.FC<CompanyInfoTabProps> = ({ data, onBack, onEdit, onCreateJob }) => {
    if (!data) return <div className="text-center py-8 text-gray-500">No company details available.</div>;

    const d = data as CompanyResearchData;

    // Pull dynamic values from the API data
    const companyName = d.company_name || '';
    const website = d.website || '';
    const headquarters = d.headquarters || '';
    const foundedYear = d.founded_year || '';
    const companyType = d.company_type || d.industry || '';
    const overallRating = d.overall_rating || 0;
    const companyOverview = d.company_overview || '';
    const employeeCount = d.employee_count || '';
    const annualRevenue = d.annual_revenue || '';
    const growthStage = d.growth_stage || '';
    const hiringTrend = d.hiring_trend || '';
    const founders = d.founders || [];
    const techStack = d.tech_stack || [];
    const coreCompetencies = d.core_competencies || [];
    const culturePros = d.culture_pros || [];
    const cultureCons = d.culture_cons || [];
    const coreValues = d.core_values || [];
    const complianceCerts = d.compliance_certifications || [];
    const awards = d.awards_certifications || [];

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
                            {companyName?.charAt(0) || '?'}
                        </div>
                        <div className="flex flex-col gap-[10px] px-[10px]">
                            <h2 style={{ fontSize: '32px', lineHeight: '40px', fontWeight: 500 }} className="text-[#4B5563]">
                                {companyName}
                            </h2>
                            <div className="flex flex-wrap items-start gap-[15px]">
                                {website && (
                                    <span className="flex items-center gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                                        <Globe className="w-4 h-4 text-[#8E8E93]" /> {website}
                                    </span>
                                )}
                                {headquarters && (
                                    <span className="flex items-start gap-[5px] text-[12px] leading-[14px] text-[#8E8E93]">
                                        <MapPin className="w-4 h-4 text-[#8E8E93]" /> {headquarters}
                                    </span>
                                )}
                                {foundedYear && (
                                    <span className="flex items-start gap-[4px] text-[12px] leading-[14px] text-[#8E8E93]">
                                        <Calendar className="w-4 h-4 text-[#8E8E93]" /> Est. {foundedYear}
                                    </span>
                                )}
                                {companyType && (
                                    <span className="flex items-start gap-[4px] text-[12px] leading-[14px] text-[#8E8E93]">
                                        <Building2 className="w-4 h-4 text-[#8E8E93]" /> {companyType}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-[10px]">
                    {overallRating > 0 && (
                        <div className="flex items-center gap-[10px] px-[10px] h-[37px] rounded-[5px]" style={{ background: '#EBFFEE', border: '1px solid #34C759' }}>
                            <Star className="w-4 h-4 text-[#14AE5C] fill-[#AFF4C6]" style={{ stroke: '#14AE5C' }} />
                            <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-[#14AE5C]">
                                {overallRating} / 5
                            </span>
                        </div>
                    )}
                    <button onClick={onEdit} className="flex items-center gap-[5px] px-[10px] h-[37px] rounded-[5px] hover:opacity-90 transition-opacity" style={{ background: '#E7EDFF', border: '1px solid #0F47F2' }}>
                        <Edit className="w-4 h-4 text-[#0F47F2]" />
                        <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 400 }} className="text-[#0F47F2]">Edit</span>
                    </button>
                    <button onClick={onCreateJob} className="flex items-center gap-[5px] px-[10px] h-[37px] rounded-[5px] bg-[#0F47F2] hover:opacity-90 transition-opacity">
                        <Plus className="w-4 h-4 text-white" />
                        <span style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 400 }} className="text-white">Create Job</span>
                    </button>
                </div>
            </div>

            {/* ── Body Content ── */}
            <div className="px-[30px] pt-[20px] pb-[50px]">

                {/* ── Company Overview ── */}
                {companyOverview && (
                    <div className="pl-[25px] mb-[20px]">
                        <h3 className="flex items-center gap-[5px] mb-[20px]">
                            <Building2 className="w-5 h-5 text-[#4B5563]" />
                            <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Company Overview</span>
                        </h3>
                        <p style={{ fontSize: '14px', lineHeight: '24px', fontWeight: 400, maxWidth: '738px' }} className="text-[#727272]">
                            {companyOverview}
                        </p>
                    </div>
                )}

                {/* ── Stats Cards ── */}
                {(employeeCount || annualRevenue || growthStage || hiringTrend) && (
                    <div className="pl-[25px] flex flex-wrap gap-[30px] mb-[20px]">
                        {[
                            { label: 'Employees', value: employeeCount },
                            { label: 'Revenue', value: annualRevenue },
                            { label: 'Growth Stage', value: growthStage },
                            { label: 'Hiring Trend', value: hiringTrend },
                        ].filter(s => s.value).map((stat, idx) => (
                            <div key={idx} className="flex flex-col gap-[8px] bg-white rounded-[10px] p-[20px]" style={{ border: '0.5px solid #D1D1D6' }}>
                                <span style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }} className="text-[#4B5563]">{stat.label}</span>
                                <span style={{ fontSize: '24px', lineHeight: '29px', fontWeight: 500 }} className="text-black">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Divider */}
                <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>

                {/* ── Leadership ── */}
                {founders.length > 0 && (
                    <div className="pl-[25px] mb-[20px]">
                        <h3 className="flex items-center gap-[5px] mb-[20px]">
                            <Users className="w-5 h-5 text-[#4B5563]" />
                            <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Leadership</span>
                        </h3>
                        <div className="flex flex-wrap gap-[10px]">
                            {founders.map((founder: any, i: number) => (
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
                                        {founder.title && (
                                            <span style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }} className="text-[#0F47F2]">{founder.title}</span>
                                        )}
                                        {founder.bio && (
                                            <span style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }} className="text-[#4B5563]">{founder.bio}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(founders.length > 0) && <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>}

                {/* ── Tech Stack & Core Competencies ── */}
                {(techStack.length > 0 || coreCompetencies.length > 0) && (
                    <div className="flex gap-[40px] pl-[25px] mb-[20px]">
                        {techStack.length > 0 && (
                            <div className="flex-1">
                                <h3 className="flex items-center gap-[5px] mb-[20px]">
                                    <Layers className="w-5 h-5 text-[#4B5563]" />
                                    <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Tech Stack</span>
                                </h3>
                                <div className="flex flex-wrap gap-[10px]">
                                    {techStack.map((tech: string, i: number) => (
                                        <span key={i} className={`flex items-center justify-center py-[8px] px-[14px] rounded-full ${TECH_COLORS[i % TECH_COLORS.length]}`} style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }}>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {coreCompetencies.length > 0 && (
                            <div className="flex-1">
                                <h3 className="flex items-center gap-[5px] mb-[20px]">
                                    <Target className="w-4 h-4 text-[#4B5563]" />
                                    <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Core Competencies</span>
                                </h3>
                                <div className="flex flex-wrap gap-[10px]">
                                    {coreCompetencies.map((comp: string, i: number) => (
                                        <span key={i} className={`flex items-center justify-center py-[8px] px-[14px] rounded-full ${COMPETENCY_COLORS[i % COMPETENCY_COLORS.length]}`} style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }}>
                                            {comp}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {(techStack.length > 0 || coreCompetencies.length > 0) && <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>}

                {/* ── Culture & Values ── */}
                {(culturePros.length > 0 || cultureCons.length > 0 || coreValues.length > 0) && (
                    <div className="pl-[22px] mb-[20px]">
                        <h3 className="flex items-center gap-[5px] mb-[20px]">
                            <Heart className="w-4 h-4 text-[#4B5563]" />
                            <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Culture & Values</span>
                        </h3>

                        {culturePros.length > 0 && (
                            <div className="rounded-[10px] bg-[#EBFFEE] p-[20px] mb-[14px]" style={{ maxWidth: '380px' }}>
                                <h4 style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-[#4B5563] mb-[10px]">Pros</h4>
                                <ul className="flex flex-col gap-0">
                                    {culturePros.map((pro: string, i: number) => (
                                        <li key={i} style={{ fontSize: '14px', lineHeight: '24px', fontWeight: 400, listStyle: 'disc', marginLeft: '16px' }} className="text-[#727272]">
                                            {pro}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {cultureCons.length > 0 && (
                            <div className="rounded-[10px] bg-[#FEE9E7] p-[20px] mb-[20px]" style={{ maxWidth: '380px' }}>
                                <h4 style={{ fontSize: '14px', lineHeight: '17px', fontWeight: 500 }} className="text-[#4B5563] mb-[10px]">Cons</h4>
                                <ul className="flex flex-col gap-0">
                                    {cultureCons.map((con: string, i: number) => (
                                        <li key={i} style={{ fontSize: '14px', lineHeight: '24px', fontWeight: 400, listStyle: 'disc', marginLeft: '16px' }} className="text-[#727272]">
                                            {con}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {coreValues.length > 0 && (
                            <div className="flex flex-wrap gap-[10px]">
                                {coreValues.map((val: string, i: number) => (
                                    <span key={i} className="flex items-center justify-center py-[8px] px-[14px] rounded-full bg-[#E7E5FF] text-[#6155F5]" style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }}>
                                        {val}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(culturePros.length > 0 || cultureCons.length > 0 || coreValues.length > 0) && <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>}

                {/* ── Compliance & Security ── */}
                {complianceCerts.length > 0 && (
                    <div className="pl-[22px] mb-[20px]">
                        <h3 className="flex items-center gap-[7px] mb-[20px]">
                            <ShieldCheck className="w-4 h-4 text-[#4B5563]" />
                            <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Compliance & Security</span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-[10px]">
                            {complianceCerts.map((cert: string, i: number) => (
                                <span key={i} className={`flex items-center justify-center py-[8px] px-[14px] rounded-full ${COMPLIANCE_COLORS[i % COMPLIANCE_COLORS.length]}`} style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400 }}>
                                    {cert}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {complianceCerts.length > 0 && <div style={{ borderBottom: '0.5px solid #C7C7CC' }} className="mb-[20px]"></div>}

                {/* ── Awards & Recognition ── */}
                {awards.length > 0 && (
                    <div className="pl-[0px] mb-[50px]">
                        <h3 className="flex items-center gap-[7px] mb-[20px]">
                            <Award className="w-4 h-4 text-[#4B5563]" />
                            <span style={{ fontSize: '18px', lineHeight: '22px', fontWeight: 500 }} className="text-[#4B5563]">Awards & Recognition</span>
                        </h3>
                        <div className="flex flex-wrap gap-[15px]">
                            {awards.map((award: string, i: number) => (
                                <div key={i} className="flex flex-col justify-between items-start p-[20px] gap-[8px] bg-[#E7EDFF] rounded-[10px]" style={{ width: '204px', height: '98px' }}>
                                    <div className="w-[20px] h-[20px] rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                                        <Award className="w-[16px] h-[16px] text-[#0F47F2]" />
                                    </div>
                                    <span style={{ fontSize: '12px', lineHeight: '14px', fontWeight: 400, width: '164px' }} className="text-[#4B5563]">{award}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyInfoTab;
