// src/app/students/page.tsx
'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StudentList from '@/components/students/StudentList';
import ExcelUploader from '@/components/students/ExcelUploader';
import { useStudents } from '@/hooks/useStudents';

export default function StudentsPage() {
  const { students, loading, addStudents, updateStudent, deleteStudent } = useStudents();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const handleExcelUpload = async (studentNames: string[]) => {
    setIsUploading(true);
    setUploadStatus('idle');

    try {
      await addStudents(studentNames, true);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (err) {
      console.error('Error uploading students:', err);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('คุณต้องการลบนักเรียนคนนี้ใช่หรือไม่?')) {
      try {
        await deleteStudent(id);
      } catch (err) {
        console.error('Error deleting student:', err);
        alert('เกิดข้อผิดพลาดในการลบนักเรียน');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('คุณต้องการลบรายชื่อนักเรียนทั้งหมดใช่หรือไม่?')) {
      try {
        const response = await fetch('/api/students', { method: 'DELETE' });
        if (response.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error('Error clearing all students:', err);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleEditStudentName = async (id: string, newName: string) => {
    try {
      await updateStudent(id, newName);
    } catch (err) {
      console.error('Error updating student:', err);
      alert('เกิดข้อผิดพลาดในการแก้ไขชื่อ');
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลนักเรียน...</p>
        </div>
      </div>
    );
  }
  const handleSomeAction = async () => {
    try {
      // Your code here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            จัดการนักเรียน
          </h1>
          <p className="text-gray-600 mb-6">
            อัพโหลดไฟล์ Excel ที่มีรายชื่อนักเรียนใน column แรก (A) เพื่อนำเข้าข้อมูลนักเรียนทั้งหมด
          </p>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-700 font-medium">
                  นำเข้ารายชื่อนักเรียนสำเร็จ! ({students.length} คน)
                </span>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 font-medium">
                  เกิดข้อผิดพลาดในการนำเข้าไฟล์ กรุณาลองใหม่อีกครั้ง
                </span>
              </div>
            </div>
          )}

          {/* Excel Uploader */}
          <ExcelUploader
            onUpload={handleExcelUpload}
            isUploading={isUploading}
          />

          {/* Actions */}
          {students.length > 0 && (
            <div className="mt-6 flex gap-2">
              <Button
                onClick={handleClearAll}
                size="sm"
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>ลบทั้งหมด</span>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Students List */}
      {students.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                รายชื่อนักเรียน ({students.length} คน)
              </h2>
            </div>

            <StudentList
              students={students}
              onEdit={handleEditStudentName}
              onDelete={handleDeleteStudent}
            />
          </div>
        </Card>
      )}

      {/* Getting Started Guide */}
      {students.length === 0 && !loading && (
        <Card>
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">เริ่มต้นใช้งาน</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              อัพโหลดไฟล์ Excel ที่มีรายชื่อนักเรียนใน column A เพื่อเริ่มใช้งานระบบเช็คชื่อ
            </p>

            <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">รูปแบบไฟล์ Excel ที่รองรับ:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• ใส่รายชื่อในคอลัมน์ A (คอลัมน์แรก)</li>
                <li>• แต่ละแถวมีชื่อนักเรียน 1 คน</li>
                <li>• สามารถมีหัวข้อแถวแรกได้ (จะข้ามไป)</li>
                <li>• รองรับไฟล์ .xlsx และ .xls</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
