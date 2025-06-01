export enum AttendanceStatus {
  PRESENT = 'PRESENT',  // มา
  ABSENT = 'ABSENT',    // ไม่มา
  LATE = 'LATE',        // สาย
  EXCUSED = 'EXCUSED'   // ลา
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  className?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: Date;
  status: AttendanceStatus;
  note?: string;
  student?: Student;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AttendanceRecord {
  student: Student;
  attendances: Record<string, AttendanceStatus>;
}

export interface ExportOptions {
  month: number;
  year: number;
  format: 'xlsx' | 'csv';
}
