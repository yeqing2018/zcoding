const Statistics = (() => {
  const RECORDS_KEY = 'timer_records';
  const MAX_RECORDS = 1000;

  const addRecord = (record) => {
    try {
      const records = getRecords();
      const newRecord = {
        id: 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...record,
        createdAt: Date.now()
      };
      
      records.unshift(newRecord);
      
      if (records.length > MAX_RECORDS) {
        records.splice(MAX_RECORDS);
      }
      
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
      return newRecord;
    } catch (e) {
      console.error('Failed to add record:', e);
      return null;
    }
  };

  const getRecords = (filter = {}) => {
    try {
      const saved = localStorage.getItem(RECORDS_KEY);
      let records = saved ? JSON.parse(saved) : [];
      
      if (filter.timerId) {
        records = records.filter(r => r.timerId === filter.timerId);
      }
      
      if (filter.mode) {
        records = records.filter(r => r.mode === filter.mode);
      }
      
      if (filter.startDate) {
        records = records.filter(r => r.startTime >= filter.startDate);
      }
      
      if (filter.endDate) {
        records = records.filter(r => r.endTime <= filter.endDate);
      }
      
      if (filter.completed !== undefined) {
        records = records.filter(r => r.completed === filter.completed);
      }
      
      return records;
    } catch (e) {
      console.error('Failed to get records:', e);
      return [];
    }
  };

  const getSummary = () => {
    const records = getRecords();
    
    if (records.length === 0) {
      return {
        totalCount: 0,
        totalRecords: 0,
        totalDuration: 0,
        completedCount: 0,
        averageDuration: 0,
        completionRate: 0,
        longestDuration: 0,
        shortestDuration: Infinity
      };
    }
    
    const totalDuration = records.reduce((sum, r) => sum + (r.duration || 0), 0);
    const completedCount = records.filter(r => r.completed).length;
    const durations = records.map(r => r.duration || 0).filter(d => d > 0);
    
    return {
      totalCount: records.length,
      totalRecords: records.length,
      totalDuration,
      completedCount,
      averageDuration: totalDuration / records.length,
      completionRate: Math.round((completedCount / records.length) * 100),
      longestDuration: durations.length > 0 ? Math.max(...durations) : 0,
      shortestDuration: durations.length > 0 ? Math.min(...durations) : 0
    };
  };

  const getDailyStats = (days = 7) => {
    const records = getRecords();
    const result = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayRecords = records.filter(r => 
        (r.endTime || r.createdAt || 0) >= date.getTime() && (r.endTime || r.createdAt || 0) < nextDate.getTime()
      );
      
      result.push({
        date: date.toISOString().split('T')[0],
        count: dayRecords.length,
        duration: Math.round(dayRecords.reduce((sum, r) => sum + (r.duration || 0), 0) / 60000),
        completed: dayRecords.filter(r => r.completed).length
      });
    }
    
    return result;
  };

  const getTimerStats = (timerId) => {
    const records = getRecords({ timerId });
    
    if (records.length === 0) {
      return {
        totalRuns: 0,
        totalTime: 0,
        averageTime: 0,
        successRate: 0
      };
    }
    
    const totalTime = records.reduce((sum, r) => sum + (r.duration || 0), 0);
    const completed = records.filter(r => r.completed).length;
    
    return {
      totalRuns: records.length,
      totalTime,
      averageTime: totalTime / records.length,
      successRate: (completed / records.length) * 100,
      lastRun: records[0]
    };
  };

  const exportCSV = (records) => {
    const data = records || getRecords();
    if (!data || data.length === 0) return '';
    
    const headers = ['ID', '计时器ID', '计时器名称', '模式', '时长(毫秒)', '是否完成', '结束时间', '循环次数'];
    
    const rows = data.map(r => [
      r.id,
      r.timerId,
      r.timerName,
      r.mode === 'countdown' ? '倒计时' : '正计时',
      r.duration,
      r.completed ? '是' : '否',
      new Date(r.endTime || r.createdAt).toLocaleString('zh-CN'),
      r.loopCount || 0
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return '\uFEFF' + csvContent;
  };

  const exportJSON = (records) => {
    const data = records || getRecords();
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content, filename, type = 'text/csv') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearRecords = () => {
    localStorage.removeItem(RECORDS_KEY);
  };

  return {
    addRecord,
    getRecords,
    getSummary,
    getDailyStats,
    getTimerStats,
    exportCSV,
    exportJSON,
    downloadFile,
    clearRecords
  };
})();
