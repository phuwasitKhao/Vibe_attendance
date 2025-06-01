'use client'

import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AttendanceStatus } from '@/types';
import { useStudents } from '@/hooks/useStudents';
import { useAttendance } from '@/hooks/useAttendance';

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});

  const { students, loading: studentsLoading } = useStudents();
  const { attendances, loading: attendanceLoading, saveBulkAttendance } = useAttendance(selectedDate);
  const [isSaving, setIsSaving] = useState(false);

  // โหลดข้อมูลการเช็คชื่อเมื่อเปลี่ยนวันที่
  useEffect(() => {
    const records: Record<string, AttendanceRecord> = {};
    attendances.forEach(att => {
      records[att.studentId] = {
        studentId: att.studentId,
        status: att.status as AttendanceStatus
      };
    });
    setAttendanceRecords(records);
  }, [attendances]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        studentId,
        status
      }
    }));
  };

  const getAttendanceStatus = (studentId: string): AttendanceStatus => {
    return attendanceRecords[studentId]?.status || AttendanceStatus.PRESENT;
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'bg-green-100 text-green-800 border-green-200';
      case AttendanceStatus.ABSENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case AttendanceStatus.LATE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case AttendanceStatus.EXCUSED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'มา';
      case AttendanceStatus.ABSENT:
        return 'ไม่มา';
      case AttendanceStatus.LATE:
        return 'สาย';
      case AttendanceStatus.EXCUSED:
        return 'ลา';
      default:
        return 'มา';
    }
  };

  const saveAttendance = async () => {
    setIsSaving(true);

    try {
      const attendanceData = students.map(student => ({
        studentId: student.id,
        status: getAttendanceStatus(student.id)
      }));

      await saveBulkAttendance(attendanceData);

      alert(`บันทึกการเช็คชื่อวันที่ ${format(selectedDate, 'dd MMMM yyyy', { locale: th })} เรียบร้อยแล้ว!`);
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const markAllPresent = () => {
    const newRecords: Record<string, AttendanceRecord> = {};
    students.forEach(student => {
      newRecords[student.id] = {
        studentId: student.id,
        status: AttendanceStatus.PRESENT
      };
    });
    setAttendanceRecords(newRecords);
  };

  const clearAll = () => {
    setAttendanceRecords({});
  };

  const getStatusCount = (status: AttendanceStatus) => {
    return Object.values(attendanceRecords).filter(r => r.status === status).length;
  };

  if (studentsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีข้อมูลนักเรียน</h3>
            <p className="text-gray-500 mb-4">กรุณาเพิ่มรายชื่อนักเรียนก่อนเริ่มเช็คชื่อ</p>
            <Button
              onClick={() => window.location.href = '/students'}
            >
              ไปหน้าจัดการนักเรียน
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Card className="mb-6">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            ระบบเช็คชื่อนักเรียน
          </h1>

          {/* Date Navigation */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Button
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              variant="secondary"
            >
              ← วันก่อน
            </Button>

            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {format(selectedDate, 'EEEE', { locale: th })}
              </div>
              <div className="text-lg text-gray-600">
                {format(selectedDate, 'dd MMMM yyyy', { locale: th })}
              </div>
            </div>

            <Button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              variant="secondary"
            >
              วันถัดไป →
            </Button>
          </div>

          <div className="text-center space-x-2">
            <Button
              onClick={() => setSelectedDate(new Date())}
              variant="secondary"
              size="sm"
            >
              วันนี้
            </Button>

            <Button
              onClick={markAllPresent}
              size="sm"
            >
              เช็คมาทั้งหมด
            </Button>

            <Button
              onClick={clearAll}
              size="sm"
            >
              ล้างทั้งหมด
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading indicator */}
      {attendanceLoading && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-600">กำลังโหลดข้อมูลการเช็คชื่อ...</span>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <Card className="mb-6">
        <div className="px-6 py-4 bg-gray-100 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            รายชื่อนักเรียน ({students.length} คน)
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {students.map((student, index) => (
            <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      รหัส: {student.studentId}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {Object.values(AttendanceStatus).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleAttendanceChange(student.id, status)}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2
                        ${getAttendanceStatus(student.id) === status
                          ? getStatusColor(status) + ' shadow-md transform scale-105'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }
                      `}
                    >
                      {getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary */}
      <Card className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">สรุปการเช็คชื่อ</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {getStatusCount(AttendanceStatus.PRESENT)}
              </div>
              <div className="text-sm text-green-600">มาเรียน</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {getStatusCount(AttendanceStatus.ABSENT)}
              </div>
              <div className="text-sm text-red-600">ขาดเรียน</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {getStatusCount(AttendanceStatus.LATE)}
              </div>
              <div className="text-sm text-yellow-600">มาสาย</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {getStatusCount(AttendanceStatus.EXCUSED)}
              </div>
              <div className="text-sm text-blue-600">ลา</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">ความคืบหน้าการเช็คชื่อ</span>
              <span className="text-sm text-gray-500">
                {Object.keys(attendanceRecords).length}/{students.length} คน
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${students.length > 0 ? (Object.keys(attendanceRecords).length / students.length) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="text-center">
        <Button
          onClick={saveAttendance}
          disabled={isSaving || Object.keys(attendanceRecords).length === 0}
          size="lg"
          className="px-8 py-3"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              บันทึกการเช็คชื่อ ({Object.keys(attendanceRecords).length}/{students.length})
            </>
          )}
        </Button>

        {Object.keys(attendanceRecords).length === 0 && students.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            กรุณาเช็คชื่อนักเรียนอย่างน้อย 1 คนก่อนบันทึก
          </p>
        )}
      </div>

      {/* Quick Stats */}
      {Object.keys(attendanceRecords).length > 0 && (
        <Card className="mt-6">
          <div className="p-4 bg-blue-50">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-900">
                  {Math.round((getStatusCount(AttendanceStatus.PRESENT) / Object.keys(attendanceRecords).length) * 100)}%
                </div>
                <div className="text-blue-600">อัตราการมาเรียน</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-900">
                  {Object.keys(attendanceRecords).length}
                </div>
                <div className="text-blue-600">เช็คชื่อแล้ว</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-900">
                  {students.length - Object.keys(attendanceRecords).length}
                </div>
                <div className="text-blue-600">ยังไม่เช็ค</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
