import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  HelpCircle,
  Settings as SettingsReactIcon,
  LogOut,
} from 'lucide-react';
import { scheduleService } from '../../services/scheduleService';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

/* ─── Polished Lucide Icon Components ─── */

const DashboardIcon = ({ active }: { active: boolean }) => (
  <LayoutDashboard
    size={20}
    color={active ? '#0F47F2' : '#4B5563'}
    strokeWidth={active ? 2.2 : 2}
  />
);

const CompaniesIcon = ({ active }: { active: boolean }) => (
  <Building2
    size={20}
    color={active ? '#0F47F2' : '#4B5563'}
    strokeWidth={active ? 2.2 : 2}
  />
);

const CandidatesIcon = ({ active }: { active: boolean }) => (
  <Users
    size={20}
    color={active ? '#0F47F2' : '#4B5563'}
    strokeWidth={active ? 2.2 : 2}
  />
);

const ScheduleIcon = ({ active }: { active: boolean }) => (
  <CalendarDays
    size={20}
    color={active ? '#0F47F2' : '#4B5563'}
    strokeWidth={active ? 2.2 : 2}
  />
);

const HelpIcon = ({ active }: { active: boolean }) => (
  <HelpCircle
    size={20}
    color={active ? '#0F47F2' : '#4B5563'}
    strokeWidth={active ? 2.2 : 2}
  />
);

const LogoutIcon = ({ active }: { active: boolean }) => (
  <LogOut
    size={20}
    color={active ? '#0F47F2' : '#4B5563'}
    strokeWidth={active ? 2.2 : 2}
  />
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <SettingsReactIcon
    size={20}
    color={active ? '#0F47F2' : '#4B5563'}
    strokeWidth={active ? 2.2 : 2}
  />
);

