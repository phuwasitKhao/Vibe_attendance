import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงข้อมูลการเช็คชื่อตามวันที่
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let whereClause: any = {};

    if (date) {
      // ดึงข้อมูลตามวันที่เฉพาะ
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (month && year) {
      // ดึงข้อมูลตามเดือน
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

      whereClause.date = {
        gte: startOfMonth,
        lte: endOfMonth
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: true
      },
      orderBy: [
        { date: 'desc' },
        { student: { studentId: 'asc' } }
      ]
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST - บันทึกการเช็คชื่อ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ถ้าเป็นการบันทึกหลายคนพร้อมกัน
    if (Array.isArray(body.attendances)) {
      const { attendances, date } = body;
      const targetDate = new Date(date);

      // ลบข้อมูลเก่าของวันนั้นก่อน
      await prisma.attendance.deleteMany({
        where: {
          date: {
            gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            lte: new Date(targetDate.setHours(23, 59, 59, 999))
          }
        }
      });

      // สร้างข้อมูลใหม่
      const attendanceData = attendances.map((att: any) => ({
        studentId: att.studentId,
        date: new Date(date),
        status: att.status,
        note: att.note || null
      }));

      const createdAttendances = await prisma.attendance.createMany({
        data: attendanceData
      });

      return NextResponse.json({
        message: `บันทึกการเช็คชื่อ ${attendanceData.length} คนเรียบร้อยแล้ว`,
        count: createdAttendances.count
      });
    }
    // ถ้าเป็นการบันทึกคนเดียว
    else {
      const { studentId, date, status, note } = body;

      const attendance = await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId,
            date: new Date(date)
          }
        },
        update: {
          status,
          note: note || null
        },
        create: {
          studentId,
          date: new Date(date),
          status,
          note: note || null
        },
        include: {
          student: true
        }
      });

      return NextResponse.json(attendance);
    }
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    );
  }
}
