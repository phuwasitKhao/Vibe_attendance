import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - ดึงรายชื่อนักเรียนทั้งหมด
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { studentId: 'asc' }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - เพิ่มนักเรียนใหม่ (หรือหลายคนพร้อมกัน)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ถ้าเป็น array (อัพโหลดจาก Excel)
    if (Array.isArray(body.students)) {
      const studentsData = body.students.map((name: string, index: number) => ({
        name: name.trim(),
        studentId: (index + 1).toString().padStart(3, '0'),
      }));

      // ลบนักเรียนเก่าทั้งหมดก่อน (ถ้าต้องการ)
      if (body.replaceAll) {
        await prisma.student.deleteMany();
      }

      const students = await prisma.student.createMany({
        data: studentsData,
        skipDuplicates: true
      });

      return NextResponse.json({
        message: `เพิ่มนักเรียน ${studentsData.length} คนเรียบร้อยแล้ว`,
        count: students.count
      });
    }
    // ถ้าเป็นนักเรียนคนเดียว
    else {
      const { name, studentId, className } = body;

      const student = await prisma.student.create({
        data: {
          name: name.trim(),
          studentId: studentId || new Date().getTime().toString(),
          className: className || null
        }
      });

      return NextResponse.json(student, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

// DELETE - ลบนักเรียนทั้งหมด
export async function DELETE() {
  try {
    await prisma.attendance.deleteMany(); // ลบข้อมูลการเช็คชื่อก่อน
    await prisma.student.deleteMany();

    return NextResponse.json({ message: 'ลบนักเรียนทั้งหมดเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting all students:', error);
    return NextResponse.json(
      { error: 'Failed to delete students' },
      { status: 500 }
    );
  }
}