/* ─── nxthyre Logo (Expanded) ─── */
const LogoExpanded = () => (
  <svg width="96" height="38" viewBox="0 0 96 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_94_1417" fill="white">
      <path d="M0 22C0 9.84974 9.90333 0 22.1197 0H48.2612V14C48.2612 27.2548 37.4576 38 24.1306 38H0V22Z" />
      <path d="M13.7031 14.0907C15.2112 14.0907 16.4052 14.4961 17.285 15.4414C18.1647 16.3867 18.6046 17.6758 18.6046 19.3086V26H15.9064V19.6367C15.9064 18.7148 15.6433 17.9766 15.117 17.4219C14.5985 16.8672 13.9112 16.5898 13.055 16.5898C12.1674 16.5898 11.4565 16.8672 10.9224 17.4219C10.3961 17.9766 10.133 18.7148 10.133 19.6367V26H7.45833L7.45833 14.0907H10.133L10.133 16.1094C10.51 15.4453 11.0049 14.9336 11.6176 14.5742C12.2303 14.207 12.9254 14.0907 13.7031 14.0907Z" />
      <path d="M31.8835 26H28.6551L25.9333 22.2031L23.2233 26H20.0185L24.3309 19.9531L20.2329 14.0825H23.5218L25.9569 17.6914L28.3892 14.0866H31.5942L27.5711 19.9297L31.8835 26Z" />
      <path d="M40.6143 16.8125H37.5155V21.5352C37.5155 22.2461 37.7119 22.7734 38.1047 23.1172C38.5053 23.4531 39.0512 23.6211 39.7424 23.6211C40.0802 23.6211 40.3708 23.5898 40.6143 23.5273V26C40.198 26.0938 39.7149 26.1406 39.1651 26.1406C37.8376 26.1406 36.7811 25.7461 35.9956 24.957C35.2101 24.168 34.8173 23.043 34.8173 21.582V16.8125H32.5787L32.6213 14.0866H34.8173L34.8173 11.1172H37.5155L37.5155 14.0866H40.6143V16.8125Z" />
      <path d="M57.7304 14.0938C59.2464 14.0938 60.4482 14.5625 61.3358 15.5C62.2313 16.4297 62.6791 17.6914 62.6791 19.2852V26.1515H60.9117L60.9117 19.4492C60.9117 18.332 60.5857 17.4375 59.9337 16.7656C59.2896 16.0938 58.4334 15.7578 57.3652 15.7578C56.2654 15.7578 55.3818 16.0977 54.7141 16.7773C54.0543 17.4492 53.7243 18.3398 53.7243 19.4492L53.7244 26.1434H51.957L51.957 11.1172H53.7244L53.7243 16.6133C54.1014 15.8164 54.6355 15.1992 55.3268 14.7617C56.018 14.3164 56.8192 14.0938 57.7304 14.0938Z" />
      <path d="M82.7093 14.0938C83.0157 14.0938 83.381 14.1406 83.8051 14.2344V15.875C83.4202 15.7422 83.0393 15.6758 82.6622 15.6758C81.7432 15.6758 80.9695 16 80.3411 16.6484C79.7205 17.2891 79.4102 18.1016 79.4102 19.0859V26H77.6429V14.0866H79.3732L79.4102 16.2031C79.7558 15.5469 80.2154 15.0312 80.7888 14.6562C81.3622 14.2812 82.0024 14.0938 82.7093 14.0938Z" />
      <path d="M96 19.8125C96 20.1641 95.9921 20.3867 95.9764 20.4805H86.1498C86.2362 21.7305 86.6683 22.7383 87.4459 23.5039C88.2235 24.2695 89.2251 24.6523 90.4505 24.6523C91.3931 24.6523 92.2021 24.4414 92.8776 24.0195C93.561 23.5898 93.9813 23.0195 94.1384 22.3086H95.9058C95.678 23.4883 95.0574 24.4375 94.0441 25.1562C93.0308 25.875 91.8172 26.2344 90.4033 26.2344C88.6988 26.2344 87.2731 25.6484 86.1263 24.4766C84.9873 23.3047 84.4178 21.8438 84.4178 20.0938C84.4178 18.4141 84.9951 16.9961 86.1498 15.8398C87.3045 14.6758 88.7145 14.0938 90.3798 14.0938C91.4245 14.0938 92.3749 14.3398 93.2311 14.832C94.0873 15.3164 94.7629 15.9961 95.2577 16.8711C95.7526 17.7461 96 18.7266 96 19.8125ZM86.2323 18.9922H94.1148C94.0284 18.0234 93.6317 17.2305 92.9248 16.6133C92.2257 15.9883 91.3538 15.6758 90.3091 15.6758C89.2722 15.6758 88.3846 15.9766 87.6462 16.5781C86.9078 17.1797 86.4365 17.9844 86.2323 18.9922Z" />
    </mask>
    <path d="M0 22C0 9.84974 9.90333 0 22.1197 0H48.2612V14C48.2612 27.2548 37.4576 38 24.1306 38H0V22Z" fill="#0F47F2" />
    <path d="M13.7031 14.0907C15.2112 14.0907 16.4052 14.4961 17.285 15.4414C18.1647 16.3867 18.6046 17.6758 18.6046 19.3086V26H15.9064V19.6367C15.9064 18.7148 15.6433 17.9766 15.117 17.4219C14.5985 16.8672 13.9112 16.5898 13.055 16.5898C12.1674 16.5898 11.4565 16.8672 10.9224 17.4219C10.3961 17.9766 10.133 18.7148 10.133 19.6367V26H7.45833L7.45833 14.0907H10.133L10.133 16.1094C10.51 15.4453 11.0049 14.9336 11.6176 14.5742C12.2303 14.207 12.9254 14.0907 13.7031 14.0907Z" fill="white" />
    <path d="M31.8835 26H28.6551L25.9333 22.2031L23.2233 26H20.0185L24.3309 19.9531L20.2329 14.0825H23.5218L25.9569 17.6914L28.3892 14.0866H31.5942L27.5711 19.9297L31.8835 26Z" fill="white" />
    <path d="M40.6143 16.8125H37.5155V21.5352C37.5155 22.2461 37.7119 22.7734 38.1047 23.1172C38.5053 23.4531 39.0512 23.6211 39.7424 23.6211C40.0802 23.6211 40.3708 23.5898 40.6143 23.5273V26C40.198 26.0938 39.7149 26.1406 39.1651 26.1406C37.8376 26.1406 36.7811 25.7461 35.9956 24.957C35.2101 24.168 34.8173 23.043 34.8173 21.582V16.8125H32.5787L32.6213 14.0866H34.8173L34.8173 11.1172H37.5155L37.5155 14.0866H40.6143V16.8125Z" fill="white" />
    <path d="M57.7304 14.0938C59.2464 14.0938 60.4482 14.5625 61.3358 15.5C62.2313 16.4297 62.6791 17.6914 62.6791 19.2852V26.1515H60.9117L60.9117 19.4492C60.9117 18.332 60.5857 17.4375 59.9337 16.7656C59.2896 16.0938 58.4334 15.7578 57.3652 15.7578C56.2654 15.7578 55.3818 16.0977 54.7141 16.7773C54.0543 17.4492 53.7243 18.3398 53.7243 19.4492L53.7244 26.1434H51.957L51.957 11.1172H53.7244L53.7243 16.6133C54.1014 15.8164 54.6355 15.1992 55.3268 14.7617C56.018 14.3164 56.8192 14.0938 57.7304 14.0938Z" fill="#4B5563" />
    <path d="M82.7093 14.0938C83.0157 14.0938 83.381 14.1406 83.8051 14.2344V15.875C83.4202 15.7422 83.0393 15.6758 82.6622 15.6758C81.7432 15.6758 80.9695 16 80.3411 16.6484C79.7205 17.2891 79.4102 18.1016 79.4102 19.0859V26H77.6429V14.0866H79.3732L79.4102 16.2031C79.7558 15.5469 80.2154 15.0312 80.7888 14.6562C81.3622 14.2812 82.0024 14.0938 82.7093 14.0938Z" fill="#4B5563" />
    <path d="M96 19.8125C96 20.1641 95.9921 20.3867 95.9764 20.4805H86.1498C86.2362 21.7305 86.6683 22.7383 87.4459 23.5039C88.2235 24.2695 89.2251 24.6523 90.4505 24.6523C91.3931 24.6523 92.2021 24.4414 92.8776 24.0195C93.561 23.5898 93.9813 23.0195 94.1384 22.3086H95.9058C95.678 23.4883 95.0574 24.4375 94.0441 25.1562C93.0308 25.875 91.8172 26.2344 90.4033 26.2344C88.6988 26.2344 87.2731 25.6484 86.1263 24.4766C84.9873 23.3047 84.4178 21.8438 84.4178 20.0938C84.4178 18.4141 84.9951 16.9961 86.1498 15.8398C87.3045 14.6758 88.7145 14.0938 90.3798 14.0938C91.4245 14.0938 92.3749 14.3398 93.2311 14.832C94.0873 15.3164 94.7629 15.9961 95.2577 16.8711C95.7526 17.7461 96 18.7266 96 19.8125ZM86.2323 18.9922H94.1148C94.0284 18.0234 93.6317 17.2305 92.9248 16.6133C92.2257 15.9883 91.3538 15.6758 90.3091 15.6758C89.2722 15.6758 88.3846 15.9766 87.6462 16.5781C86.9078 17.1797 86.4365 17.9844 86.2323 18.9922Z" fill="#4B5563" />
    <path d="M0 22C0 9.84974 9.90333 0 22.1197 0H48.2612V14C48.2612 27.2548 37.4576 38 24.1306 38H0V22Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
    <path d="M13.7031 14.0907C15.2112 14.0907 16.4052 14.4961 17.285 15.4414C18.1647 16.3867 18.6046 17.6758 18.6046 19.3086V26H15.9064V19.6367C15.9064 18.7148 15.6433 17.9766 15.117 17.4219C14.5985 16.8672 13.9112 16.5898 13.055 16.5898C12.1674 16.5898 11.4565 16.8672 10.9224 17.4219C10.3961 17.9766 10.133 18.7148 10.133 19.6367V26H7.45833L7.45833 14.0907H10.133L10.133 16.1094C10.51 15.4453 11.0049 14.9336 11.6176 14.5742C12.2303 14.207 12.9254 14.0907 13.7031 14.0907Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
    <path d="M31.8835 26H28.6551L25.9333 22.2031L23.2233 26H20.0185L24.3309 19.9531L20.2329 14.0825H23.5218L25.9569 17.6914L28.3892 14.0866H31.5942L27.5711 19.9297L31.8835 26Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
    <path d="M40.6143 16.8125H37.5155V21.5352C37.5155 22.2461 37.7119 22.7734 38.1047 23.1172C38.5053 23.4531 39.0512 23.6211 39.7424 23.6211C40.0802 23.6211 40.3708 23.5898 40.6143 23.5273V26C40.198 26.0938 39.7149 26.1406 39.1651 26.1406C37.8376 26.1406 36.7811 25.7461 35.9956 24.957C35.2101 24.168 34.8173 23.043 34.8173 21.582V16.8125H32.5787L32.6213 14.0866H34.8173L34.8173 11.1172H37.5155L37.5155 14.0866H40.6143V16.8125Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
    <path d="M57.7304 14.0938C59.2464 14.0938 60.4482 14.5625 61.3358 15.5C62.2313 16.4297 62.6791 17.6914 62.6791 19.2852V26.1515H60.9117L60.9117 19.4492C60.9117 18.332 60.5857 17.4375 59.9337 16.7656C59.2896 16.0938 58.4334 15.7578 57.3652 15.7578C56.2654 15.7578 55.3818 16.0977 54.7141 16.7773C54.0543 17.4492 53.7243 18.3398 53.7243 19.4492L53.7244 26.1434H51.957L51.957 11.1172H53.7244L53.7243 16.6133C54.1014 15.8164 54.6355 15.1992 55.3268 14.7617C56.018 14.3164 56.8192 14.0938 57.7304 14.0938Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
    <path d="M82.7093 14.0938C83.0157 14.0938 83.381 14.1406 83.8051 14.2344V15.875C83.4202 15.7422 83.0393 15.6758 82.6622 15.6758C81.7432 15.6758 80.9695 16 80.3411 16.6484C79.7205 17.2891 79.4102 18.1016 79.4102 19.0859V26H77.6429V14.0866H79.3732L79.4102 16.2031C79.7558 15.5469 80.2154 15.0312 80.7888 14.6562C81.3622 14.2812 82.0024 14.0938 82.7093 14.0938Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
    <path d="M96 19.8125C96 20.1641 95.9921 20.3867 95.9764 20.4805H86.1498C86.2362 21.7305 86.6683 22.7383 87.4459 23.5039C88.2235 24.2695 89.2251 24.6523 90.4505 24.6523C91.3931 24.6523 92.2021 24.4414 92.8776 24.0195C93.561 23.5898 93.9813 23.0195 94.1384 22.3086H95.9058C95.678 23.4883 95.0574 24.4375 94.0441 25.1562C93.0308 25.875 91.8172 26.2344 90.4033 26.2344C88.6988 26.2344 87.2731 25.6484 86.1263 24.4766C84.9873 23.3047 84.4178 21.8438 84.4178 20.0938C84.4178 18.4141 84.9951 16.9961 86.1498 15.8398C87.3045 14.6758 88.7145 14.0938 90.3798 14.0938C91.4245 14.0938 92.3749 14.3398 93.2311 14.832C94.0873 15.3164 94.7629 15.9961 95.2577 16.8711C95.7526 17.7461 96 18.7266 96 19.8125ZM86.2323 18.9922H94.1148C94.0284 18.0234 93.6317 17.2305 92.9248 16.6133C92.2257 15.9883 91.3538 15.6758 90.3091 15.6758C89.2722 15.6758 88.3846 15.9766 87.6462 16.5781C86.9078 17.1797 86.4365 17.9844 86.2323 18.9922Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
    <path d="M42.3634 1.2453L43.5063 4.41568L46.9348 5.91743L43.5063 7.08546L42.3634 10.5896L41.2206 7.08546L37.792 5.91743L41.2206 4.41568L42.3634 1.2453Z" fill="white" />
    <path d="M64.0648 14.0927C64.0796 15.6067 64.6713 17.3466 65.7292 18.4064C66.7871 19.4663 68.2137 20.0532 69.695 20.0381C71.1763 20.023 72.5911 19.407 73.6281 18.3258C74.6651 17.2446 75.2531 15.6108 75.2383 14.0968L73.5799 14.0968C73.5903 15.1696 73.2004 16.3951 72.4656 17.1612C71.7308 17.9273 70.7284 18.3637 69.6787 18.3744C68.6291 18.3852 67.6183 17.9693 66.8687 17.2183C66.1191 16.4673 65.7018 15.1654 65.6913 14.0927L64.0648 14.0927Z" fill="#4B5563" />
    <path d="M65.3006 24.323C66.1184 25.2748 67.2303 25.9265 68.4602 26.175C69.6902 26.4235 70.9679 26.2546 72.0911 25.695C73.2142 25.1354 74.1185 24.2171 74.6609 23.0856C75.2032 21.954 75.3526 20.6738 75.0853 19.4478L73.4477 19.8049C73.6355 20.6664 73.5306 21.566 73.1495 22.3612C72.7683 23.1563 72.1329 23.8016 71.3436 24.1949C70.5544 24.5881 69.6565 24.7068 68.7922 24.5322C67.9279 24.3575 67.1465 23.8995 66.5719 23.2307L65.3006 24.323Z" fill="#0F47F2" />
  </svg>

);

