export const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now - past) / 1000); // Difference in seconds

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  // Format the date as "Month Day, Year"
  return past.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
