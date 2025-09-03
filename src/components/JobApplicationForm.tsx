import React, { useState, useEffect, useRef } from "react";
import { jobPostService, Job } from "../services/jobPostService"; // Import the service and Job type
import { useParams } from "react-router-dom"; // For getting job ID from URL

const JobApplicationForm = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null); // State to store job data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    mailId: "",
    contactNumber: "",
    currentCTA: "",
    expectedCTA: "",
    noticePeriod: "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.type)) {
      setResume(file);
      setUploadError(null);
    } else {
      setUploadError("Only PDF or DOC/DOCX files are allowed.");
      setResume(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleUploadClick();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !resume) {
      setSubmitError("Please fill all fields and upload a resume.");
      return;
    }
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await jobPostService.applyToJob(Number(id), { ...formData, resume });
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit application.");
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (id) {
          const jobData = await jobPostService.getJob(Number(id));
          console.log("Fetched job data:", jobData);
          setJob(jobData);
        }
      } catch (err: any) {
        console.error("Error fetching job:", err); // Log the error
        setError(err.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F9FB] flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F5F9FB] flex justify-center items-center">
        {error || "Job not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F9FB]">
      {/* Header with background shapes and image */}
      <div className="relative bg-white overflow-hidden">
        {/* Header content */}
        <div
          className="relative z-10 grid grid-cols-12 gap-6 px-12 bg-cover bg-center  "
          style={{
            backgroundImage: "url('/assets/jobApplicationFormHeaderImage.png')",
          }}
        >
          {/* Left side - Job details */}
          <div className="col-span-6 pl-12 py-12 ">
            {/* Logo */}
            <div className="mb-16">
              <svg
                width="124"
                height="61"
                viewBox="0 0 158 61"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask id="path-1-inside-1_2895_678" fill="white">
                  <path d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z" />
                  <path d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z" />
                  <path d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z" />
                  <path d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z" />
                  <path d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z" />
                  <path d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z" />
                  <path d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z" />
                </mask>
                <path
                  d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z"
                  fill="#0F47F2"
                />
                <path
                  d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z"
                  fill="white"
                />
                <path
                  d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z"
                  fill="white"
                />
                <path
                  d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z"
                  fill="white"
                />
                <path
                  d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z"
                  fill="#4B5563"
                />
                <path
                  d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z"
                  fill="#4B5563"
                />
                <path
                  d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z"
                  fill="#4B5563"
                />
                <path
                  d="M0 35.3158C0 15.8114 16.2992 0 36.4054 0H79.4299V22.4737C79.4299 43.7512 61.6489 61 39.7149 61H0V35.3158Z"
                  stroke="white"
                  stroke-opacity="0.26"
                  stroke-width="0.2"
                  mask="url(#path-1-inside-1_2895_678)"
                />
                <path
                  d="M22.553 22.6193C25.0352 22.6193 27.0002 23.27 28.4481 24.7875C29.8961 26.305 30.6201 28.3743 30.6201 30.9954V41.7368H26.1793V31.5221C26.1793 30.0422 25.7462 28.8571 24.88 27.9667C24.0268 27.0763 22.8956 26.6311 21.4864 26.6311C20.0255 26.6311 18.8555 27.0763 17.9764 27.9667C17.1103 28.8571 16.6772 30.0422 16.6772 31.5221V41.7368H12.2752L12.2752 22.6193H16.6772L16.6772 25.8598C17.2977 24.7938 18.1122 23.9724 19.1206 23.3955C20.129 22.806 21.2731 22.6193 22.553 22.6193Z"
                  stroke="white"
                  stroke-opacity="0.26"
                  stroke-width="0.2"
                  mask="url(#path-1-inside-1_2895_678)"
                />
                <path
                  d="M52.4749 41.7368H47.1615L42.6819 35.6419L38.2217 41.7368H32.9471L40.0446 32.03L33.3 22.6062H38.713L42.7207 28.3994L46.724 22.6127H51.9988L45.3774 31.9924L52.4749 41.7368Z"
                  stroke="white"
                  stroke-opacity="0.26"
                  stroke-width="0.2"
                  mask="url(#path-1-inside-1_2895_678)"
                />
                <path
                  d="M66.8444 26.9885H61.7443V34.5696C61.7443 35.7108 62.0675 36.5574 62.7139 37.1092C63.3732 37.6484 64.2717 37.9181 65.4094 37.9181C65.9653 37.9181 66.4436 37.8679 66.8444 37.7676V41.7368C66.1592 41.8873 65.3642 41.9626 64.4592 41.9626C62.2744 41.9626 60.5355 41.3293 59.2427 40.0626C57.9499 38.7959 57.3035 36.99 57.3035 34.6448V26.9885H53.619L53.6891 22.6127H57.3035L57.3035 17.846H61.7443L61.7443 22.6127H66.8444V26.9885Z"
                  stroke="white"
                  stroke-opacity="0.26"
                  stroke-width="0.2"
                  mask="url(#path-1-inside-1_2895_678)"
                />
                <path
                  d="M95.0146 22.6242C97.5097 22.6242 99.4877 23.3766 100.949 24.8816C102.422 26.374 103.159 28.3994 103.159 30.9578V41.9801H100.25L100.25 31.2211C100.25 29.4277 99.714 27.9918 98.6409 26.9132C97.5808 25.8347 96.1717 25.2954 94.4135 25.2954C92.6035 25.2954 91.1491 25.841 90.0502 26.9321C88.9643 28.0106 88.4213 29.4403 88.4213 31.2211L88.4213 41.967H85.5125L85.5125 17.846H88.4213L88.4213 26.6687C89.0419 25.3895 89.921 24.3987 91.0586 23.6964C92.1963 22.9816 93.515 22.6242 95.0146 22.6242Z"
                  stroke="white"
                  stroke-opacity="0.26"
                  stroke-width="0.2"
                  mask="url(#path-1-inside-1_2895_678)"
                />
                <path
                  d="M136.126 22.6242C136.63 22.6242 137.231 22.6994 137.929 22.8499V25.4836C137.296 25.2704 136.669 25.1638 136.048 25.1638C134.536 25.1638 133.262 25.6842 132.228 26.7251C131.207 27.7535 130.696 29.0578 130.696 30.638V41.7368H127.787L127.787 22.6127H130.635L130.696 26.0103C131.265 24.9568 132.021 24.1291 132.965 23.5271C133.909 22.9252 134.962 22.6242 136.126 22.6242Z"
                  stroke="white"
                  stroke-opacity="0.26"
                  stroke-width="0.2"
                  mask="url(#path-1-inside-1_2895_678)"
                />
                <path
                  d="M158 31.8043C158 32.3686 157.987 32.726 157.961 32.8765H141.788C141.93 34.8831 142.641 36.5009 143.921 37.73C145.201 38.959 146.85 39.5735 148.866 39.5735C150.418 39.5735 151.749 39.2349 152.861 38.5577C153.986 37.8679 154.678 36.9524 154.936 35.8112H157.845C157.47 37.7049 156.449 39.2286 154.781 40.3824C153.113 41.5362 151.116 42.1131 148.789 42.1131C145.983 42.1131 143.637 41.1725 141.749 39.2913C139.875 37.4102 138.938 35.065 138.938 32.2558C138.938 29.5594 139.888 27.2832 141.788 25.4271C143.689 23.5585 146.009 22.6242 148.75 22.6242C150.469 22.6242 152.034 23.0192 153.443 23.8093C154.852 24.5869 155.964 25.6779 156.778 27.0825C157.593 28.4872 158 30.0611 158 31.8043ZM141.924 30.4875H154.897C154.755 28.9324 154.102 27.6594 152.939 26.6687C151.788 25.6654 150.353 25.1638 148.634 25.1638C146.927 25.1638 145.466 25.6466 144.251 26.6123C143.036 27.5779 142.26 28.8697 141.924 30.4875Z"
                  stroke="white"
                  stroke-opacity="0.26"
                  stroke-width="0.2"
                  mask="url(#path-1-inside-1_2895_678)"
                />
                <path
                  d="M69.7191 2L71.6001 7.08929L77.2429 9.5L71.6001 11.375L69.7191 17L67.8382 11.375L62.1953 9.5L67.8382 7.08929L69.7191 2Z"
                  fill="white"
                />
                <path
                  d="M105.439 22.6285C105.463 25.0588 106.437 27.8518 108.178 29.5532C109.92 31.2545 112.267 32.1967 114.705 32.1724C117.143 32.1481 119.472 31.1594 121.179 29.4238C122.885 27.6881 123.853 25.0654 123.829 22.6351L121.099 22.6351C121.117 24.3571 120.475 26.3244 119.265 27.5542C118.056 28.7841 116.406 29.4846 114.679 29.5018C112.951 29.519 111.288 28.8514 110.054 27.6459C108.82 26.4404 108.133 24.3505 108.116 22.6285L105.439 22.6285Z"
                  fill="#4B5563"
                />
                <path
                  d="M107.565 39.1203C108.894 40.6673 110.701 41.7267 112.701 42.1306C114.7 42.5346 116.777 42.26 118.602 41.3504C120.428 40.4409 121.898 38.9482 122.779 37.109C123.661 35.2697 123.903 33.1889 123.469 31.1961L120.807 31.7764C121.113 33.1768 120.942 34.639 120.322 35.9315C119.703 37.224 118.67 38.2729 117.387 38.912C116.104 39.5512 114.645 39.7441 113.24 39.4603C111.835 39.1764 110.565 38.432 109.631 37.3449L107.565 39.1203Z"
                  fill="#0F47F2"
                />
              </svg>
            </div>

            {/* Job posting header */}
            <div className="mb-6 ">
              <p className="text-[18px] text-[#818283] font-[400] mb-2">
                We are looking for
              </p>
              <h1 className="text-[34px] font-[500] text-[#181D25] mb-4">
                {job.title}
              </h1>

              {/* Job meta info */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex justify-center items-center">
                    <svg
                      width="12"
                      height="19"
                      viewBox="0 0 16 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 7.78608C1 4.03823 3.98477 1 7.66667 1C11.3486 1 14.3333 4.03823 14.3333 7.78608C14.3333 11.5046 12.2056 15.8437 8.88575 17.3953C8.11192 17.7571 7.22142 17.7571 6.44758 17.3953C3.12777 15.8437 1 11.5046 1 7.78608Z"
                        stroke="#4B5563"
                        stroke-width="1.5"
                      />
                      <path
                        d="M7.66406 10.1719C9.04477 10.1719 10.1641 9.05259 10.1641 7.67188C10.1641 6.29116 9.04477 5.17188 7.66406 5.17188C6.28335 5.17188 5.16406 6.29116 5.16406 7.67188C5.16406 9.05259 6.28335 10.1719 7.66406 10.1719Z"
                        stroke="#4B5563"
                        stroke-width="1.5"
                      />
                    </svg>
                  </div>
                  <span className="text-[18px] text-[#818283] font-[400]">
                    {job.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex justify-center items-center">
                    <svg
                      width="12"
                      height="19"
                      viewBox="0 0 17 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.62509 16.4647C2.62477 17.6693 4.48537 17.6693 8.2065 17.6693H8.8075C12.5287 17.6693 14.3893 17.6693 15.389 16.4647M1.62509 16.4647C0.625408 15.2602 0.968292 13.4314 1.65406 9.77402C2.14174 7.17304 2.38559 5.87255 3.31133 5.10424M15.389 16.4647C16.3887 15.2602 16.0457 13.4314 15.36 9.77402C14.8723 7.17304 14.6285 5.87255 13.7027 5.10424M13.7027 5.10424C12.777 4.33594 11.4538 4.33594 8.8075 4.33594H8.2065C5.56023 4.33594 4.23708 4.33594 3.31133 5.10424"
                        stroke="#4B5563"
                        stroke-width="1.5"
                      />
                      <path
                        d="M6.00781 4.33333V3.5C6.00781 2.11929 7.12706 1 8.50781 1C9.88856 1 11.0078 2.11929 11.0078 3.5V4.33333"
                        stroke="#4B5563"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <span className="text-[18px] text-[#818283] font-[400]">
                    {job.experience_min_years}-{job.experience_max_years} years
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex justify-center items-center">
                    <svg
                      width="14"
                      height="19"
                      viewBox="0 0 19 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.6667 9.33333C17.6667 10.4277 17.4511 11.5113 17.0323 12.5223C16.6135 13.5334 15.9997 14.4521 15.2259 15.2259C14.4521 15.9997 13.5334 16.6135 12.5223 17.0323C11.5113 17.4511 10.4277 17.6667 9.33333 17.6667C8.239 17.6667 7.15535 17.4511 6.14431 17.0323C5.13326 16.6135 4.2146 15.9997 3.44077 15.2259C2.66696 14.4521 2.05312 13.5334 1.63433 12.5223C1.21555 11.5113 1 10.4277 1 9.33333C1 8.239 1.21555 7.15535 1.63434 6.1443C2.05312 5.13326 2.66696 4.2146 3.44077 3.44077C4.2146 2.66696 5.13326 2.05312 6.14431 1.63433C7.15535 1.21555 8.239 1 9.33333 1C10.4277 1 11.5113 1.21555 12.5223 1.63434C13.5334 2.05312 14.4521 2.66696 15.2259 3.44077C15.9997 4.2146 16.6135 5.13326 17.0323 6.14431C17.4511 7.15535 17.6667 8.239 17.6667 9.33333Z"
                        stroke="#4B5563"
                        stroke-width="1.5"
                      />
                      <path
                        d="M12.6667 9.33333C12.6667 10.4277 12.5804 11.5113 12.4129 12.5223C12.2454 13.5334 11.9999 14.4521 11.6903 15.2259C11.3808 15.9997 11.0133 16.6135 10.6089 17.0323C10.2045 17.4511 9.77108 17.6667 9.33333 17.6667C8.89558 17.6667 8.46217 17.4511 8.05775 17.0323C7.6533 16.6135 7.28584 15.9997 6.97631 15.2259C6.66678 14.4521 6.42125 13.5334 6.25373 12.5223C6.08622 11.5113 6 10.4277 6 9.33333C6 8.239 6.08622 7.15535 6.25373 6.1443C6.42125 5.13326 6.66678 4.2146 6.97631 3.44077C7.28584 2.66696 7.6533 2.05312 8.05775 1.63433C8.46217 1.21555 8.89558 1 9.33333 1C9.77108 1 10.2045 1.21555 10.6089 1.63434C11.0133 2.05312 11.3808 2.66696 11.6903 3.44077C11.9999 4.2146 12.2454 5.13326 12.4129 6.14431C12.5804 7.15535 12.6667 8.239 12.6667 9.33333Z"
                        stroke="#4B5563"
                        stroke-width="1.5"
                      />
                      <path
                        d="M1 9.33594H17.6667"
                        stroke="#4B5563"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <span className="text-[18px] text-[#818283] font-[400]">
                    Full Time
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex justify-center items-center">
                    <svg
                      width="14"
                      height="19"
                      viewBox="0 0 19 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 11.0026C1 7.85994 1 6.28856 1.97631 5.31225C2.95262 4.33594 4.52397 4.33594 7.66667 4.33594H11C14.1427 4.33594 15.7141 4.33594 16.6903 5.31225C17.6667 6.28856 17.6667 7.85994 17.6667 11.0026C17.6667 14.1453 17.6667 15.7167 16.6903 16.6929C15.7141 17.6693 14.1427 17.6693 11 17.6693H7.66667C4.52397 17.6693 2.95262 17.6693 1.97631 16.6929C1 15.7167 1 14.1453 1 11.0026Z"
                        stroke="#4B5563"
                        stroke-width="1.5"
                      />
                      <path
                        d="M12.6667 4.33333C12.6667 2.76198 12.6667 1.97631 12.1785 1.48816C11.6903 1 10.9047 1 9.33333 1C7.762 1 6.97631 1 6.48816 1.48816C6 1.97631 6 2.76198 6 4.33333"
                        stroke="#4B5563"
                        stroke-width="1.5"
                      />
                      <path
                        d="M9.33464 13.783C10.2551 13.783 11.0013 13.1611 11.0013 12.3941C11.0013 11.627 10.2551 11.0052 9.33464 11.0052C8.41414 11.0052 7.66797 10.3834 7.66797 9.61629C7.66797 8.84929 8.41414 8.22746 9.33464 8.22746M9.33464 13.783C8.41414 13.783 7.66797 13.1611 7.66797 12.3941M9.33464 13.783V14.3385M9.33464 8.22746V7.67188M9.33464 8.22746C10.2551 8.22746 11.0013 8.84929 11.0013 9.61629"
                        stroke="#4B5563"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <span className="text-[18px] text-[#818283] font-[400]">
                    {job.is_salary_confidential
                      ? "Confidential"
                      : `${job.salary_min || "N/A"} - ${
                          job.salary_max || "N/A"
                        } LPA`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Profile image */}
          <div className="col-span-6 flex justify-end">
            <div className="relative w-full "></div>
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
              <h3 className="font-[500] text-[24px] text-[#4B5563] mb-4">
                Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {job.skills.length > 0 ? (
                  job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-[#F0F0F0] text-[#4B5563] font-[400] rounded-[6px] text-[18px]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[18px] text-[#818283] font-[400]">
                    No skills listed
                  </span>
                )}
              </div>
            </div>

            {/* Key competencies */}
            <div className="mb-6">
              <h3 className="font-[500] text-[24px] text-[#4B5563] mb-4">
                Key competencies
              </h3>
              <div className="flex flex-wrap gap-3">
                {job.technical_competencies.length > 0 ? (
                  job.technical_competencies.map((competency) => (
                    <span
                      key={competency}
                      className="px-3 py-1 bg-[#F0F0F0] text-[#4B5563] font-[400] rounded-[6px] text-[18px]"
                    >
                      {competency}
                    </span>
                  ))
                ) : (
                  <span className="text-[18px] text-[#818283] font-[400]">
                    No competencies listed
                  </span>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="font-[500] text-[24px] text-[#4B5563] mb-3">
                Requirements
              </h3>
              <ul className="space-y-2 text-[#4B5563] text-[20px] text-[400]">
                {job.ai_jd ? (
                  job.ai_jd
                    .split("\n")
                    .filter((line) => line.trim().startsWith("*"))
                    .map((line, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{line.replace("*", "").trim()}</span>
                      </li>
                    ))
                ) : (
                  <li className="text-[18px] text-[#818283] font-[400]">
                    No requirements listed
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Right column - Application form */}
        <div className="col-span-5">
          <div className=" pr-12  pl-24 py-4">
            <h2 className="font-[500] text-[24px] text-[#4B5563] mb-5">
              Fill Your Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent"
                    required
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent"
                    required
                  />
                </div>

                {/* Mail Id */}
                <div>
                  <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">
                    Mail Id
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.mailId}
                    onChange={(e) =>
                      handleInputChange("mailId", e.target.value)
                    }
                    className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent"
                    required
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">
                    Contact Number
                  </label>
                  <input
                    id="contact_number"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      handleInputChange("contactNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent"
                    required
                  />
                </div>

                {/* Current CTA and Expected CTA */}
                <div className="grid grid-cols-2 gap-4 ">
                  <div>
                    <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">
                      Current CTA
                    </label>
                    <input
                      id="current_cta"
                      type="text"
                      value={formData.currentCTA}
                      onChange={(e) =>
                        handleInputChange("currentCTA", e.target.value)
                      }
                      placeholder="₹5 LPA"
                      className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent text-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">
                      Expected CTA
                    </label>
                    <input
                      id="expected_cta"
                      type="text"
                      value={formData.expectedCTA}
                      onChange={(e) =>
                        handleInputChange("expectedCTA", e.target.value)
                      }
                      placeholder="₹8 LPA"
                      className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent text-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Notice Period */}
                <div>
                  <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">
                    Notice Period
                  </label>
                  <input
                    id="notice_period"
                    type="text"
                    value={formData.noticePeriod}
                    onChange={(e) =>
                      handleInputChange("noticePeriod", e.target.value)
                    }
                    placeholder="30 Days"
                    className="w-full px-3 py-2 text-[20px] font-[500] text-[#0F47F2]  border border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:border-transparent text-gray-500"
                    required
                  />
                </div>

                {/* Upload Resume */}
                <div>
                  <label className="block text-[20px] font-[400] text-[#4B5563] mb-3">
                    Upload Resume (PDF)
                  </label>
                  <label htmlFor="resume-upload">
                    <div
                      className="border-2 border-dashed border-[#0F47F2] rounded-xl p-6 text-center"
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={handleUploadClick}
                      onKeyDown={handleKeyDown}
                      tabIndex={0}
                      role="button"
                      aria-label="Upload resume"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8  mb-2 flex items-center justify-center">
                          <svg
                            width="33"
                            height="33"
                            viewBox="0 0 33 33"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              opacity="0.5"
                              d="M24.2484 11.8516C27.6194 11.8703 29.445 12.0198 30.636 13.2107C31.9979 14.5726 31.9979 16.7645 31.9979 21.1482V22.6981C31.9979 27.0818 31.9979 29.2738 30.636 30.6356C29.2741 31.9975 27.0822 31.9975 22.6985 31.9975H10.2994C5.9156 31.9975 3.72372 31.9975 2.36186 30.6356C1 29.2738 1 27.0818 1 22.6981V21.1482C1 16.7645 1 14.5726 2.36186 13.2107C3.55277 12.0198 5.3784 11.8703 8.74947 11.8516"
                              stroke="#0F47F2"
                              stroke-width="2"
                              stroke-linecap="round"
                            />
                            <path
                              d="M16.4973 0.999823V21.1484M16.4973 21.1484L21.147 15.7238M16.4973 21.1484L11.8477 15.7238"
                              stroke="#0F47F2"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        {resume ? (
                          <p className="text-[16px] font-[400] text-[#4B5563]">
                            {resume.name}
                          </p>
                        ) : (
                          <>
                            <p className="text-[16px] font-[400] text-[#4B5563]">
                              Drag and drop your resume file here
                            </p>
                            <p className="text-[14px] font-[400] text-[#818283] mt-1">
                              or click to browse
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                  <input
                    id="resume-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    hidden
                    required
                  />
                  {uploadError && (
                    <p className="text-red-500 mt-2">{uploadError}</p>
                  )}
                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="bg-[#0F47F2] text-[#ECF1FF] py-3 px-6 text-[20px] rounded-xl hover:bg-blue-800 transition-colors font-[400] mt-6 disabled:opacity-50"
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Submitting..." : "Submit Application"}
                  </button>
                  {submitError && (
                    <p className="text-red-500 mt-2">{submitError}</p>
                  )}
                  {submitSuccess && (
                    <p className="text-green-500 mt-2">
                      Application submitted successfully!
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;