/* ─── nxt Logo (Collapsed) ─── */
const LogoCollapsed = () => (
  <svg fill="none" height="38" viewBox="0 0 49 38" width="49" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 22C0 9.84974 9.90333 0 22.1197 0H48.2612V14C48.2612 27.2548 37.4576 38 24.1306 38H0V22Z"
      fill="#0F47F2"
    />
    <path
      d="M13.7031 14.0907C15.2112 14.0907 16.4052 14.4961 17.285 15.4414C18.1647 16.3867 18.6046 17.6758 18.6046 19.3086V26H15.9064V19.6367C15.9064 18.7148 15.6433 17.9766 15.117 17.4219C14.5985 16.8672 13.9112 16.5898 13.055 16.5898C12.1674 16.5898 11.4565 16.8672 10.9224 17.4219C10.3961 17.9766 10.133 18.7148 10.133 19.6367V26H7.45833L7.45833 14.0907H10.133L10.133 16.1094C10.51 15.4453 11.0049 14.9336 11.6176 14.5742C12.2303 14.207 12.9254 14.0907 13.7031 14.0907Z"
      fill="white"
    />
    <path
      d="M31.8835 26H28.6551L25.9333 22.2031L23.2233 26H20.0185L24.3309 19.9531L20.2329 14.0825H23.5218L25.9569 17.6914L28.3892 14.0866H31.5942L27.5711 19.9297L31.8835 26Z"
      fill="white"
    />
    <path
      d="M40.6143 16.8125H37.5155V21.5352C37.5155 22.2461 37.7119 22.7734 38.1047 23.1172C38.5053 23.4531 39.0512 23.6211 39.7424 23.6211C40.0802 23.6211 40.3708 23.5898 40.6143 23.5273V26C40.198 26.0938 39.7149 26.1406 39.1651 26.1406C37.8376 26.1406 36.7811 25.7461 35.9956 24.957C35.2101 24.168 34.8173 23.043 34.8173 21.582V16.8125H32.5787L32.6213 14.0866H34.8173L34.8173 11.1172H37.5155L37.5155 14.0866H40.6143V16.8125Z"
      fill="white"
    />
    <path
      d="M42.3634 1.2453L43.5063 4.41567L46.9348 5.91743L43.5063 7.08546L42.3634 10.5896L41.2206 7.08546L37.792 5.91743L41.2206 4.41567L42.3634 1.2453Z"
      fill="white"
    />
  </svg>
);

