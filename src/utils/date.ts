export function getLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateForInput(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function calculateInitialStreak(): number {
  const storedStreak = localStorage.getItem("egw_streak_count");
  const storedLastReadDate = localStorage.getItem("egw_last_read_date");
  if (storedStreak && storedLastReadDate) {
    const streak = parseInt(storedStreak, 10) || 0;
    const todayStr = getLocalDateString(new Date());
    const lastRead = new Date(storedLastReadDate + "T00:00:00");
    const today = new Date(todayStr + "T00:00:00");
    
    const diffTime = today.getTime() - lastRead.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (todayStr === storedLastReadDate || diffDays === 1) {
      return streak;
    }
  }
  return 0;
}
