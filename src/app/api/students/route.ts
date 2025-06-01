// src/app/api/students/route.ts (แก้ไขส่วน POST)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/students called'); // Debug

    const body = await request.json();
    console.log('Request body:', body); // Debug

    // ถ้าเป็น array (อัพโหลดจาก Excel)
    if (body.students && Array.isArray(body.students)) {
      console.log('Processing Excel upload with students:', body.students.length); // Debug

      if (body.students.length === 0) {
        return NextResponse.json(
          { error: 'No students to add' },
          { status: 400 }
        );
      }

      // เตรียมข้อมูลนักเรียน
      const studentsData = body.students.map((name: string, index: number) => {
        if (!name || typeof name !== 'string') {
          throw new Error(`Invalid student name at index ${index}: ${name}`);
        }

        const trimmedName = name.trim();
        if (trimmedName.length === 0) {
          throw new Error(`Empty student name at index ${index}`);
        }

        return {
          name: trimmedName,
          studentId: (index + 1).toString().padStart(3, '0'),
          className: null
        };
      });

      console.log('Prepared students data:', studentsData); // Debug

      // ลบข้อมูลเก่าถ้าต้องการ
      if (body.replaceAll) {
        console.log('Deleting existing data...'); // Debug

        // ลบทีละขั้นตอนเพื่อหลีกเลี่ยง foreign key constraint
        await prisma.attendance.deleteMany({});
        await prisma.student.deleteMany({});
      }

      // สร้างนักเรียนทีละคน (เพื่อหลีกเลี่ยงปัญหา createMany)
      const createdStudents = [];
      for (const studentData of studentsData) {
        try {
          const student = await prisma.student.create({
            data: studentData
          });
          createdStudents.push(student);
          console.log(`Created student: ${student.name}`); // Debug
        } catch (createError: any) {
          console.error(`Error creating student ${studentData.name}:`, createError);
          // ข้ามนักเรียนที่สร้างไม่ได้
          continue;
        }
      }

      console.log('Students created successfully:', createdStudents.length); // Debug

      return NextResponse.json({
        success: true,
        message: `เพิ่มนักเรียน ${createdStudents.length} คนเรียบร้อยแล้ว`,
        count: createdStudents.length,
        students: createdStudents
      }, { status: 201 });
    }
    // ถ้าเป็นนักเรียนคนเดียว
    else if (body.name) {
      console.log('Creating single student:', body.name); // Debug

      const { name, studentId, className } = body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Student name is required' },
          { status: 400 }
        );
      }

      const student = await prisma.student.create({
        data: {
          name: name.trim(),
          studentId: studentId || `STD_${Date.now()}`,
          className: className || null
        }
      });

      console.log('Single student created:', student); // Debug

      return NextResponse.json(student, { status: 201 });
    }
    else {
      return NextResponse.json(
        { error: 'Invalid request: either "students" array or "name" is required' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error in POST /api/students:', error);

    return NextResponse.json(
      {
        error: 'Failed to create students',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET และ DELETE functions อื่นๆ ใช้เหมือนเดิม
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { studentId: 'asc' }
    });

    return NextResponse.json(students);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.attendance.deleteMany({});
    await prisma.student.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'ลบนักเรียนทั้งหมดเรียบร้อยแล้ว'
    });
  } catch (error: any) {
    console.error('Error deleting all students:', error);
    return NextResponse.json(
      { error: 'Failed to delete students', details: error.message },
      { status: 500 }
    );
  }
}
