import React,  { useState } from 'react';

function CandidateBackGroundCheck() {
    const [feedback, setFeedback] = useState<string>('');
     const [comment, setComment] = useState('');
     const [formData, setFormData] = useState({
        name: 'Zenitsu Agatsuma',
        title: 'Demon Slayer',
        phone: '+81 - 252321527',
        linkedin: 'linkedin.com/jp/zenitsuslayer/'
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 sm:h-18 bg-white shadow-sm border-b border-gray-100 z-10">
      <div className="flex items-center justify-between px-4 sm:px-6 h-full">
        <svg width="124" height="61" viewBox="0 0 158 61" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1_2895_678" fill="white">
            <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z"/>
            <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z"/>
            <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z"/>
            <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z"/>
            <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z"/>
            <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z"/>
            <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z"/>
            </mask>
            <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z" fill="#0F47F2"/>
            <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z" fill="white"/>
            <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z" fill="white"/>
            <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z" fill="white"/>
            <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z" fill="#4B5563"/>
            <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z" fill="#4B5563"/>
            <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z" fill="#4B5563"/>
            <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
            <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
            <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
            <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
            <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
            <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
            <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_2895_678)"/>
            <path d="M69.7191 2L71.6001 7.08929L77.2429 9.5L71.6001 11.375L69.7191 17L67.8382 11.375L62.1953 9.5L67.8382 7.08929L69.7191 2Z" fill="white"/>
            <path d="M105.439 22.6285C105.463 25.0588 106.437 27.8518 108.178 29.5532C109.92 31.2545 112.267 32.1967 114.705 32.1724C117.143 32.1481 119.472 31.1594 121.179 29.4238C122.885 27.6881 123.853 25.0654 123.829 22.6351L121.099 22.6351C121.117 24.3571 120.475 26.3244 119.265 27.5542C118.056 28.7841 116.406 29.4846 114.679 29.5018C112.951 29.519 111.288 28.8514 110.054 27.6459C108.82 26.4404 108.133 24.3505 108.116 22.6285L105.439 22.6285Z" fill="#4B5563"/>
            <path d="M107.565 39.1203C108.894 40.6673 110.701 41.7267 112.701 42.1306C114.7 42.5346 116.777 42.26 118.602 41.3504C120.428 40.4409 121.898 38.9482 122.779 37.109C123.661 35.2697 123.903 33.1889 123.469 31.1961L120.807 31.7764C121.113 33.1768 120.942 34.639 120.322 35.9315C119.703 37.224 118.67 38.2729 117.387 38.912C116.104 39.5512 114.645 39.7441 113.24 39.4603C111.835 39.1764 110.565 38.432 109.631 37.3449L107.565 39.1203Z" fill="#0F47F2"/>
        </svg>
        <button className="bg-[#0F47F2] text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-[5px] text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
          Explore Nxthyre
        </button>
      </div>
    </div>
      
      {/* Main Content */}
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-[1126px] mx-auto space-y-4 sm:space-y-8">
          {/* Page Title */}
          <div className="space-y-2 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl font-medium text-[#181D25]">Employment Verification Request</h1>
            <p className="text-base sm:text-lg text-[#818283]">
              A candidate, <span className="text-[#0F47F2]">Shikha Singh</span>, has listed your company as a previous employer. Please review the details below and submit your verification.
            </p>
          </div>
          
            <div className="bg-white rounded-[10px] p-4 sm:p-8 shadow-sm">
                <div className="relative w-full min-h-[162px] bg-white border border-[#818283] rounded-[20px] p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
                        <div className="w-[80px] h-[80px] md:w-[114px] md:h-[114px] rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img 
                                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop" 
                                alt="Shikha Singh"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        
                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left ">
                            <h2 className="text-xl sm:text-2xl font-semibold text-[#4B5563] mb-2">Shikha Singh</h2>
                            <p className="text-sm sm:text-lg text-[#818283] mb-2">Digital Marketer | Ex - employee of Sirma | 2022 -2023</p>
                            <p className="text-sm sm:text-lg text-[#818283]">Bangalore, India</p>
                        </div>
                        
                        {/* Contact Info */}
                        <div className="text-center md:text-right space-y-2 md:space-y-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 justify-center md:justify-end flex-wrap">
                            <span className="text-sm sm:text-lg text-[#818283] break-all">Shikhasingh1220@gmail.com</span>
                            <svg className="w-[18px] h-[15px] text-[#818283]" fill="currentColor" viewBox="0 0 20 16">
                            <path d="M2 2h16l-8 6L2 2zm0 2.5v9h16v-9l-8 6-8-6z"/>
                            </svg>
                        </div>
                        <div className="flex items-center gap-2 justify-center md:justify-end">
                            <span className="text-sm sm:text-lg text-[#818283]">9375 4575 45</span>
                            <svg className="w-4 h-4 text-[#818283]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                </div>
                <div className="space-y-4 pt-8 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-medium text-[#181D25]">Experience Details Provided</h3>
                
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row">
                    <span className="w-full sm:w-48 text-base sm:text-xl text-[#818283] font-medium sm:font-normal">Company:</span>
                    <span className="text-base sm:text-xl font-medium text-[#4B5563]">Sirma</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row">
                    <span className="w-full sm:w-48 text-base sm:text-xl text-[#818283] font-medium sm:font-normal">Job Title:</span>
                    <span className="text-base sm:text-xl font-medium text-[#4B5563]">Software Engineer</span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                    <span className="text-base sm:text-xl text-[#818283] font-medium sm:font-normal">Description of work:</span>
                    <span className="text-base sm:text-xl font-medium text-[#4B5563]">Worked on backend APIs and frontend integration.</span>
                    </div>
                </div>
            </div>
          </div>
          
          
          {/* Feedback Section */}
          <div className="bg-[#0F47F2] rounded-[10px] p-4 sm:p-6 text-white">
            <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6">Feedback of the person!</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex items-center gap-2 bg-[#F0F0F0] rounded-[10px] px-3 py-3 min-h-[44px]">
                <input 
                    type="radio" 
                    id="yes" 
                    name="feedback" 
                    value="yes"
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-5 h-5 sm:w-4 sm:h-4 text-[#4B5563]"
                />
                <label htmlFor="yes" className="text-base sm:text-lg text-[#4B5563] cursor-pointer">Yes</label>
                </div>
                
                <div className="flex items-center gap-2 bg-[#F0F0F0] rounded-[10px] px-3 py-3 min-h-[44px]">
                <input 
                    type="radio" 
                    id="no" 
                    name="feedback" 
                    value="no"
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-5 h-5 sm:w-4 sm:h-4 text-[#4B5563]"
                />
                <label htmlFor="no" className="text-base sm:text-lg text-[#4B5563] cursor-pointer">No</label>
                </div>
                </div>
            </div>
          
          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-[#4B5563]">Comments</h3>
            
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Type your feedback about the person"
                className="w-full h-[75px] sm:h-[75px] p-3 sm:p-4 bg-white border border-[#0F47F2] rounded-[10px] text-base sm:text-lg text-[#0F47F2] placeholder-[#E2E2E2] resize-none focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:ring-opacity-20"
            />
        </div>
          
          {/* Personal Details Form */}
          <div className="bg-white rounded-[10px] p-4 sm:p-8 space-y-6 sm:space-y-8">
            <h3 className="text-base sm:text-lg font-medium text-[#181D25]">Please provide your details for our records.</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                {/* Your Name */}
                <div className="space-y-3">
                    <label className="text-base sm:text-lg font-medium text-[#4B5563]">Your Name</label>
                    <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full h-[44px] sm:h-[46px] px-3 bg-white border border-[#0F47F2] rounded-[10px] text-base sm:text-lg text-[#0F47F2] focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:ring-opacity-20"
                    />
                </div>
                
                {/* Your Title */}
                <div className="space-y-3">
                    <label className="text-base sm:text-lg font-medium text-[#4B5563]">Your Title</label>
                    <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full h-[44px] sm:h-[46px] px-3 bg-white border border-[#0F47F2] rounded-[10px] text-base sm:text-lg text-[#0F47F2] focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:ring-opacity-20"
                    />
                </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                {/* Your Phone Number */}
                <div className="space-y-3">
                    <label className="text-base sm:text-lg font-medium text-[#4B5563]">Your Phone Number</label>
                    <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full h-[44px] sm:h-[46px] px-3 bg-white border border-[#0F47F2] rounded-[10px] text-base sm:text-lg text-[#0F47F2] focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:ring-opacity-20"
                    />
                </div>
                
                {/* LinkedIn Url */}
                <div className="space-y-3">
                    <label className="text-base sm:text-lg font-medium text-[#4B5563]">LinkedIn Url</label>
                    <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="w-full h-[44px] sm:h-[46px] px-3 bg-white border border-[#0F47F2] rounded-[10px] text-base sm:text-lg text-[#0F47F2] focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:ring-opacity-20"
                    />
                </div>
                </div>
            </div>
            </div>
          
            <div className="flex flex-col sm:px-8 sm:pt-2 sm:flex-row gap-3 sm:gap-4">
                <button className="bg-[#0F47F2] text-[#ECF1FF] px-4 py-3 sm:py-2 rounded-[6px] text-base sm:text-lg font-normal hover:bg-blue-700 transition-colors min-h-[44px] sm:min-h-0">
                    Submit Verification
                </button>
                
                <button className="bg-[#ECF1FF] text-[#0F47F2] px-4 py-3 sm:py-2 rounded-[6px] text-base sm:text-lg font-normal hover:bg-gray-100 transition-colors min-h-[44px] sm:min-h-0">
                    Cancel
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateBackGroundCheck;