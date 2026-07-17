// incompleteProfileModal.utils.ts

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_REGEX = /^[a-zA-Z\s]+$/;

export interface FormValues {
    name: string;
    email: string;
    phone: string;
}


export const isPlaceholderEmail = (email: string): boolean =>
    email.startsWith("noemail-") || email.endsWith("@placeholder.nxthyre");


export const validateForm = ({ name, email, phone }: FormValues): string | null => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
        return "Name is required";
    }
    if (!NAME_REGEX.test(trimmedName)) {
        return "Name can only contain letters and spaces";
    }

    if (!trimmedEmail) {
        return "Email is required";
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return "Please enter a valid email address";
    }
    if (isPlaceholderEmail(trimmedEmail)) {
        return "Please enter a valid email address, not a placeholder";
    }

    const cleanPhone = trimmedPhone.replace(/[\s\-+()]/g, "");
    if (!cleanPhone) {
        return "Phone number is required";
    }
    if (cleanPhone.length < 7 || cleanPhone.length > 15 || isNaN(Number(cleanPhone))) {
        return "Please enter a valid phone number (7-15 digits)";
    }

    return null;
};


export const getCandidateId = (candidate: any): string => {
    const c = candidate.candidate || candidate || {};
    return c.id || candidate.candidate_id || candidate.id;
};

/**
 * Returns a new candidate object with the given values merged in,
 * without mutating the original. Handles both the "wrapped"
 * ({ candidate: {...} }) and "flat" candidate shapes, and both
 * premium_data and top-level email/phone locations.
 */
export const updateLocalCandidate = (candidate: any, values: FormValues) => {
    const updated = structuredClone(candidate);
    const target = updated.candidate ?? updated;

    target.full_name = values.name;

    if (target.premium_data) {
        target.premium_data.email = values.email;
        target.premium_data.phone = values.phone;
    } else {
        target.email = values.email;
        target.phone = values.phone;
    }

    return updated;
};
