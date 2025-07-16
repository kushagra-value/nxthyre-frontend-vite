import apiClient from "./api";

export interface CreditBalance {
  recruiter_id: string;
  credit_balance: number;
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
}

export const creditService = new CreditService();
export default creditService;