// src/lib/student-utils.ts
export const getDisplayName = (name: string, includePrefix: boolean = false): string => {
  if (!includePrefix) {
    return name; // แสดงชื่อที่ทำความสะอาดแล้ว
  }

  // ถ้าต้องการแสดงคำนำหน้า สามารถเพิ่มลอจิกตรงนี้
  // เช่น ตรวจสอบเพศจากชื่อหรือจากข้อมูลอื่น
  return name;
};

export const detectGender = (originalName: string): 'male' | 'female' | 'unknown' => {
  if (originalName.includes('ด.ช.') || originalName.includes('เด็กชาย')) {
    return 'male';
  }
  if (originalName.includes('ด.ญ.') || originalName.includes('เด็กหญิง')) {
    return 'female';
  }
  return 'unknown';
};
