import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Terminal,
  FileText,
  Key,
  ArrowRight,
  Lock,
  Info,
  CircleDot
} from "lucide-react";
import { showToast } from "../../utils/toast";

const CandidatePortalLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [applicationId, setApplicationId] = useState("");
  const [trackingKey, setTrackingKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-fill if params are present
    const appParam = searchParams.get("applicationId");
    const trackingParam = searchParams.get("trackingId");

    if (appParam) setApplicationId(appParam);
    if (trackingParam) setTrackingKey(trackingParam);

    // Optional: auto-submit if both are present
    // if (appParam && trackingParam) {
    //   handleAuthenticate(appParam, trackingParam);
    // }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || !trackingKey) {
      showToast.error("Please enter both Application ID and Tracking Key");
      return;
    }
    handleAuthenticate(applicationId, trackingKey);
  };

  const handleAuthenticate = (appId: string, trackKey: string) => {
    setIsLoading(true);
    // Simulate authentication API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Dummy response structure from the imagined API
      const dummyResponse = {
        success: true,
        data: {
          // The API returns the specific URL to redirect the candidate to
          // Using real IDs: job_id=225, application_id=3413, candidate_id=UUID
          redirect_url: `/candidate-tracking/225/${appId}/0e70dafa-fc49-4662-b899-af6936dd641a?trackingId=${trackKey}`
        }
      };

      // Redirect using the URL coming in the response
      if (dummyResponse.success && dummyResponse.data.redirect_url) {
        navigate(dummyResponse.data.redirect_url);
      } else {
        showToast.error("Failed to authenticate.");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 opacity-50 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50 opacity-50 blur-[100px]"></div>
      </div>

      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-6 relative z-10 items-stretch">

        {/* Left Side: Login Form */}
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10 w-full md:w-1/2 flex flex-col justify-center border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-md">
              <Terminal size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
              CANDIDATE_OS_V1
            </h1>
          </div>
          <p className="text-gray-500 mb-8 text-sm md:text-base">
            Track your application progress
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wider uppercase">
                Application ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50/50 text-gray-900 placeholder-gray-400 transition-colors"
                  placeholder="e.g. APP-8824-X"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wider uppercase">
                Tracking Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={trackingKey}
                  onChange={(e) => setTrackingKey(e.target.value)}
                  className="block w-full pl-11 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50/50 text-gray-900 placeholder-gray-400 transition-colors"
                  placeholder="Enter secure key"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  AUTHENTICATE
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs md:text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              Lost your tracking key?
            </a>
            <div className="flex items-center gap-1.5 text-gray-400 font-medium uppercase tracking-wider text-[10px] md:text-xs">
              <Lock size={12} />
              SECURE_CHANNEL
            </div>
          </div>
        </div>

        {/* Right Side: System Notice & Preview */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">

          {/* System Notice */}
          <div className="bg-[#EBF3FF] rounded-xl p-5 border border-blue-100 flex items-start gap-3">
            <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1 tracking-tight">SYSTEM_NOTICE</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Authentication required to access timeline, technical assessments, and communication logs. Ensure you are on a secure network.
              </p>
            </div>
          </div>

          {/* Blurred Interface Preview */}
          <div className="bg-white rounded-xl border border-gray-100 flex-1 overflow-hidden relative shadow-sm h-64 md:h-auto">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-end justify-end p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 tracking-wider">
                <CircleDot size={10} className="text-green-500 fill-green-500" />
                SYS_ONLINE
              </div>
            </div>

            {/* Dummy Skeleton representing the dashboard */}
            <div className="p-6 space-y-6 opacity-90 pointer-events-none select-none">
              {/* Stepper Skeleton */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm"></div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded border border-gray-100 bg-gray-50">
                    <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 w-48 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-gray-100 text-gray-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm"></div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded border border-gray-100 bg-gray-50">
                    <div className="h-3 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 w-56 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Data grid skeleton */}
              <div className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-2 w-16 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-32 bg-gray-100 rounded"></div>
                  </div>
                  <div>
                    <div className="h-2 w-16 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-40 bg-gray-100 rounded"></div>
                  </div>
                  <div>
                    <div className="h-2 w-20 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded"></div>
                  </div>
                  <div>
                    <div className="h-2 w-16 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-36 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CandidatePortalLogin;
