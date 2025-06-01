import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

interface ExcelUploaderProps {
  onUpload: (students: string[]) => void;
  isUploading: boolean;
}

export default function ExcelUploader({ onUpload, isUploading }: ExcelUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanStudentName = (name: string): string => {
    if (!name) return '';

    // ลบคำนำหน้าชื่อไทย
    const prefixes = [
      'ด.ช.', 'ด.ญ.', 'นาย', 'นางสาว', 'นาง', 'เด็กชาย', 'เด็กหญิง',
      'ด.ช', 'ด.ญ', // กรณีไม่มีจุด
      'เด็ก ชาย', 'เด็ก หญิง' // กรณีมีเว้นวรรค
    ];

    let cleanedName = name.toString().trim();

    // ลบคำนำหน้าที่ขึ้นต้น
    for (const prefix of prefixes) {
      if (cleanedName.startsWith(prefix)) {
        cleanedName = cleanedName.substring(prefix.length).trim();
        break;
      }
    }

    // ลบเลขที่อาจจะมีหน้าชื่อ (เช่น "1. ด.ช.สมชาย")
    cleanedName = cleanedName.replace(/^\d+\.\s*/, '');

    // ลบช่องว่างเกิน
    cleanedName = cleanedName.replace(/\s+/g, ' ').trim();

    return cleanedName;
  };

  const isValidStudentName = (name: string): boolean => {
    if (!name || name.trim() === '') return false;

    const cleaned = cleanStudentName(name);

    // ตรวจสอบว่าเป็นชื่อที่มีความยาวเหมาะสม
    if (cleaned.length < 2) return false;

    // ตรวจสอบว่าไม่ใช่ตัวเลขอย่างเดียว
    if (/^\d+$/.test(cleaned)) return false;

    // ตรวจสอบว่าไม่ใช่หัวข้อคอลัมน์
    const headerKeywords = [
      'ชื่อ', 'นามสกุล', 'รายชื่อ', 'name', 'student', 'ลำดับ', 'ที่', 'no',
      'ชื่อ-นามสกุล', 'ชื่อนักเรียน', 'รายชื่อนักเรียน'
    ];

    const lowerCleaned = cleaned.toLowerCase();
    const isHeader = headerKeywords.some(keyword =>
      lowerCleaned.includes(keyword.toLowerCase())
    );

    return !isHeader;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setError('');

    console.log('File info:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setError('กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls) เท่านั้น');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('ไฟล์มีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setError('ไม่สามารถอ่านไฟล์ได้ กรุณาลองอีกครั้ง');
    };

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        console.log('File data length:', data.length);

        const workbook = XLSX.read(data, {
          type: 'array',
          cellText: false,
          cellNF: false,
          cellHTML: false
        });

        console.log('Sheet names:', workbook.SheetNames);

        // อ่านชีตแรก
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // แปลงเป็น JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,  // ใช้ header เป็นตัวเลข (array)
          defval: "",  // ค่าเริ่มต้นสำหรับเซลล์ว่าง
          raw: false   // แปลงค่าเป็น string
        }) as string[][];

        console.log('Raw data from Excel (first 10 rows):', jsonData.slice(0, 10));

        if (jsonData.length === 0) {
          setError('ไฟล์ Excel ว่างเปล่า กรุณาตรวจสอบข้อมูลในไฟล์');
          return;
        }

        // ดึงชื่อจากคอลัมน์แรก และทำความสะอาด
        const allNames = jsonData
          .map(row => row[0]) // ดึงคอลัมน์แรก
          .filter(name => name && name.toString().trim()) // กรองค่าว่าง
          .map(name => name.toString());

        console.log('All names from column A:', allNames);

        const studentNames = allNames
          .filter((name, index) => {
            console.log(`Checking row ${index + 1}: "${name}"`);
            return isValidStudentName(name);
          })
          .map(name => cleanStudentName(name))
          .filter(name => name.length > 0); // กรองชื่อที่ว่างออกอีกครั้ง

        console.log('Final processed student names:', studentNames);

        if (studentNames.length === 0) {
          setError('ไม่พบรายชื่อนักเรียนในไฟล์\n\nกรุณาตรวจสอบ:\n• ใส่รายชื่อในคอลัมน์ A\n• ชื่อนักเรียนมีคำนำหน้า เช่น ด.ช. ด.ญ.\n• ไฟล์ไม่ได้เสียหาย');
          return;
        }

        onUpload(studentNames);

      } catch (error) {
        console.error('Error reading Excel file:', error);
        setError(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${error.message}\n\nกรุณาลอง:\n• ปิดไฟล์ Excel ก่อนอัพโหลด\n• บันทึกไฟล์ใหม่\n• ตรวจสอบว่าไฟล์ไม่เสียหาย`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-red-800 font-medium mb-1">เกิดข้อผิดพลาด</h4>
              <pre className="text-red-700 text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          </div>
        </div>
      )}

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isUploading ? handleFileSelect : undefined}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600">กำลังประมวลผลไฟล์...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                อัพโหลดไฟล์ Excel
              </p>
              <p className="text-gray-600 mb-4">
                ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>

              <Button
                type="button"
                variant="primary"
                className="mx-auto"
              >
                เลือกไฟล์ Excel
              </Button>

              <p className="text-xs text-gray-500 mt-2">
                รองรับไฟล์ .xlsx และ .xls เท่านั้น (ขนาดไม่เกิน 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* คำแนะนำสำหรับรูปแบบไฟล์ */}
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">รูปแบบไฟล์ Excel ที่รองรับ:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• ใส่รายชื่อในคอลัมน์ A (คอลัมน์แรก)</li>
          <li>• ชื่อนักเรียนควรมีคำนำหน้า เช่น ด.ช.สมชาย ใจดี หรือ ด.ญ.สมหญิง สวยงาม</li>
          <li>• ระบบจะลบคำนำหน้า (ด.ช., ด.ญ.) อัตโนมัติ</li>
          <li>• สามารถมีหัวข้อแถวแรกได้ (จะข้ามไป)</li>
          <li>• รองรับไฟล์ .xlsx และ .xls</li>
        </ul>
      </div>
    </div>
  );
}
