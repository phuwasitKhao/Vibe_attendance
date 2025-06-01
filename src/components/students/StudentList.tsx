import { useState } from 'react';
import { Student } from '@/types';
import { Button } from '@/components/ui/button'; // แก้จาก button เป็น Button

interface StudentListProps {
  students: Student[];
  onEdit: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export default function StudentList({ students, onEdit, onDelete }: StudentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditValue(student.name);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onEdit(editingId, editValue);
      setEditingId(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบนักเรียน</h3>
        <p className="text-gray-500">อัพโหลดไฟล์ Excel เพื่อเริ่มต้นใช้งาน</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student, index) => (
        <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-semibold">
                {index + 1}
              </span>
            </div>

            {editingId === student.id ? (
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={handleKeyPress}
                  placeholder="ชื่อ-นามสกุลนักเรียน"
                />
                <Button
                  onClick={saveEdit}
                  variant="success"
                  size="sm"
                  disabled={!editValue.trim()}
                >
                  บันทึก
                </Button>
                <Button
                  onClick={cancelEdit}
                  variant="secondary"
                  size="sm"
                >
                  ยกเลิก
                </Button>
              </div>
            ) : (
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-500">
                  รหัส: {student.studentId}
                </p>
              </div>
            )}
          </div>

          {editingId !== student.id && (
            <div className="flex space-x-2">
              <Button
                onClick={() => startEdit(student)}
                variant="secondary"
                size="sm"
                className="flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>แก้ไข</span>
              </Button>
              <Button
                onClick={() => onDelete(student.id)}
                variant="danger"
                size="sm"
                className="flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>ลบ</span>
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
