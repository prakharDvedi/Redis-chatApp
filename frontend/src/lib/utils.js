export function lastseen(timestamp) {
  if (!timestamp) return "Offline";

  const now = new Date();
  const last = new Date(timestamp);
  const diffseconds = Math.floor((now.getTime() - last.getTime()) / 1000);
  if (diffseconds < 60) return "Online just now";

  const diffMinutes = Math.floor(diffseconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
}
