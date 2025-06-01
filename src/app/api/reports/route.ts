import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูลรายงานตามเดือน
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '1');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // คำนวณช่วงวันที่
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // ดึงข้อมูลนักเรียนทั้งหมด
    const students = await prisma.student.findMany({
      orderBy: { studentId: 'asc' }
    });

    // ดึงข้อมูลการเช็คชื่อในเดือนนั้น
    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        student: true
      }
    });

    // สร้างรายงาน
    const report = students.map(student => {
      const studentAttendances = attendances.filter(att => att.studentId === student.id);

      const present = studentAttendances.filter(att => att.status === 'PRESENT').length;
      const absent = studentAttendances.filter(att => att.status === 'ABSENT').length;
      const late = studentAttendances.filter(att => att.status === 'LATE').length;
      const excused = studentAttendances.filter(att => att.status === 'EXCUSED').length;
      const total = present + absent + late + excused;
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        student,
        present,
        absent,
        late,
        excused,
        total,
        attendanceRate
      };
    });

    // คำนวณสถิติรวม
    const totalStudents = students.length;
    const avgAttendanceRate = report.length > 0
      ? Math.round(report.reduce((acc, r) => acc + r.attendanceRate, 0) / report.length)
      : 0;
    const totalAbsent = report.reduce((acc, r) => acc + r.absent, 0);
    const schoolDaysInMonth = Math.max(...report.map(r => r.total), 0);

    return NextResponse.json({
      month,
      year,
      students: report,
      summary: {
        totalStudents,
        avgAttendanceRate,
        totalAbsent,
        schoolDaysInMonth
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
