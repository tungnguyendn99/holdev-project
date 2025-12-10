import * as moment from 'moment';
import 'moment/locale/vi'; // tuỳ chọn: để hiển thị tuần/tháng theo locale Việt Nam

export type GroupMode = 'day' | 'week' | 'month' | 'year';

export interface GroupedSessionData {
  profit: string; // tổng result dạng '$'
  hands: string; // số lượng hands dạng 'x hands'
  winrate: string; // phần trăm thắng ?bb/100 hands
  dayProfit: boolean; // có lời không
  dayLoss: boolean; // có lỗ không
  count: number; // tổng số session trong nhóm
}

/**
 * Group sessions theo ngày, tuần hoặc tháng (dùng moment)
 * @param sessions Danh sách trades
 * @param mode 'day' | 'week' | 'month'
 * @returns Object đã group
 */

export function getDateRangeByMode(mode: 'day' | 'month' | 'year', dateString?: string) {
  const modeConfig: Record<string, string> = {
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
  };

  const format = modeConfig[mode] || 'YYYY-MM-DD';
  const baseDate = dateString ? moment.utc(dateString, format) : moment.utc();

  const startDate = baseDate.clone().startOf(mode).subtract(7, 'hours').toDate();
  const endDate = baseDate.clone().endOf(mode).subtract(7, 'hours').toDate();

  return { startDate, endDate };
}

export function groupSessions(sessions: any[], group: GroupMode = 'day'): Record<string | number, GroupedSessionData> {
  const grouped: Record<string | number, any[]> = {};

  // 1️⃣ Group trades theo mode
  for (const session of sessions) {
    const date = moment(session.startTime).utc().add(7, 'hours');

    let key: string | number;
    switch (group) {
      case 'year':
        key = date.format('YYYY'); // ví dụ: 2025
        break;
      case 'month':
        key = date.format('YYYY-MM'); // ví dụ: 2025-11
        break;
      case 'week':
        key = `${date.year()}-W${date.isoWeek()}`; // ví dụ: 2025-W45
        break;
      case 'day':
      default:
        key = date.format('YYYY-MM-DD'); // ví dụ: 2025-11-04
        break;
    }

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(session);
  }

  // 2️⃣ Tính toán kết quả cho từng nhóm
  const result: Record<string | number, GroupedSessionData> = {};

  for (const [key, group] of Object.entries(grouped)) {
    const profitSum = group.reduce((sum, t) => sum + (t.result || 0), 0).toFixed(1);
    const handsSum = group.reduce((sum, t) => sum + (t.hands || 0), 0);
    // const rewardSum = group.reduce((sum, t) => sum + (t.reward || 0), 0).toFixed(2);
    // const winCount = group.filter((t) => t.result > 0).length;

    const total = group.length;
    // const winrate = total > 0 ? Math.round((winCount / total) * 100) : 0;
    const winrate = calcWinrate(group);

    result[key] = {
      profit: profitSum,
      hands: handsSum,
      winrate: `${winrate}bb/100`,
      dayProfit: profitSum > 0,
      dayLoss: profitSum < 0,
      count: total,
    };
  }

  return result;
}

export function calcWinrate(sessions: any[]): number {
  if (!sessions || sessions.length === 0) return 0;

  const totalHands = sessions.reduce((sum, s) => sum + s.hands, 0);
  const totalResultBB = sessions.reduce((sum, s) => sum + s.resultBB, 0);

  if (totalHands === 0) return 0;

  const winrate = (totalResultBB / totalHands) * 100;

  return Math.round(winrate);
}

export function calculatePokerInfo(blind: string, totalBefore: number, totalAfter: number, result: number) {
  let resultBB = 0;
  let hands;
  let winrate;
  hands = totalAfter - totalBefore;
  if (result === 0) {
    return { hands, resultBB: 0, winrate: 0 };
  }
  if (totalAfter && result !== undefined) {
    resultBB = result / parseFloat(blind.split('/').pop() || '0');
    winrate = Math.round((resultBB / hands) * 100);
  }
  return { hands, resultBB, winrate };
}
