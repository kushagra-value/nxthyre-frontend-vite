import apiClient from "./api";

export interface CreditBalance {
  recruiter_id: string;
  credit_balance: number;
}

export interface InviteResponse {
  message: string;
  email: string;
  phone: string;
  new_balance: number;
}

class CreditService {
  async getCreditBalance(): Promise<CreditBalance> {
    try {
      const response = await apiClient.get("/billing/credit-balance/");
      return {
        recruiter_id: response.data.recruiter_id,
        credit_balance: response.data.credit_balance || 0,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch credit balance");
    }
  }

  async inviteCandidate(jobId: number, candidateId: string, subject: string, body: string): Promise<InviteResponse> {
    try {
      const response = await apiClient.post(`/jobs/${jobId}/candidates/${candidateId}/invite/`, {
        subject,
        body,
      });
      return {
        message: response.data.message,
        email: response.data.email,
        phone: response.data.phone,
        new_balance: response.data.new_balance,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to send invite");
    }
  }
}

export const creditService = new CreditService();
export default creditService;