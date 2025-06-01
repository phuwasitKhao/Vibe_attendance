import { useState, useEffect, useCallback } from 'react';
import { Attendance, AttendanceStatus } from '@/types';

export function useAttendance(date: Date) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/attendance?date=${date.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const data = await response.json();
      setAttendances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);


  const saveAttendance = async (studentId: string, status: AttendanceStatus, note?: string) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          date: date.toISOString(),
          status,
          note
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }

      const savedAttendance = await response.json();

      // อัพเดท state
      setAttendances(prev => {
        const filtered = prev.filter(a => a.studentId !== studentId);
        return [...filtered, savedAttendance];
      });

      return savedAttendance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const saveBulkAttendance = async (attendanceData: Array<{ studentId: string, status: AttendanceStatus, note?: string }>) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendances: attendanceData,
          date: date.toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save attendance');
      }

      const result = await response.json();
      await fetchAttendance(); // รีเฟรชข้อมูล

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  return {
    attendances,
    loading,
    error,
    refetch: fetchAttendance,
    saveAttendance,
    saveBulkAttendance
  };
}
