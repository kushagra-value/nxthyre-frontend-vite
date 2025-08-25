import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // For getting job ID from URL
import { jobPostService, Job } from '../services/jobPostService'; // Import the service and Job type

const JobApplicationForm = () => {
  const { id } = useParams<{ id: string }>(); // Get job ID from URL (e.g., /jobs/roles/351)
  const [job, setJob] = useState<Job | null>(null); // State to store job data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [formData, setFormData] = useState({
    name: 'Zentisu Agatsuma',
    title: 'Demon Slayer',
    mailId: 'Demon Slayer',
    contactNumber: 'Demon Slayer',
    currentCTA: '',
    expectedCTA: '',
    noticePeriod: ''
  });

  const handleInputChange = (field:any, value:any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (id) {
          const jobData = await jobPostService.getJob(Number(id));
          setJob(jobData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-[#F5F9FB] flex justify-center items-center">Loading...</div>;
  }

  if (error || !job) {
    return <div className="min-h-screen bg-[#F5F9FB] flex justify-center items-center">{error || 'Job not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F9FB]">
      {/* Header with background shapes and image */}
      <div className="relative bg-white overflow-hidden">
        

        {/* Header content */}
        <div className="relative z-10 grid grid-cols-12 gap-6 px-12 bg-cover bg-center  "
        style={{ backgroundImage: "url('/assets/jobApplicationFormHeaderImage.png')" }}
        >
          {/* Left side - Job details */}
          <div className="col-span-6 pl-12 py-12 ">
            {/* Logo */}
            <div className="mb-16">
              <svg width="176" height="38" viewBox="0 0 176 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_2675_9341)">
                <path d="M0 30.0719V0H5.72075L22.039 24.5587H22.4142L22.0858 0H26.2592V30.0719H21.0542L4.31402 4.96643H3.89199L4.22023 30.0719H0Z" fill="url(#paint0_linear_2675_9341)"/>
                <path d="M31.4375 30.072L39.6434 18.3166L31.3438 6.51562H36.361L42.0819 15.9928H42.6914L48.3184 6.51562H53.2889L45.0829 18.3166L53.4765 30.072H48.4592L42.6914 20.5492H42.0819L36.455 30.072H31.4375Z" fill="url(#paint1_linear_2675_9341)"/>
                <path d="M66.57 30.5304C64.3192 30.5304 62.6467 29.9381 61.5525 28.7535C60.4584 27.5688 59.9114 25.7615 59.9114 23.3313V9.98127H56.2539L56.3008 6.51844H58.5985C59.3799 6.51844 59.9427 6.38174 60.2865 6.10836C60.6617 5.83499 60.8805 5.37934 60.943 4.74146L61.4119 1.1875H64.0379V6.51844H71.0246V10.0268H64.0379V23.2403C64.0379 24.4553 64.3192 25.3362 64.8819 25.883C65.4759 26.3993 66.32 26.6575 67.414 26.6575C68.008 26.6575 68.6176 26.5816 69.2429 26.4297C69.8992 26.2779 70.5401 25.974 71.1653 25.5184V29.6647C70.2587 29.9988 69.4147 30.2266 68.6332 30.3482C67.8829 30.4697 67.1952 30.5304 66.57 30.5304Z" fill="url(#paint2_linear_2675_9341)"/>
                <path d="M97.2885 30.0719V0H101.602V30.0719H97.2885ZM76.75 30.0719V0H81.064V30.0719H76.75ZM78.907 16.494V12.8945H99.0234V16.494H78.907Z" fill="black"/>
                <path d="M117.839 38C116.558 38 115.292 37.8482 114.041 37.5445C112.822 37.271 111.697 36.8458 110.665 36.2686C109.633 35.6915 108.789 34.9472 108.133 34.0361L110.29 31.0289C111.009 32.0616 112.025 32.8513 113.338 33.3981C114.651 33.9449 116.089 34.2183 117.652 34.2183C119.402 34.2183 120.856 33.8386 122.013 33.0792C123.201 32.3501 124.092 31.2111 124.685 29.6618C125.279 28.0823 125.592 26.1232 125.623 23.7842L126.139 19.0456H125.248C124.904 21.263 124.357 23.04 123.607 24.3765C122.888 25.6827 121.981 26.6244 120.887 27.2014C119.824 27.7786 118.59 28.0671 117.183 28.0671C115.432 28.0671 113.947 27.6419 112.728 26.7914C111.54 25.9105 110.634 24.6347 110.009 22.964C109.383 21.263 109.071 19.1975 109.071 16.7675V6.51562H113.338V15.8562C113.338 18.8026 113.76 20.9745 114.604 22.3718C115.479 23.7386 116.776 24.4221 118.496 24.4221C119.434 24.4221 120.278 24.1942 121.028 23.7386C121.778 23.2831 122.419 22.6147 122.951 21.7338C123.513 20.8529 123.951 19.7443 124.264 18.4077C124.607 17.0408 124.826 15.4612 124.92 13.6691V6.51562H129.187V24.0121C129.187 25.8649 129.046 27.5355 128.765 29.024C128.484 30.5125 128.03 31.8034 127.405 32.8969C126.811 34.0209 126.061 34.9624 125.154 35.7219C124.248 36.4813 123.185 37.0431 121.966 37.4077C120.747 37.8026 119.371 38 117.839 38Z" fill="black"/>
                <path d="M136.547 30.0705V6.51421H140.392L140.017 14.7156H140.814C141.095 12.9235 141.533 11.3743 142.127 10.0682C142.721 8.76201 143.502 7.74443 144.472 7.0154C145.471 6.28639 146.706 5.92188 148.176 5.92188C148.488 5.92188 148.849 5.95226 149.254 6.013C149.661 6.04338 150.13 6.14969 150.662 6.33195L150.427 10.6605C149.958 10.4782 149.489 10.3567 149.02 10.296C148.551 10.2049 148.098 10.1593 147.66 10.1593C146.441 10.1593 145.378 10.539 144.472 11.2984C143.596 12.0578 142.862 13.0905 142.268 14.3967C141.674 15.6725 141.189 17.1154 140.814 18.7253V30.0705H136.547Z" fill="black"/>
                <path d="M165.274 30.6629C163.366 30.6629 161.679 30.3895 160.208 29.8427C158.77 29.2657 157.551 28.4454 156.551 27.3823C155.55 26.3191 154.8 25.0586 154.301 23.6006C153.8 22.1425 153.551 20.5022 153.551 18.6797C153.551 16.8267 153.8 15.1257 154.301 13.5766C154.8 12.0274 155.536 10.6757 156.504 9.5214C157.473 8.36712 158.662 7.48622 160.069 6.87872C161.475 6.24082 163.085 5.92188 164.898 5.92188C166.493 5.92188 167.945 6.18008 169.26 6.69646C170.572 7.21285 171.682 8.0178 172.588 9.11133C173.525 10.1745 174.229 11.5262 174.698 13.1665C175.167 14.7764 175.355 16.6748 175.261 18.862L156.223 18.9986V16.1737L172.681 16.037L171.229 17.9507C171.384 16.037 171.197 14.4575 170.666 13.212C170.134 11.9666 169.368 11.025 168.368 10.3871C167.399 9.74922 166.242 9.43027 164.898 9.43027C163.46 9.43027 162.194 9.79478 161.1 10.5238C160.005 11.2528 159.161 12.3008 158.568 13.6677C158.006 15.0347 157.723 16.69 157.723 18.6341C157.723 21.4286 158.365 23.5702 159.646 25.0586C160.928 26.5166 162.834 27.2456 165.367 27.2456C166.335 27.2456 167.181 27.1393 167.899 26.9267C168.649 26.6836 169.274 26.3647 169.775 25.9698C170.305 25.5446 170.728 25.0586 171.041 24.5119C171.384 23.9651 171.65 23.3727 171.837 22.7349L175.59 23.6006C175.308 24.6941 174.87 25.6813 174.277 26.5622C173.713 27.4127 172.994 28.1417 172.119 28.7493C171.275 29.3567 170.291 29.8275 169.166 30.1618C168.039 30.4959 166.742 30.6629 165.274 30.6629Z" fill="black"/>
                </g>
                <defs>
                <linearGradient id="paint0_linear_2675_9341" x1="0" y1="19" x2="175.589" y2="19" gradientUnits="userSpaceOnUse">
                <stop stop-color="#2E62FF"/>
                <stop offset="0.317308" stop-color="#9747FF"/>
                </linearGradient>
                <linearGradient id="paint1_linear_2675_9341" x1="0.000459236" y1="19" x2="175.589" y2="19" gradientUnits="userSpaceOnUse">
                <stop stop-color="#2E62FF"/>
                <stop offset="0.317308" stop-color="#9747FF"/>
                </linearGradient>
                <linearGradient id="paint2_linear_2675_9341" x1="0.00171307" y1="19.0028" x2="175.591" y2="19.0028" gradientUnits="userSpaceOnUse">
                <stop stop-color="#2E62FF"/>
                <stop offset="0.317308" stop-color="#9747FF"/>
                </linearGradient>
                <clipPath id="clip0_2675_9341">
                <rect width="176" height="38" fill="white"/>
                </clipPath>
                </defs>
            </svg>

            </div>

            {/* Job posting header */}
            <div className="mb-6 ">
              <p className="text-[18px] text-[#818283] font-[400] mb-2">We are looking for</p>
              <h1 className="text-[34px] font-[500] text-[#181D25] mb-4">{job.title}</h1>
              
              {/* Job meta info */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex justify-center items-center">
                        <svg width="12" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 7.78608C1 4.03823 3.98477 1 7.66667 1C11.3486 1 14.3333 4.03823 14.3333 7.78608C14.3333 11.5046 12.2056 15.8437 8.88575 17.3953C8.11192 17.7571 7.22142 17.7571 6.44758 17.3953C3.12777 15.8437 1 11.5046 1 7.78608Z" stroke="#4B5563" stroke-width="1.5"/>
                        <path d="M7.66406 10.1719C9.04477 10.1719 10.1641 9.05259 10.1641 7.67188C10.1641 6.29116 9.04477 5.17188 7.66406 5.17188C6.28335 5.17188 5.16406 6.29116 5.16406 7.67188C5.16406 9.05259 6.28335 10.1719 7.66406 10.1719Z" stroke="#4B5563" stroke-width="1.5"/>
                        </svg>
                    </div>
                    <span className="text-[18px] text-[#818283] font-[400]">{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex justify-center items-center">
                        <svg width="12" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.62509 16.4647C2.62477 17.6693 4.48537 17.6693 8.2065 17.6693H8.8075C12.5287 17.6693 14.3893 17.6693 15.389 16.4647M1.62509 16.4647C0.625408 15.2602 0.968292 13.4314 1.65406 9.77402C2.14174 7.17304 2.38559 5.87255 3.31133 5.10424M15.389 16.4647C16.3887 15.2602 16.0457 13.4314 15.36 9.77402C14.8723 7.17304 14.6285 5.87255 13.7027 5.10424M13.7027 5.10424C12.777 4.33594 11.4538 4.33594 8.8075 4.33594H8.2065C5.56023 4.33594 4.23708 4.33594 3.31133 5.10424" stroke="#4B5563" stroke-width="1.5"/>
                        <path d="M6.00781 4.33333V3.5C6.00781 2.11929 7.12706 1 8.50781 1C9.88856 1 11.0078 2.11929 11.0078 3.5V4.33333" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </div>
                  <span className="text-[18px] text-[#818283] font-[400]">{job.experience_min_years}-{job.experience_max_years} years</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex justify-center items-center">
                        <svg width="14" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.6667 9.33333C17.6667 10.4277 17.4511 11.5113 17.0323 12.5223C16.6135 13.5334 15.9997 14.4521 15.2259 15.2259C14.4521 15.9997 13.5334 16.6135 12.5223 17.0323C11.5113 17.4511 10.4277 17.6667 9.33333 17.6667C8.239 17.6667 7.15535 17.4511 6.14431 17.0323C5.13326 16.6135 4.2146 15.9997 3.44077 15.2259C2.66696 14.4521 2.05312 13.5334 1.63433 12.5223C1.21555 11.5113 1 10.4277 1 9.33333C1 8.239 1.21555 7.15535 1.63434 6.1443C2.05312 5.13326 2.66696 4.2146 3.44077 3.44077C4.2146 2.66696 5.13326 2.05312 6.14431 1.63433C7.15535 1.21555 8.239 1 9.33333 1C10.4277 1 11.5113 1.21555 12.5223 1.63434C13.5334 2.05312 14.4521 2.66696 15.2259 3.44077C15.9997 4.2146 16.6135 5.13326 17.0323 6.14431C17.4511 7.15535 17.6667 8.239 17.6667 9.33333Z" stroke="#4B5563" stroke-width="1.5"/>
                        <path d="M12.6667 9.33333C12.6667 10.4277 12.5804 11.5113 12.4129 12.5223C12.2454 13.5334 11.9999 14.4521 11.6903 15.2259C11.3808 15.9997 11.0133 16.6135 10.6089 17.0323C10.2045 17.4511 9.77108 17.6667 9.33333 17.6667C8.89558 17.6667 8.46217 17.4511 8.05775 17.0323C7.6533 16.6135 7.28584 15.9997 6.97631 15.2259C6.66678 14.4521 6.42125 13.5334 6.25373 12.5223C6.08622 11.5113 6 10.4277 6 9.33333C6 8.239 6.08622 7.15535 6.25373 6.1443C6.42125 5.13326 6.66678 4.2146 6.97631 3.44077C7.28584 2.66696 7.6533 2.05312 8.05775 1.63433C8.46217 1.21555 8.89558 1 9.33333 1C9.77108 1 10.2045 1.21555 10.6089 1.63434C11.0133 2.05312 11.3808 2.66696 11.6903 3.44077C11.9999 4.2146 12.2454 5.13326 12.4129 6.14431C12.5804 7.15535 12.6667 8.239 12.6667 9.33333Z" stroke="#4B5563" stroke-width="1.5"/>
                        <path d="M1 9.33594H17.6667" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </div>
                  <span className="text-[18px] text-[#818283] font-[400]">{job.is_hybrid ? 'Hybrid' : 'On-site'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex justify-center items-center">
                        <svg width="14" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 11.0026C1 7.85994 1 6.28856 1.97631 5.31225C2.95262 4.33594 4.52397 4.33594 7.66667 4.33594H11C14.1427 4.33594 15.7141 4.33594 16.6903 5.31225C17.6667 6.28856 17.6667 7.85994 17.6667 11.0026C17.6667 14.1453 17.6667 15.7167 16.6903 16.6929C15.7141 17.6693 14.1427 17.6693 11 17.6693H7.66667C4.52397 17.6693 2.95262 17.6693 1.97631 16.6929C1 15.7167 1 14.1453 1 11.0026Z" stroke="#4B5563" stroke-width="1.5"/>
                        <path d="M12.6667 4.33333C12.6667 2.76198 12.6667 1.97631 12.1785 1.48816C11.6903 1 10.9047 1 9.33333 1C7.762 1 6.97631 1 6.48816 1.48816C6 1.97631 6 2.76198 6 4.33333" stroke="#4B5563" stroke-width="1.5"/>
                        <path d="M9.33464 13.783C10.2551 13.783 11.0013 13.1611 11.0013 12.3941C11.0013 11.627 10.2551 11.0052 9.33464 11.0052C8.41414 11.0052 7.66797 10.3834 7.66797 9.61629C7.66797 8.84929 8.41414 8.22746 9.33464 8.22746M9.33464 13.783C8.41414 13.783 7.66797 13.1611 7.66797 12.3941M9.33464 13.783V14.3385M9.33464 8.22746V7.67188M9.33464 8.22746C10.2551 8.22746 11.0013 8.84929 11.0013 9.61629" stroke="#4B5563" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    </div>
                  <span className="text-[18px] text-[#818283] font-[400]">{job.is_salary_confidential ? 'Confidential' : `${job.salary_min || 'N/A'} - ${job.salary_max || 'N/A'} LPA`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Profile image */}
            <div className="col-span-6 flex justify-end">
                <div className="relative w-full ">
                    
                </div>
            </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-8 px-12 py-8 divide-x divide-gray-300">
        {/* Left column - Job details */}
        <div className="col-span-7 space-y-8">
          {/* Job Info */}
          <div className=" px-12 pt-4">
            
            {/* Skills */}
            <div className="mb-6">
              <h3 className="font-[500] text-[24px] text-[#4B5563] mb-4">Skills</h3>
              <div className="flex flex-wrap gap-3">
                {job.skills.length > 0 ? (
                  job.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-[#F0F0F0] text-[#4B5563] font-[400] rounded-[6px] text-[18px]">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[18px] text-[#818283] font-[400]">No skills listed</span>
                )}
              </div>
            </div>

            {/* Key competencies */}
            <div className="mb-6">
              <h3 className="font-[500] text-[24px] text-[#4B5563] mb-4">Key competencies</h3>
              <div className="flex flex-wrap gap-3">
                {job.technical_competencies.length > 0 ? (
                  job.technical_competencies.map((competency) => (
                    <span key={competency} className="px-3 py-1 bg-[#F0F0F0] text-[#4B5563] font-[400] rounded-[6px] text-[18px]">
                      {competency}
                    </span>
                  ))
                ) : (
                  <span className="text-[18px] text-[#818283] font-[400]">No competencies listed</span>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="font-[500] text-[24px] text-[#4B5563] mb-3">Requirements</h3>
              <ul className="space-y-2 text-[#4B5563] text-[20px] text-[400]">
                {job.ai_jd ? (
                  job.ai_jd
                    .split('\n')
                    .filter((line) => line.trim().startsWith('*'))
                    .map((line, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{line.replace('*', '').trim()}</span>
                      </li>
                    ))
                ) : (
                  <li className="text-[18px] text-[#818283] font-[400]">No requirements listed</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Right column - Application form */}
        <div className="col-span-5">
          <div className=" pr-12  pl-24 py-4">
            <h2 className="font-[500] text-[24px] text-[#4B5563] mb-5">Fill Your Details</h2>
            
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent"
                />
              </div>

              {/* Mail Id */}
              <div>
                <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">Mail Id</label>
                <input
                  type="email"
                  value={formData.mailId}
                  onChange={(e) => handleInputChange('mailId', e.target.value)}
                  className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">Contact Number</label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent"
                />
              </div>

              {/* Current CTA and Expected CTA */}
              <div className="grid grid-cols-2 gap-4 ">
                <div>
                  <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">Current CTA</label>
                  <input
                    type="text"
                    value={formData.currentCTA}
                    onChange={(e) => handleInputChange('currentCTA', e.target.value)}
                    placeholder="₹5 LPA"
                    className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">Expected CTA</label>
                  <input
                    type="text"
                    value={formData.expectedCTA}
                    onChange={(e) => handleInputChange('expectedCTA', e.target.value)}
                    placeholder="₹8 LPA"
                    className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent text-gray-500"
                  />
                </div>
              </div>

              {/* Notice Period */}
              <div>
                <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">Notice Period</label>
                <input
                  type="text"
                  value={formData.noticePeriod}
                  onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                  placeholder="2 Days"
                  className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent text-gray-500"
                />
              </div>

              {/* Upload Resume */}
              <div>
                <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">Upload Resume (PDF)</label>
                <div className="border-2 border-dashed border-[#0F47F2] rounded-xl p-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8  mb-2 flex items-center justify-center">
                      <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.5" d="M24.2484 11.8516C27.6194 11.8703 29.445 12.0198 30.636 13.2107C31.9979 14.5726 31.9979 16.7645 31.9979 21.1482V22.6981C31.9979 27.0818 31.9979 29.2738 30.636 30.6356C29.2741 31.9975 27.0822 31.9975 22.6985 31.9975H10.2994C5.9156 31.9975 3.72372 31.9975 2.36186 30.6356C1 29.2738 1 27.0818 1 22.6981V21.1482C1 16.7645 1 14.5726 2.36186 13.2107C3.55277 12.0198 5.3784 11.8703 8.74947 11.8516" stroke="#0F47F2" stroke-width="2" stroke-linecap="round"/>
                    <path d="M16.4973 0.999823V21.1484M16.4973 21.1484L21.147 15.7238M16.4973 21.1484L11.8477 15.7238" stroke="#0F47F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>

                    </div>
                    <p className="text-[16px] font-[400] text-[#4B5563]">Drag and drop your job description file here</p>
                    <p className="text-[14px] font-[400] text-[#818283] mt-1">or click to browse</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button className=" bg-[#0F47F2] text-[#ECF1FF] py-3 px-6 text-[20px] rounded-xl hover:bg-blue-800 transition-colors font-[400] mt-6">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;