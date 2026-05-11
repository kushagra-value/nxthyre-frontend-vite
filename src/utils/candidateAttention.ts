/**
 * Shared utility for determining and formatting the "Attention" pill
 * used in candidate listing tables.
 */

export interface CandidateAttentionData {
  latest_call_status?: string | null;
  latest_manual_call_status?: string | null;
  latest_call_at?: string | null;
  latest_manual_call_at?: string | null;
  latest_call_note?: string | null;
  latest_manual_call_note?: string | null;
  latest_call_tags?: string[] | null;
  latest_manual_call_tags?: string[] | null;
  next_follow_up?: {
    scheduled_date: string;
    scheduled_time: string;
  } | null;
}

export const formatTimeAgo = (iso?: string): string => {
  if (!iso) return "--";
  const now = new Date();
  const past = new Date(iso);
  const diffInMs = now.getTime() - past.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays < 1) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) {
      return `${Math.floor(diffInMs / (1000 * 60))}m`;
    }
    return `${diffInHours}h`;
  }
  return `${diffInDays}d`;
};

export const getAttentionPill = (
  item: CandidateAttentionData,
  attentionTag?: { text: string; color: string }
) => {
  // 1. Follow-up Priority
  if (item.next_follow_up) {
    const { scheduled_date, scheduled_time } = item.next_follow_up;
    return {
      text: `Follow Up Scheduled on ${scheduled_date} ${scheduled_time}`,
      color: "blue"
    };
  }

  // 2. Manual/Platform Call Priority
  const status = item.latest_call_status || item.latest_manual_call_status;
  if (status) {
    const at = item.latest_call_at || item.latest_manual_call_at || "";
    const tags = item.latest_call_tags || item.latest_manual_call_tags;
    const note = item.latest_call_note || item.latest_manual_call_note;

    const daysAgo = formatTimeAgo(at);

    if (status === "completed" || status === "initiated") {
      const parts = [];
      if (tags && tags.length > 0) {
        parts.push(tags.join(", "));
      }
      if (note) {
        parts.push(`"${note}"`);
      }

      if (parts.length > 0) {
        return { text: parts.join(" - "), color: "blue" };
      }

      return { text: `Initiated ${daysAgo} ago`, color: "blue" };
    }

    // busy, not_picked_up, wrong_number
    let label = status.replace(/_/g, " ");
    if (label === "not picked up") label = "Call not picked up";
    else if (label === "wrong number") label = "Wrong Number";
    else if (label === "busy") label = "Call line busy";
    else label = label.charAt(0).toUpperCase() + label.slice(1);

    return { text: `${label} ${daysAgo} ago`, color: "red" };
  }

  // 3. Fallback
  if (attentionTag) {
    return { text: attentionTag.text, color: attentionTag.color };
  }

  return null;
};

export const formatMovedDate = (statusTags?: { text: string; color: string }[]): string => {
  if (!statusTags || statusTags.length === 0) return "0d";

  const movedTag = statusTags.find(tag =>
    tag.text.toLowerCase().includes("moved") ||
    tag.text.toLowerCase().includes("added")
  );

  if (!movedTag) return "0d";

  const text = movedTag.text.toLowerCase();

  if (text.includes("today")) return "0d";
  if (text.includes("yesterday")) return "1d";

  // Extract date from strings like "Moved on 31 Mar 2026" or "Moved 31 Mar 2026"
  const dateParts = movedTag.text.replace(/Moved on |Added on |Moved |Added /i, "").trim();
  const pastDate = new Date(dateParts);

  if (isNaN(pastDate.getTime())) return "0d";

  const now = new Date();
  // Clear time parts to compare only dates
  now.setHours(0, 0, 0, 0);
  const midnightPast = new Date(pastDate);
  midnightPast.setHours(0, 0, 0, 0);

  const diffInMs = now.getTime() - midnightPast.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return `${Math.max(0, diffInDays)}d`;
};
