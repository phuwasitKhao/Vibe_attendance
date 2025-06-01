'use client'

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

interface ReportData {
  student: {
    id: string;
    name: string;
    studentId: string;
  };
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  attendanceRate: number;
}

interface ReportSummary {
  totalStudents: number;
  avgAttendanceRate: number;
  totalAbsent: number;
  schoolDaysInMonth: number;
}

const months = [
  { value: 1, name: 'มกราคม' },
  { value: 2, name: 'กุมภาพันธ์' },
  { value: 3, name: 'มีนาคม' },
  { value: 4, name: 'เมษายน' },
  { value: 5, name: 'พฤษภาคม' },
  { value: 6, name: 'มิถุนายน' },
  { value: 7, name: 'กรกฎาคม' },
  { value: 8, name: 'สิงหาคม' },
  { value: 9, name: 'กันยายน' },
  { value: 10, name: 'ตุลาคม' },
  { value: 11, name: 'พฤศจิกายน' },
  { value: 12, name: 'ธันวาคม' },
];

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?month=${selectedMonth}&year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data.students);
        setSummary(data.summary);
      } else {
        console.error('Failed to fetch report');
        setReportData([]);
        setSummary(null);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setReportData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]); const exportToExcel = async () => {
    setIsExporting(true);

    try {
      if (reportData.length === 0) {
        alert('ไม่มีข้อมูลสำหรับส่งออก');
        return;
      }

      // เตรียมข้อมูลสำหรับ Excel
      const excelData = [
        // Header
        ['รายงานการเช็คชื่อนักเรียน'],
        [`เดือน: ${months.find(m => m.value === selectedMonth)?.name} ${selectedYear}`],
        [`วันที่สร้างรายงาน: ${format(new Date(), 'dd MMMM yyyy เวลา HH:mm น.', { locale: th })}`],
        [''],
        ['ลำดับ', 'ชื่อ-นามสกุล', 'รหัสนักเรียน', 'มาเรียน', 'ขาดเรียน', 'มาสาย', 'ลา', 'รวม', 'เปอร์เซ็นต์การมาเรียน'],
        // Data
        ...reportData.map((item, index) => [
          index + 1,
          item.student.name,
          item.student.studentId,
          item.present,
          item.absent,
          item.late,
          item.excused,
          item.total,
          `${item.attendanceRate}%`
        ]),
        [''],
        // Summary
        ['สรุปรวม'],
        ['จำนวนนักเรียนทั้งหมด', summary?.totalStudents || 0],
        ['วันเรียนในเดือน', summary?.schoolDaysInMonth || 0],
        ['อัตราการมาเรียนเฉลี่ย', `${summary?.avgAttendanceRate || 0}%`],
        ['จำนวนการขาดเรียนรวม', summary?.totalAbsent || 0],
        [''],
        ['หมายเหตุ:'],
        ['- มาเรียน = นักเรียนมาเรียนตรงเวลา'],
        ['- ขาดเรียน = นักเรียนไม่มาเรียนโดยไม่มีการแจ้ง'],
        ['- มาสาย = นักเรียนมาเรียนแต่สาย'],
        ['- ลา = นักเรียนลาป่วยหรือลากิจ'],
      ];

      // สร้าง workbook
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();

      // ตั้งค่าความกว้างของ columns
      ws['!cols'] = [
        { wch: 8 },   // ลำดับ
        { wch: 25 },  // ชื่อ-นามสกุล
        { wch: 12 },  // รหัสนักเรียน
        { wch: 10 },  // มาเรียน
        { wch: 10 },  // ขาดเรียน
        { wch: 10 },  // มาสาย
        { wch: 8 },   // ลา
        { wch: 8 },   // รวม
        { wch: 18 }   // เปอร์เซ็นต์
      ];

      // สไตล์สำหรับ header
      const headerStyle = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'center' }
      };

      // ใส่สไตล์ให้ header
      if (ws['A1']) ws['A1'].s = headerStyle;
      if (ws['A2']) ws['A2'].s = { font: { bold: true } };

      XLSX.utils.book_append_sheet(wb, ws, 'รายงานการเช็คชื่อ');

      // ดาวน์โหลดไฟล์
      const fileName = `รายงานการเช็คชื่อ_${months.find(m => m.value === selectedMonth)?.name}_${selectedYear}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์');
    } finally {
      setIsExporting(false);
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 80) return 'text-yellow-600 bg-yellow-50';
    if (rate >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            รายงานการเช็คชื่อ
          </h1>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เดือน
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ปี
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[2023, 2024, 2025, 2026, 2027].map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="self-end">
                <Button
                  onClick={fetchReport}
                  disabled={loading}
                  variant="primary"
                >
                  {loading ? 'กำลังโหลด...' : 'ดูรายงาน'}
                </Button>
              </div>
            </div>

            <Button
              onClick={exportToExcel}
              disabled={isExporting || reportData.length === 0}
              className="flex items-center space-x-2"
              variant="success"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>กำลังส่งออก...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>ส่งออก Excel</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดรายงาน...</p>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {summary.totalStudents}
              </div>
              <div className="text-sm text-gray-600">นักเรียนทั้งหมด</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <div className={`text-3xl font-bold ${summary.avgAttendanceRate >= 90 ? 'text-green-600' :
                summary.avgAttendanceRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                {summary.avgAttendanceRate}%
              </div>
              <div className="text-sm text-gray-600">อัตราการมาเรียนเฉลี่ย</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {summary.totalAbsent}
              </div>
              <div className="text-sm text-gray-600">ขาดเรียนรวม</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {summary.schoolDaysInMonth}
              </div>
              <div className="text-sm text-gray-600">วันเรียนในเดือน</div>
            </div>
          </Card>
        </div>
      )}

      {/* No Data Message */}
      {!loading && reportData.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีข้อมูลการเช็คชื่อ</h3>
            <p className="text-gray-500 mb-4">
              ยังไม่มีการเช็คชื่อในเดือน{months.find(m => m.value === selectedMonth)?.name} {selectedYear}
            </p>
            <Button as="a" href="/attendance" variant="primary">
              ไปหน้าเช็คชื่อ
            </Button>
          </div>
        </Card>
      )}

      {/* Attendance Table */}
      {!loading && reportData.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              รายละเอียดการเช็คชื่อ - {months.find(m => m.value === selectedMonth)?.name} {selectedYear}
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ลำดับ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อ-นามสกุล
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รหัส
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      มาเรียน
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ขาดเรียน
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      มาสาย
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ลา
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รวม
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เปอร์เซ็นต์
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((item, index) => (
                    <tr key={item.student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {item.student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {item.present}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {item.absent}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {item.late}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.excused}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {item.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getAttendanceColor(item.attendanceRate)}`}>
                          {item.attendanceRate}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
