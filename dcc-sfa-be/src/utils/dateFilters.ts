export function getTimeFilter(
  timeFilter: string | undefined,
  start_date?: string | undefined,
  end_date?: string | undefined
): any | undefined {
  if (start_date || end_date) {
    const range: any = {};
    if (start_date) {
      const s = new Date(
        start_date.includes('T') ? start_date : `${start_date}T00:00:00.000Z`
      );
      if (!isNaN(s.getTime())) range.gte = s;
    }
    if (end_date) {
      const e = new Date(
        end_date.includes('T') ? end_date : `${end_date}T23:59:59.999Z`
      );
      if (!isNaN(e.getTime())) range.lte = e;
    }
    if (range.gte || range.lte) {
      return range;
    }
  }

  if (!timeFilter || timeFilter === 'all' || timeFilter === 'custom')
    return undefined;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (timeFilter) {
    case 'today': {
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      return { gte: today, lte: endOfToday };
    }
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return { gte: yesterday, lte: endOfYesterday };
    }
    case 'this_week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { gte: startOfWeek };
    }
    case 'this_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { gte: startOfMonth };
    }
    case 'prev_month': {
      const startOfPrevMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      endOfPrevMonth.setHours(23, 59, 59, 999);
      return { gte: startOfPrevMonth, lte: endOfPrevMonth };
    }
    case 'this_year': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { gte: startOfYear };
    }
    case 'prev_year': {
      const startOfPrevYear = new Date(today.getFullYear() - 1, 0, 1);
      const endOfPrevYear = new Date(today.getFullYear() - 1, 11, 31);
      endOfPrevYear.setHours(23, 59, 59, 999);
      return { gte: startOfPrevYear, lte: endOfPrevYear };
    }
    default:
      return undefined;
  }
}
