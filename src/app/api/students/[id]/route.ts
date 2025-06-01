import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - แก้ไขข้อมูลนักเรียน
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;
    const { name, studentId, className } = await request.json();

    const student = await prisma.student.update({
      where: { id },
      data: {
        name: name?.trim(),
        studentId,
        className: className || null
      }
    });

    return NextResponse.json(student);
  } catch (error: unknown) {
    console.error('Error updating student:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update student', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - ลบนักเรียน
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;

    await prisma.student.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'ลบนักเรียนเรียบร้อยแล้ว' });
  } catch (error: unknown) {
    console.error('Error deleting student:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete student', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - ดึงข้อมูลนักเรียนคนเดียว (เพิ่มเติม)
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 10 // แสดง 10 รายการล่าสุด
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error: unknown) {
    console.error('Error fetching student:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch student', details: errorMessage },
      { status: 500 }
    );
  }
}
