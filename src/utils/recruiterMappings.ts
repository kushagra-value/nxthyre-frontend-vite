
export const RECRUITER_NUMBERS: Record<string, string> = {
  "sana amjad": "7673971023",
  "sana": "7673971023",
  "Suchandni": "8951017155",
  "Suchandni hr": "8951017155",
};


export const getRecruiterPhone = (recruiterName: string | null | undefined): string | null => {
  if (!recruiterName) return null;

  const normalized = recruiterName.toLowerCase().trim();
  
  // Try exact match
  if (RECRUITER_NUMBERS[normalized]) {
    return RECRUITER_NUMBERS[normalized];
  }

  // Try partial matching - match first word
  const firstName = normalized.split(" ")[0];
  if (RECRUITER_NUMBERS[firstName]) {
    return RECRUITER_NUMBERS[firstName];
  }

  return null;
};


export const getWhatsAppUrl = (phoneNumber: string): string => {
  if (!phoneNumber) return "https://api.whatsapp.com/send";
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  // Add India country code if not present
  const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
  return `https://api.whatsapp.com/send/?phone=${fullNumber}&text&type=phone_number&app_absent=0`;
};
