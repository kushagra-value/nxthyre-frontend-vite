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
    Briefcase
} from 'lucide-react';

interface CompanyInfoTabProps {
    data: CompanyResearchData;
}

const CompanyInfoTab: React.FC<CompanyInfoTabProps> = ({ data }) => {
    if (!data) return <div className="text-center py-8 text-gray-500">No company details available.</div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Section */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.company_name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {data.website && (
                            <a href={`https://${data.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600 transition-colors">
                                <Globe className="w-4 h-4 mr-1" />
                                {data.website}
                            </a>
                        )}
                        {data.headquarters && (
                            <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {data.headquarters}
                            </span>
                        )}
                        {data.founded_year && (
                            <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Est. {data.founded_year}
                            </span>
                        )}
                        {data.company_type && (
                            <span className="flex items-center">
                                <Building2 className="w-4 h-4 mr-1" />
                                {data.company_type}
                            </span>
                        )}
                    </div>
                </div>
                {data.overall_rating && (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                            <span className="text-yellow-500 text-lg mr-1">★</span>
                            <span className="font-bold text-gray-900">{data.overall_rating}</span>
                            <span className="text-gray-400 text-xs ml-1">/ 5</span>
                        </div>
                        {data.rating_source && <span className="text-xs text-gray-400 mt-1">via {data.rating_source}</span>}
                    </div>
                )}
            </div>

            {/* Vision & Mission */}
            {(data.vision || data.mission) && (
                <div className="grid md:grid-cols-2 gap-6">
                    {data.vision && (
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                            <h3 className="flex items-center text-blue-900 font-semibold mb-3">
                                <Target className="w-5 h-5 mr-2" />
                                Vision
                            </h3>
                            <p className="text-blue-800/80 text-sm leading-relaxed italic">"{data.vision}"</p>
                        </div>
                    )}
                    {data.mission && (
                        <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                            <h3 className="flex items-center text-purple-900 font-semibold mb-3">
                                <Target className="w-5 h-5 mr-2" />
                                Mission
                            </h3>
                            <p className="text-purple-800/80 text-sm leading-relaxed italic">"{data.mission}"</p>
                        </div>
                    )}
                </div>
            )}

            {/* Overview & Story */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-gray-500" />
                    Company Overview
                </h3>
                {data.company_overview && <p className="text-gray-600 leading-relaxed text-sm">{data.company_overview}</p>}
                {data.founding_story && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Founding Story</h4>
                        <p className="text-gray-600 text-sm">{data.founding_story}</p>
                    </div>
                )}
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Employees', value: data.employee_count, icon: Users },
                    { label: 'Revenue', value: data.annual_revenue, icon: DollarSign },
                    { label: 'Growth Stage', value: data.growth_stage, icon: TrendingUp },
                    { label: 'Hiring Trend', value: data.hiring_trend, icon: TrendingUp },
                ].map((stat, idx) => (
                    stat.value ? (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center text-gray-400 mb-2">
                                <stat.icon className="w-4 h-4 mr-2" />
                                <span className="text-xs uppercase font-medium">{stat.label}</span>
                            </div>
                            <div className="font-semibold text-gray-900">{stat.value}</div>
                        </div>
                    ) : null
                ))}
            </div>

            {/* Leadership */}
            {data.founders && data.founders.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-gray-500" />
                        Leadership
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {data.founders.map((founder, i) => (
                            <div key={i} className="flex items-start p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center text-gray-500 font-bold mr-3 flex-shrink-0">
                                    {founder.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{founder.name}</div>
                                    <div className="text-xs text-gray-500 mt-1">{founder.bio}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tech Stack & Core Competencies */}
            <div className="grid md:grid-cols-2 gap-8">
                {data.tech_stack && data.tech_stack.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.tech_stack.map((tech, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {data.core_competencies && data.core_competencies.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Core Competencies</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.core_competencies.map((tech, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Culture Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Culture & Values
                </h3>

                {data.core_values && (
                    <div className="mb-6 flex flex-wrap gap-2">
                        {data.core_values.map((val, i) => (
                            <span key={i} className="px-3 py-1 bg-white text-indigo-700 shadow-sm rounded-lg text-sm font-medium">
                                {val}
                            </span>
                        ))}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {data.culture_pros && data.culture_pros.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                Pros
                            </h4>
                            <ul className="space-y-2">
                                {data.culture_pros.map((pro, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start">
                                        <span className="mr-2 opacity-60">•</span> {pro}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {data.culture_cons && data.culture_cons.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                Cons
                            </h4>
                            <ul className="space-y-2">
                                {data.culture_cons.map((con, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start">
                                        <span className="mr-2 opacity-60">•</span> {con}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Compliance & Security */}
            {(data.compliance_certifications?.length > 0 || data.data_privacy_practices) && (
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2 text-slate-500" />
                        Compliance & Security
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {data.compliance_certifications?.map((cert, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">
                                {cert}
                            </span>
                        ))}
                    </div>
                    {data.data_privacy_practices && (
                        <p className="text-xs text-slate-500 italic">{data.data_privacy_practices}</p>
                    )}
                </div>
            )}

            {/* Awards */}
            {data.awards_certifications && data.awards_certifications.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Awards & Recognition
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-2">
                        {data.awards_certifications.map((award, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center">
                                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 flex-shrink-0"></span>
                                {award}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CompanyInfoTab;
