import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - ดึงรายชื่อนักเรียนทั้งหมด
export async function GET() {
  try {
    console.log('Fetching students from database...'); // Debug

    const students = await prisma.student.findMany({
      orderBy: { studentId: 'asc' }
    });

    console.log('Found students:', students.length); // Debug
    return NextResponse.json(students);
  } catch (error: unknown) {
    console.error('Database error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch students', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST - เพิ่มนักเรียนใหม่ (หรือหลายคนพร้อมกัน)
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

      // ลบนักเรียนเก่าทั้งหมดก่อน (ถ้าต้องการ)
      if (body.replaceAll) {
        console.log('Deleting existing students and attendance records...'); // Debug

        // ลบข้อมูลการเช็คชื่อก่อน (เพราะมี foreign key constraint)
        const deletedAttendance = await prisma.attendance.deleteMany();
        console.log('Deleted attendance records:', deletedAttendance.count);

        // จากนั้นลบนักเรียน
        const deletedStudents = await prisma.student.deleteMany();
        console.log('Deleted students:', deletedStudents.count);
      }

      console.log('Creating new students...'); // Debug

      // สร้างนักเรียนทีละคน (เพื่อหลีกเลี่ยงปัญหา createMany)
      const createdStudents = [];
      for (const studentData of studentsData) {
        try {
          const student = await prisma.student.create({
            data: studentData
          });
          createdStudents.push(student);
          console.log(`Created student: ${student.name}`); // Debug
        } catch (createError: unknown) {
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

  } catch (error: unknown) {
    console.error('Error in POST /api/students:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as { code?: string }).code;

    // ตรวจสอบ error types ต่างๆ
    if (errorCode === 'P2002') {
      return NextResponse.json(
        {
          error: 'Duplicate student ID',
          details: 'A student with this ID already exists'
        },
        { status: 409 }
      );
    }

    if (errorCode === 'P2003') {
      return NextResponse.json(
        {
          error: 'Foreign key constraint failed',
          details: errorMessage
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create students',
        details: errorMessage,
        code: errorCode || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}

// DELETE - ลบนักเรียนทั้งหมด
export async function DELETE() {
  try {
    console.log('DELETE /api/students called - deleting all students'); // Debug

    // ลบข้อมูลการเช็คชื่อก่อน (เพราะมี foreign key constraint)
    const deletedAttendance = await prisma.attendance.deleteMany();
    console.log('Deleted attendance records:', deletedAttendance.count);

    // จากนั้นลบนักเรียนทั้งหมด
    const deletedStudents = await prisma.student.deleteMany();
    console.log('Deleted students:', deletedStudents.count);

    return NextResponse.json({
      success: true,
      message: 'ลบนักเรียนทั้งหมดเรียบร้อยแล้ว',
      deletedStudents: deletedStudents.count,
      deletedAttendance: deletedAttendance.count
    });
  } catch (error: unknown) {
    console.error('Error deleting all students:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as { code?: string }).code;
    return NextResponse.json(
      {
        error: 'Failed to delete students',
        details: errorMessage,
        code: errorCode || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}
