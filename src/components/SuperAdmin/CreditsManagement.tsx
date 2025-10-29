import { useState } from "react";
import { Search, Plus, Minus, AlertCircle } from "lucide-react";
import { superAdminApi } from "../../services/superAdminApi";

export default function CreditsManagement() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [operationType, setOperationType] = useState<"add" | "subtract">("add");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !amount || !notes) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: "error", text: "Amount must be a positive number" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const finalAmount = operationType === "subtract" ? -numAmount : numAmount;

    const { data, error } = await superAdminApi.credits.adjust(
      "temp-id",
      finalAmount,
      notes
    );

    if (error) {
      const emailMatch = error.match(/User with email (.+) not found/);
      if (emailMatch) {
        setMessage({
          type: "error",
          text: `User with email ${email} not found`,
        });
      } else {
        setMessage({ type: "error", text: error });
      }
    } else if (data) {
      setMessage({
        type: "success",
        text: `Successfully ${
          operationType === "add" ? "added" : "subtracted"
        } ${numAmount} credits. New balance: ${data.new_balance}`,
      });
      setEmail("");
      setAmount("");
      setNotes("");
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Credits Management
        </h1>
        <p className="text-gray-600">Adjust user credit balances</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Email
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOperationType("add")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    operationType === "add"
                      ? "bg-green-100 text-green-700 border-2 border-green-500"
                      : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <Plus size={20} />
                  Add Credits
                </button>
                <button
                  type="button"
                  onClick={() => setOperationType("subtract")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    operationType === "subtract"
                      ? "bg-red-100 text-red-700 border-2 border-red-500"
                      : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <Minus size={20} />
                  Subtract Credits
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for adjustment (max 500 characters)"
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
              <div className="text-sm text-gray-500 mt-1 text-right">
                {notes.length}/500 characters
              </div>
            </div>

            {message && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : operationType === "add"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : (
                `${operationType === "add" ? "Add" : "Subtract"} Credits`
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle
              size={20}
              className="text-blue-600 flex-shrink-0 mt-0.5"
            />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Enter the user's email address to adjust their credits</li>
                <li>Add credits to increase balance, subtract to decrease</li>
                <li>Always provide a clear reason for the adjustment</li>
                <li>Changes are immediate and cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
