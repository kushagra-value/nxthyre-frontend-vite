// import React, { useState, useEffect } from "react";
// import CompanyInfoDrawer from "../../companies/components/CompanyInfoDrawer";
// import { organizationService, CompanyResearchData } from "../../../services/organizationService";

// interface CompanyDetailsDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
//   workspaceId: number | null;
// }

// export const CompanyDetailsDialog: React.FC<CompanyDetailsDialogProps> = ({
//   isOpen,
//   onClose,
//   workspaceId,
// }) => {
//   const [data, setData] = useState<CompanyResearchData | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!isOpen || !workspaceId) {
//       setData(null);
//       return;
//     }

//     let isCancelled = false;
//     setLoading(true);

//     organizationService
//       .getCompanyResearchData(workspaceId)
//       .then((res) => {
//         if (!isCancelled) setData(res);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch company details:", err);
//         if (!isCancelled) setData(null);
//       })
//       .finally(() => {
//         if (!isCancelled) setLoading(false);
//       });

//     return () => {
//       isCancelled = true;
//     };
//   }, [isOpen, workspaceId]);

//   return (
//     <CompanyInfoDrawer
//       isOpen={isOpen}
//       loading={loading}
//       data={data}
//       onClose={onClose}
//       onCreateJob={() => {}}
//     />
//   );
// };

// export default CompanyDetailsDialog;
