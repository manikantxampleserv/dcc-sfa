import React from 'react';
import * as XLSX from 'xlsx';

export const handleExportExcel = (headers: string[], rows: string[][]) => {
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
  XLSX.writeFile(
    workbook,
    `query_results_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};

export const highlightSql = (sql: string) => {
  const keywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'LEFT',
    'RIGHT',
    'INNER',
    'ON',
    'AND',
    'OR',
    'GROUP',
    'BY',
    'ORDER',
    'LIMIT',
    'OFFSET',
    'COUNT',
    'SUM',
    'MIN',
    'MAX',
    'AVG',
    'AS',
    'IN',
    'IS',
    'NULL',
    'NOT',
    'LIKE',
    'INSERT',
    'UPDATE',
    'DELETE',
    'SET',
    'CREATE',
    'TABLE',
    'DROP',
    'ALTER',
    'WITH',
    'HAVING',
  ];

  const regex = new RegExp(
    `(\\b(?:${keywords.join('|')})\\b|'[^']*'|\\b\\d+\\b|[=<>!+*/-]+)`,
    'gi'
  );

  const parts = sql.split(regex);
  return parts.map((part, index) => {
    if (!part) return null;
    const upperPart = part.toUpperCase();
    if (keywords.includes(upperPart)) {
      return React.createElement(
        'span',
        { key: index, className: 'text-pink-600 font-semibold' },
        part
      );
    } else if (part.startsWith("'") && part.endsWith("'")) {
      return React.createElement(
        'span',
        { key: index, className: 'text-green-600' },
        part
      );
    } else if (/^\d+$/.test(part)) {
      return React.createElement(
        'span',
        { key: index, className: 'text-amber-600' },
        part
      );
    } else if (/^[=<>!+*/-]+$/.test(part)) {
      return React.createElement(
        'span',
        { key: index, className: 'text-sky-600' },
        part
      );
    } else {
      return part;
    }
  });
};
