/**
 * Utility to parse Wallet API transaction description strings.
 *
 * Formats handled:
 *   "[APPROVED] By Admin: <id> | Proof: <url> | Note: <text>"
 *   "[REJECTED] By Admin: <id>. Reason: <text>"
 *   Automated messages (plain text or null)
 */

export interface ParsedTransactionInfo {
  isManualAction: boolean;
  action: "APPROVED" | "REJECTED" | null;
  adminId: string | null;
  proofUrl: string | null;
  note: string | null;
  rawDescription: string;
}

export function parseTransactionDescription(
  description: string | null,
): ParsedTransactionInfo {
  const raw = description ?? "";

  // Check for manual admin action pattern
  const actionMatch = raw.match(/^\[(APPROVED|REJECTED)\]/);
  if (!actionMatch) {
    return {
      isManualAction: false,
      action: null,
      adminId: null,
      proofUrl: null,
      note: null,
      rawDescription: raw,
    };
  }

  const action = actionMatch[1] as "APPROVED" | "REJECTED";

  // Extract adminId — appears after "By Admin: " up to the next "." or "|"
  let adminId: string | null = null;
  const adminMatch = raw.match(/By Admin:\s*([^.|]+)/);
  if (adminMatch) {
    adminId = adminMatch[1].trim();
  }

  // Extract proofUrl — appears after "Proof: " up to the next "|" or end
  let proofUrl: string | null = null;
  const proofMatch = raw.match(/Proof:\s*([^|]+)/);
  if (proofMatch) {
    proofUrl = proofMatch[1].trim();
  }

  // Extract note — appears after "Note: " or "Reason: " up to end of string
  let note: string | null = null;
  const noteMatch = raw.match(/(?:Note|Reason):\s*(.+)$/);
  if (noteMatch) {
    note = noteMatch[1].trim();
  }

  return {
    isManualAction: true,
    action,
    adminId,
    proofUrl,
    note,
    rawDescription: raw,
  };
}
