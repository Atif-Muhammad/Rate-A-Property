export const changeToLocalTime = (date) => {
  const utcDate = new Date(date);
  const localDateTime = utcDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true, // You can change this to false for 24-hour format
  });
  return localDateTime;
};
