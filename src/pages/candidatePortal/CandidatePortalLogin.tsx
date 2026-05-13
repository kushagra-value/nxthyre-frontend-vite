import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showToast } from "../../utils/toast";
import { NxtHyreLogo } from "../auth/NxtHyreLogo";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const CandidatePortalLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trackingParam = searchParams.get("trackingId");
    if (trackingParam) setTrackingId(trackingParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      showToast.error("Please enter your Tracking ID");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/candidate-portal/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_id: trackingId.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Store the portal token for subsequent API calls
        localStorage.setItem("portal_token", data.token);
        navigate(data.redirect_url);
      } else {
        showToast.error(data.detail || data.message || "Invalid Tracking ID. Please check and try again.");
      }
    } catch (error) {
      console.error("Portal login error:", error);
      showToast.error("Unable to connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white flex justify-between">
      {/* Left side — Form */}
      <div className="w-full lg:w-[45%] flex flex-col mx-auto px-6 sm:px-8 lg:px-16 py-6 sm:py-8 lg:py-12 justify-center min-h-screen relative">
        <div>
          {/* Logo */}
          <div className="mb-8 lg:mb-12">
            <NxtHyreLogo />
          </div>

          {/* Heading */}
          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-medium text-gray-900 font-['Gellix',_sans-serif]">
              Track your application.
            </h1>
          </div>
          <p className="text-[15px] text-gray-500 mb-10 leading-relaxed max-w-sm">
            Enter the Tracking ID sent to your email to see your interview status, upcoming rounds, and messages from your recruiter.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-['Gellix',_sans-serif]">
                Tracking ID
              </label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full max-w-[400px] px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                placeholder="Eg: TRK-2025-0847"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 h-11 bg-[#0F47F2] rounded-[7px] text-white text-sm font-medium font-['Gellix',_sans-serif] flex items-center justify-center whitespace-nowrap hover:bg-blue-700 transition-colors border-2 border-[#0F47F2]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "View My Application"
                )}
              </button>
            </div>
          </form>

          {/* Help text */}
          <div className="mt-16">
            <a href="#" className="text-[#0F47F2] hover:underline text-sm font-medium font-['Gellix',_sans-serif]">
              Didn't receive your Tracking ID?
            </a>
            <p className="text-gray-500 text-sm mt-2 max-w-sm leading-relaxed">
              Check your inbox for an email from Nxthyre. If you still can't find it, click the link above and we'll resend it.
            </p>
          </div>
        </div>
      </div>

      {/* Right side — Branding panel */}
      <div
        className="hidden lg:flex w-[40%] bg-cover bg-center items-center justify-center"
        style={{
          backgroundImage: "url(/assets/nxtHyreGradient.png)",
          borderRadius: "300px 0px",
          marginLeft: "120px",
        }}
      >
        <div className="flex flex-col items-center gap-12 px-8">
          {/* Large NxtHyre logo */}
          <svg width="324" height="128" viewBox="0 0 324 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="portal-logo-mask" fill="white">
              <path d="M0 74.1053C0 33.1781 33.3586 0 74.5085 0H162.564V47.1579C162.564 91.8057 126.173 128 81.282 128H0V74.1053Z" />
              <path d="M46.1578 47.4635C51.2379 47.4635 55.2596 48.829 58.223 52.0132C61.1864 55.1974 62.6681 59.5395 62.6681 65.0395V87.5789H53.5794V66.1447C53.5794 63.0395 52.6931 60.5526 50.9203 58.6842C49.174 56.8158 46.8589 55.8816 43.9748 55.8816C40.985 55.8816 38.5904 56.8158 36.7912 58.6842C35.0185 60.5526 34.1321 63.0395 34.1321 66.1447V87.5789H25.1228L25.1228 47.4635H34.1321L34.1321 54.2632C35.4021 52.0263 37.069 50.3026 39.1328 49.0921C41.1966 47.8553 43.5383 47.4635 46.1578 47.4635Z" />
              <path d="M107.397 87.5789H96.5224L87.3543 74.7895L78.226 87.5789H67.4307L81.9567 67.2105L68.153 47.4359H79.2314L87.4337 59.5921L95.6269 47.4497H106.423L92.871 67.1316L107.397 87.5789Z" />
              <path d="M136.806 56.6316H126.368V72.5395C126.368 74.9342 127.03 76.7105 128.353 77.8684C129.702 79 131.541 79.5658 133.869 79.5658C135.007 79.5658 135.986 79.4605 136.806 79.25V87.5789C135.404 87.8947 133.777 88.0526 131.924 88.0526C127.453 88.0526 123.894 86.7237 121.248 84.0658C118.602 81.4079 117.279 77.6184 117.279 72.6974V56.6316H109.739L109.882 47.4497H117.279L117.279 37.4474H126.368L126.368 47.4497H136.806V56.6316Z" />
              <path d="M194.46 47.4737C199.567 47.4737 203.615 49.0526 206.605 52.2105C209.621 55.3421 211.129 59.5921 211.129 64.9605V88.0894H205.176L205.176 65.5132C205.176 61.75 204.078 58.7368 201.882 56.4737C199.712 54.2105 196.828 53.0789 193.23 53.0789C189.526 53.0789 186.549 54.2237 184.3 56.5132C182.077 58.7763 180.966 61.7763 180.966 65.5132L180.966 88.0619H175.013L175.013 37.4474H180.966L180.966 55.9605C182.236 53.2763 184.035 51.1974 186.364 49.7237C188.692 48.2237 191.391 47.4737 194.46 47.4737Z" />
              <path d="M278.6 47.4737C279.632 47.4737 280.862 47.6316 282.291 47.9474V53.4737C280.994 53.0263 279.711 52.8026 278.441 52.8026C275.345 52.8026 272.739 53.8947 270.622 56.0789C268.532 58.2368 267.487 60.9737 267.487 64.2895V87.5789H261.534L261.534 47.4497H267.362L267.487 54.5789C268.651 52.3684 270.199 50.6316 272.131 49.3684C274.062 48.1053 276.219 47.4737 278.6 47.4737Z" />
              <path d="M323.368 66.7368C323.368 67.9211 323.342 68.671 323.289 68.9868H290.189C290.48 73.1974 291.935 76.5921 294.555 79.1711C297.174 81.75 300.548 83.0395 304.675 83.0395C307.85 83.0395 310.576 82.3289 312.851 80.9079C315.153 79.4605 316.568 77.5395 317.098 75.1447H323.051C322.284 79.1184 320.193 82.3158 316.78 84.7368C313.367 87.1579 309.279 88.3684 304.516 88.3684C298.775 88.3684 293.973 86.3947 290.109 82.4474C286.273 78.5 284.355 73.5789 284.355 67.6842C284.355 62.0263 286.299 57.25 290.189 53.3553C294.078 49.4342 298.828 47.4737 304.437 47.4737C307.956 47.4737 311.158 48.3026 314.042 49.9605C316.926 51.5921 319.201 53.8816 320.868 56.8289C322.535 59.7763 323.368 63.0789 323.368 66.7368ZM290.467 63.9737H317.018C316.727 60.7105 315.391 58.0395 313.01 55.9605C310.655 53.8553 307.718 52.8026 304.199 52.8026C300.706 52.8026 297.716 53.8158 295.229 55.8421C292.742 57.8684 291.155 60.579 290.467 63.9737Z" />
            </mask>
            <path d="M0 74.1053C0 33.1781 33.3586 0 74.5085 0H162.564V47.1579C162.564 91.8057 126.173 128 81.282 128H0V74.1053Z" fill="#0F47F2" />
            <path d="M46.1578 47.4635C51.2379 47.4635 55.2596 48.829 58.223 52.0132C61.1864 55.1974 62.6681 59.5395 62.6681 65.0395V87.5789H53.5794V66.1447C53.5794 63.0395 52.6931 60.5526 50.9203 58.6842C49.174 56.8158 46.8589 55.8816 43.9748 55.8816C40.985 55.8816 38.5904 56.8158 36.7912 58.6842C35.0185 60.5526 34.1321 63.0395 34.1321 66.1447V87.5789H25.1228L25.1228 47.4635H34.1321L34.1321 54.2632C35.4021 52.0263 37.069 50.3026 39.1328 49.0921C41.1966 47.8553 43.5383 47.4635 46.1578 47.4635Z" fill="white" />
            <path d="M107.397 87.5789H96.5224L87.3543 74.7895L78.226 87.5789H67.4307L81.9567 67.2105L68.153 47.4359H79.2314L87.4337 59.5921L95.6269 47.4497H106.423L92.871 67.1316L107.397 87.5789Z" fill="white" />
            <path d="M136.806 56.6316H126.368V72.5395C126.368 74.9342 127.03 76.7105 128.353 77.8684C129.702 79 131.541 79.5658 133.869 79.5658C135.007 79.5658 135.986 79.4605 136.806 79.25V87.5789C135.404 87.8947 133.777 88.0526 131.924 88.0526C127.453 88.0526 123.894 86.7237 121.248 84.0658C118.602 81.4079 117.279 77.6184 117.279 72.6974V56.6316H109.739L109.882 47.4497H117.279L117.279 37.4474H126.368L126.368 47.4497H136.806V56.6316Z" fill="white" />
            <path d="M194.46 47.4737C199.567 47.4737 203.615 49.0526 206.605 52.2105C209.621 55.3421 211.129 59.5921 211.129 64.9605V88.0894H205.176L205.176 65.5132C205.176 61.75 204.078 58.7368 201.882 56.4737C199.712 54.2105 196.828 53.0789 193.23 53.0789C189.526 53.0789 186.549 54.2237 184.3 56.5132C182.077 58.7763 180.966 61.7763 180.966 65.5132L180.966 88.0619H175.013L175.013 37.4474H180.966L180.966 55.9605C182.236 53.2763 184.035 51.1974 186.364 49.7237C188.692 48.2237 191.391 47.4737 194.46 47.4737Z" fill="black" />
            <path d="M278.6 47.4737C279.632 47.4737 280.862 47.6316 282.291 47.9474V53.4737C280.994 53.0263 279.711 52.8026 278.441 52.8026C275.345 52.8026 272.739 53.8947 270.622 56.0789C268.532 58.2368 267.487 60.9737 267.487 64.2895V87.5789H261.534L261.534 47.4497H267.362L267.487 54.5789C268.651 52.3684 270.199 50.6316 272.131 49.3684C274.062 48.1053 276.219 47.4737 278.6 47.4737Z" fill="black" />
            <path d="M323.368 66.7368C323.368 67.9211 323.342 68.671 323.289 68.9868H290.189C290.48 73.1974 291.935 76.5921 294.555 79.1711C297.174 81.75 300.548 83.0395 304.675 83.0395C307.85 83.0395 310.576 82.3289 312.851 80.9079C315.153 79.4605 316.568 77.5395 317.098 75.1447H323.051C322.284 79.1184 320.193 82.3158 316.78 84.7368C313.367 87.1579 309.279 88.3684 304.516 88.3684C298.775 88.3684 293.973 86.3947 290.109 82.4474C286.273 78.5 284.355 73.5789 284.355 67.6842C284.355 62.0263 286.299 57.25 290.189 53.3553C294.078 49.4342 298.828 47.4737 304.437 47.4737C307.956 47.4737 311.158 48.3026 314.042 49.9605C316.926 51.5921 319.201 53.8816 320.868 56.8289C322.535 59.7763 323.368 63.0789 323.368 66.7368ZM290.467 63.9737H317.018C316.727 60.7105 315.391 58.0395 313.01 55.9605C310.655 53.8553 307.718 52.8026 304.199 52.8026C300.706 52.8026 297.716 53.8158 295.229 55.8421C292.742 57.8684 291.155 60.579 290.467 63.9737Z" fill="black" />
            <path d="M0 74.1053C0 33.1781 33.3586 0 74.5085 0H162.564V47.1579C162.564 91.8057 126.173 128 81.282 128H0V74.1053Z" stroke="white" strokeOpacity="0.26" strokeWidth="0.2" mask="url(#portal-logo-mask)" />
            <path d="M142.698 4.1947L146.548 14.8739L158.097 19.9324L146.548 23.8668L142.698 35.6701L138.848 23.8668L127.3 19.9324L138.848 14.8739L142.698 4.1947Z" fill="white" />
            <path d="M215.797 47.4701C215.847 52.5698 217.84 58.4305 221.404 62.0005C224.967 65.5706 229.772 67.5476 234.762 67.4966C239.752 67.4457 244.518 65.371 248.011 61.729C251.504 58.087 253.484 52.5836 253.434 47.484L247.848 47.484C247.883 51.0974 246.57 55.2255 244.095 57.8061C241.62 60.3867 238.243 61.8567 234.707 61.8928C231.172 61.9289 227.767 60.5281 225.242 57.9985C222.717 55.4689 221.311 51.0836 221.276 47.4701L215.797 47.4701Z" fill="black" />
            <path d="M219.96 81.9301C222.714 85.136 226.46 87.3313 230.603 88.1685C234.746 89.0056 239.05 88.4366 242.833 86.5516C246.616 84.6667 249.662 81.5735 251.489 77.7619C253.316 73.9503 253.819 69.6382 252.918 65.5084L247.402 66.7111C248.035 69.6131 247.682 72.6433 246.398 75.3218C245.114 78.0002 242.974 80.1738 240.315 81.4984C237.657 82.823 234.632 83.2229 231.721 82.6346C228.809 82.0464 226.177 80.5036 224.242 78.2508L219.96 81.9301Z" fill="#0F47F2" />
          </svg>

          <div className="text-center px-6">
            <p className="text-2xl font-['Gellix',_sans-serif] text-[#333333] leading-snug">
              From application to offer, know exactly where you stand, every step of the way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePortalLogin;
