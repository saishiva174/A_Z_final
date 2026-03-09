import axios from "axios";
export const DEFAULT_AVATAR = `/uploads/defaults/default_avatar.jpg`;
export const formatDateTime = (dateString) => {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short', // "Thu"
    day: 'numeric',   // "22"
    month: 'short',  
    year:'numeric', // "Jan"
    hour: 'numeric',
    minute: 'numeric',
    hour12: true      // "AM/PM"
  }).format(date);
};

export const handleUpdateStatus = async (bookingId, newStatus) => {
    return  await axios.patch(`/api/bookings/status/${bookingId}`, {
      status: newStatus
    });
};



