'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data - จะเปลี่ยนเป็น API จริงภายหลัง
const mockStats = {
  totalStudents: 35,
  presentToday: 32,
  absentToday: 2,
  lateToday: 1,
  excusedToday: 0
};

const recentActivities = [
  {
    id: 1,
    type: 'attendance',
    message: 'เช็คชื่อวันที่ 1 มิถุนายน 2025 เรียบร้อยแล้ว',
    time: '09:30 น.',
    date: new Date()
  },
  {
    id: 2,
    type: 'student',
    message: 'เพิ่มนักเรียนใหม่: นายสมชาย ใจดี',
    time: '08:45 น.',
    date: new Date()
  },
  {
    id: 3,
    type: 'export',
    message: 'ส่งออกรายงานเดือนพฤษภาคม 2025',
    time: '16:30 น.',
    date: new Date(Date.now() - 86400000) // เมื่อวาน
  }
];

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const attendanceRate = Math.round((mockStats.presentToday / mockStats.totalStudents) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          ระบบเช็คชื่อนักเรียน
        </h1>
        <p className="text-lg text-gray-600">
          สำหรับครูและผู้ดูแลนักเรียน
        </p>
        <div className="mt-4 text-xl text-blue-600 font-medium">
          {format(currentTime, 'EEEE ที่ dd MMMM yyyy เวลา HH:mm:ss น.', { locale: th })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            เมนูหลัก
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/attendance">
              <Button
                className="w-full h-24 text-lg bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center space-y-2"
                variant="success"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>เช็คชื่อนักเรียน</span>
              </Button>
            </Link>

            <Link href="/students">
              <Button
                className="w-full h-24 text-lg bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center space-y-2"
                variant="primary"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>จัดการนักเรียน</span>
              </Button>
            </Link>

            <Link href="/reports">
              <Button
                className="w-full h-24 text-lg bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center space-y-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>รายงานและส่งออก</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              สรุปการเช็คชื่อวันนี้
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">จำนวนนักเรียนทั้งหมด</span>
                <span className="text-2xl font-bold text-gray-900">{mockStats.totalStudents} คน</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{mockStats.presentToday}</div>
                  <div className="text-sm text-green-600">มาเรียน</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{mockStats.absentToday}</div>
                  <div className="text-sm text-red-600">ขาดเรียน</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{mockStats.lateToday}</div>
                  <div className="text-sm text-yellow-600">มาสาย</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{mockStats.excusedToday}</div>
                  <div className="text-sm text-blue-600">ลา</div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">อัตราการมาเรียน</span>
                  <span className="text-sm font-medium">{attendanceRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              กิจกรรมล่าสุด
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.type === 'attendance' ? 'bg-green-500' :
                    activity.type === 'student' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time} • {format(activity.date, 'dd MMM yyyy', { locale: th })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            คู่มือการใช้งานเบื้องต้น
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">เริ่มต้นใช้งาน</h3>
              <p className="text-sm text-gray-600">
                เพิ่มรายชื่อนักเรียนในระบบ หรืออัพโหลดจากไฟล์ Excel
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">เช็คชื่อรายวัน</h3>
              <p className="text-sm text-gray-600">
                เลือกวันที่และเช็คชื่อนักเรียนแต่ละคน (มา/ไม่มา/สาย/ลา)
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">ส่งออกรายงาน</h3>
              <p className="text-sm text-gray-600">
                ดาวน์โหลดรายงานการเช็คชื่อเป็นไฟล์ Excel ตามเดือนที่ต้องการ
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
