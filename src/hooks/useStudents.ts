// src/hooks/useStudents.ts
import { useState, useEffect } from 'react';
import { Student } from '@/types';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/students');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched students:', data); // Debug
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStudents([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const addStudents = async (studentNames: string[], replaceAll: boolean = true) => {
    setError(null);
    console.log('Adding students:', studentNames); // Debug

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: studentNames,
          replaceAll
        }),
      });

      const responseText = await response.text();
      console.log('API Response:', responseText); // Debug

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Add students result:', result); // Debug

      // รีเฟรชข้อมูลหลังจากเพิ่มเสร็จ
      await fetchStudents();

      return result;
    } catch (err) {
      console.error('Error adding students:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  const updateStudent = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update student');
      }

      const updatedStudent = await response.json();

      // อัพเดท state
      setStudents(prev =>
        prev.map(s => s.id === id ? updatedStudent : s)
      );

      return updatedStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      // อัพเดท state
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    addStudents,
    updateStudent,
    deleteStudent
  };
}
