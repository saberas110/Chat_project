import {useEffect, useState} from "react";


export default function useLastSeen(lastSeenTime) {


  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!lastSeenTime) return '';

      const lastSeen = new Date(lastSeenTime);
      const now = new Date()
      const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));


      if (diffInMinutes < 1) {
        return 'همین الان';
      } else if (diffInMinutes < 60) {
        return `دقیقه پیش ${diffInMinutes}`;
      } else {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}  ساعت پیش `;
      }
    };


    setTimeAgo(calculateTimeAgo());

    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo());
    }, 60000);

    return () => clearInterval(interval);
  }, [lastSeenTime]);

  return timeAgo;
}