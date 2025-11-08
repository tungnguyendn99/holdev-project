import * as moment from 'moment';
import 'moment/locale/vi'; // tuỳ chọn: để hiển thị tuần/tháng theo locale Việt Nam

export type GroupMode = 'day' | 'week' | 'month' | 'year';

export interface GroupedTradeData {
  profit: string; // tổng result dạng '$'
  reward: string; // tổng reward dạng 'xR'
  trades: string; // số lượng trades dạng 'x trades'
  winrate: string; // phần trăm thắng
  dayProfit: boolean; // có lời không
  dayLoss: boolean; // có lỗ không
  count: number; // tổng số trades trong nhóm
}

/**
 * Group trades theo ngày, tuần hoặc tháng (dùng moment)
 * @param trades Danh sách trades
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
  const baseDate = dateString ? moment(dateString, format) : moment();

  const startDate = baseDate.clone().startOf(mode).toDate();
  const endDate = baseDate.clone().endOf(mode).toDate();

  return { startDate, endDate };
}

export function groupTrades(trades: any[], group: GroupMode = 'day'): Record<string | number, GroupedTradeData> {
  const grouped: Record<string | number, any[]> = {};

  // 1️⃣ Group trades theo mode
  for (const trade of trades) {
    const date = moment(trade.closeTime);

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
    grouped[key].push(trade);
  }

  // 2️⃣ Tính toán kết quả cho từng nhóm
  const result: Record<string | number, GroupedTradeData> = {};

  for (const [key, group] of Object.entries(grouped)) {
    const profitSum = group.reduce((sum, t) => sum + (t.result || 0), 0).toFixed(2);
    const rewardSum = group.reduce((sum, t) => sum + (t.reward || 0), 0).toFixed(2);
    const winCount = group.filter((t) => t.result > 0).length;

    const total = group.length;
    const winrate = total > 0 ? Math.round((winCount / total) * 100) : 0;

    result[key] = {
      profit: `${profitSum}$`,
      reward: `${rewardSum}R`,
      trades: `${total} trade${total > 1 ? 's' : ''}`,
      winrate: `${winrate}%`,
      dayProfit: profitSum > 0,
      dayLoss: profitSum < 0,
      count: total,
    };
  }

  return result;
}
