'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const breadcrumbNameMap: Record<string, string> = {
  '/': 'หน้าหลัก',
  '/attendance': 'เช็คชื่อ',
  '/students': 'จัดการนักเรียน',
  '/reports': 'รายงาน'
};

export default function Breadcrumb() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              หน้าหลัก
            </Link>
          </li>
          {pathSegments.map((segment, index) => {
            const path = '/' + pathSegments.slice(0, index + 1).join('/');
            const isLast = index === pathSegments.length - 1;

            return (
              <li key={path} className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {isLast ? (
                  <span className="text-gray-500 font-medium">
                    {breadcrumbNameMap[path] || segment}
                  </span>
                ) : (
                  <Link
                    href={path}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {breadcrumbNameMap[path] || segment}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