/* ─── Menu Item Types ─── */
type IconComponent = React.FC<{ active: boolean }>;

interface MenuItem {
  id: string;
  label: string;
  icon: IconComponent;
  badge?: number;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [scheduleCount, setScheduleCount] = useState<number>(0);
  const { signOut } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchTodayCount = async () => {
      try {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const res = await scheduleService.getDailyDetail(dateStr);
        if (mounted) {
          setScheduleCount(res.stats?.today || 0);
        }
      } catch (error) {
        console.error('Failed to fetch today schedule count:', error);
      }
    };
    fetchTodayCount();
    
    return () => { mounted = false; };
  }, [currentPage]); // Re-fetch subtly when navigation changes

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'companies', label: 'Companies', icon: CompaniesIcon },
    { id: 'candidateSearch', label: 'Candidates', icon: CandidatesIcon },
    { id: 'calendar', label: 'Schedule', icon: ScheduleIcon, badge: scheduleCount > 0 ? scheduleCount : undefined },
  ];

  const bottomItems: MenuItem[] = [
    { id: 'candidatePool', label: 'Help', icon: HelpIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'logout', label: 'Logout', icon: LogoutIcon },
  ];

  return (
    <aside
      className="flex flex-col bg-white shrink-0 transition-all duration-300 h-screen"
      style={{ width: isCollapsed ? 100 : 248 }}
    >
      <div
        className="relative flex items-center bg-white shrink-0"
        style={{
          height: 86,
          padding: isCollapsed ? '24px 16px' : '24px 24px',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo — clickable to toggle when collapsed */}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          className="flex items-center justify-center bg-transparent border-none outline-none cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <LogoCollapsed /> : <LogoExpanded />}
        </button>

        {/* ── Open/Close Toggle Control (visible in both states) ── */}
        <button
          onClick={() => setIsCollapsed(prev => !prev)}
          className="cursor-pointer p-1.5 rounded-lg flex items-center justify-center text-[#4B5563] hover:text-[#0F47F2] hover:bg-[#E7EDFF] border border-transparent hover:border-[#0F47F2]/20 transition-all duration-200"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.9707 15V9C21.9707 4 19.9707 2 14.9707 2H8.9707C3.9707 2 1.9707 4 1.9707 9V15C1.9707 20 3.9707 22 8.9707 22H14.9707C19.9707 22 21.9707 20 21.9707 15Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              opacity="0.4"
              d="M7.9707 2V22"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              opacity="0.8"
              d={isCollapsed ? "M11.9702 9.43994L14.5302 11.9999L11.9702 14.5599" : "M14.9702 9.43994L12.4102 11.9999L14.9702 14.5599"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ── Separator ── */}
      <div
        className="shrink-0"
        style={{
          height: 0,
          margin: isCollapsed ? '0 24px' : '0 24px',
          borderTop: '0.5px solid #4B5563',
          opacity: 0.3,
        }}
      />

      {/* ── Main Menu ── */}
      <nav
        className="flex flex-col flex-1 overflow-y-auto custom-scrollbar"
        style={{ padding: 24, gap: 10 }}
      >
        {menuItems.map((item) => {
          const IconComp = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center shrink-0 transition-colors duration-150 cursor-pointer"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                gap: 12,
                width: isCollapsed ? 52 : 200,
                height: 52,
                borderRadius: 12,
                background: isActive ? '#E7EDFF' : 'transparent',
                border: 'none',
                outline: 'none',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span className="shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
                <IconComp active={isActive} />
              </span>

              {!isCollapsed && (
                <span
                  style={{
                    fontFamily: "'Gellix', sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: isActive ? '#0F47F2' : '#4B5563',
                    flex: 1,
                    textAlign: 'left',
                  }}
                >
                  {item.label}
                </span>
              )}

              {/* Badge (e.g. Schedule count) */}
              {item.badge !== undefined && (
                isCollapsed ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#0F47F2',
                      border: '0.25px solid #FFFFFF',
                    }}
                  />
                ) : (
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#0F47F2',
                      fontFamily: "'Gellix', sans-serif",
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    {item.badge}
                  </span>
                )
              )}
            </button>
          );
        })}


        {/* ── Bottom Items (Help / Logout) ── */}
        {bottomItems.map((item) => {
          const IconComp = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={async () => {
                if (item.id === 'logout') {
                  try {
                    await signOut();
                    navigate('/');
                  } catch (e) {
                    console.error("Logout error", e);
                  }
                } else if (item.id === 'settings') {
                  navigate('/settings');
                } else {
                  onNavigate(item.id);
                }
              }}
              className="flex items-center shrink-0 transition-colors duration-150 cursor-pointer"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                gap: 12,
                width: isCollapsed ? 52 : 200,
                height: 52,
                borderRadius: 12,
                background: isActive ? '#E7EDFF' : 'transparent',
                border: 'none',
                outline: 'none',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#F3F4F6';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span className="shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
                <IconComp active={isActive} />
              </span>

              {!isCollapsed && (
                <span
                  style={{
                    fontFamily: "'Gellix', sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: isActive ? '#0F47F2' : '#4B5563',
                    flex: 1,
                    textAlign: 'left',
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
