import { useEffect, useState, useRef } from 'react';
import { getBaseUrl } from '../utils/utils';
import { TableSkeleton, TabSkeleton } from './Skeleton';

interface Cell {
  value: string;
}

interface Sheet {
  id: string;
  name: string;
  data: Cell[][];
}

const COLS = 80;

const createEmptySheet = (id: string, name: string, rows: number = 50): Sheet => ({
  id,
  name,
  data: Array(rows).fill(null).map(() => 
    Array(COLS).fill(null).map(() => ({ value: '' }))
  ),
});

const getColumnLabel = (index: number): string => {
  let label = '';
  let num = index;
  while (num >= 0) {
    label = String.fromCharCode(65 + (num % 26)) + label;
    num = Math.floor(num / 26) - 1;
  }
  return label;
};

function Spreadsheet() {
  const [sheets, setSheets] = useState<Sheet[]>([
    createEmptySheet('sheet-1', 'Sheet1'),
    createEmptySheet('sheet-2', 'Sheet2'),
    createEmptySheet('sheet-3', 'Sheet3'),
  ]);
  const [activeSheetId, setActiveSheetId] = useState('sheet-1');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const ROWS_PER_PAGE = 100;
  const pageCache = useRef<Map<number, Sheet>>(new Map());

  const activeSheet = sheets.find(s => s.id === activeSheetId)!;


// const fetchAllTableHeaders = async () => {
//       try {
//         console.log('Fetching tables from /api/tables...');
//         const response = await fetch('https://datagrid-app-l1ar.onrender.com/api/tables');
//         const data = await response.json();
//         console.log('API Response:', data);
//         console.log('Tables:', data.tables);
//         console.log('Is Array?', Array.isArray(data.tables));
//         console.log('First item:', data.tables?.[0]);
        
//         if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
//           const newSheets = data.tables.map((table: any, index: number) => {
//             const tableName = table.table_name || table;
//             console.log(`Creating sheet ${index}:`, tableName);
//             return createEmptySheet(`sheet-${index}`, tableName);
//           });
//           console.log('New sheets created:', newSheets);
//           setSheets(newSheets);
//           if (newSheets.length > 0) {
//             setActiveSheetId(newSheets[0].id);
//           }
//         } else {
//           console.error('No tables found or invalid data format');
//         }
//       } catch (err) {
//         console.error('Error fetching tables:', err);
//       }
//     };

const fetchTableByName = async (tableName: string, page: number = 1) => {
      try {
        // Check if page is already cached
        if (pageCache.current.has(page)) {
          console.log(`Using cached data for page ${page}`);
          const cachedSheet = pageCache.current.get(page)!;
          setSheets([cachedSheet]);
          setActiveSheetId(cachedSheet.id);
          setCurrentPage(page);
          return;
        }

        setIsLoading(true);
        console.log(`Fetching table "${tableName}" page ${page} from /api/tables/${tableName}...`);
        const response = await fetch(`${getBaseUrl()}/api/tables/${tableName}?page=${page}&limit=${ROWS_PER_PAGE}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        console.log(`Total rows from API: ${data.rows?.length || 0}`);
        console.log('Pagination info:', data.pagination);
        
        if (data.rows && Array.isArray(data.rows)) {
          console.log(`Loaded table "${tableName}" with ${data.rows.length} rows`);
          
          // Set pagination info if available
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages);
            setTotalRows(data.pagination.total);
            setCurrentPage(page);
          }
          
          // Add 1 extra row for headers
          const newSheet = createEmptySheet(`sheet-${tableName}`, tableName, data.rows.length + 1);
          
          // Populate sheet with fetched data
          if (Array.isArray(data.rows) && data.rows.length > 0) {
            // First, populate column headers (row 0)
            const columnNames = Object.keys(data.rows[0]);
            columnNames.forEach((columnName: string, colIndex: number) => {
              if (colIndex < COLS) {
                newSheet.data[0][colIndex].value = columnName;
              }
            });
            
            // Then populate data rows (starting from row 1)
            data.rows.forEach((row: any, rowIndex: number) => {
              const columns = Object.values(row);
              columns.forEach((value: any, colIndex: number) => {
                if (colIndex < COLS) {
                  newSheet.data[rowIndex + 1][colIndex].value = String(value || '');
                }
              });
            });
          }
          
          console.log('New sheet created:', newSheet);
          
          // Cache the sheet for this page
          pageCache.current.set(page, newSheet);
          
          setSheets([newSheet]);
          setActiveSheetId(newSheet.id);
        } else {
          console.error(`No data found for table "${tableName}" or invalid data format`);
        }
      } catch (err) {
        console.error(`Error fetching table "${tableName}":`, err);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchTableByName('trades', 1);
    // fetchAllTableHeaders();
  }, []);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    setSheets(prevSheets =>
      prevSheets.map(sheet =>
        sheet.id === activeSheetId
          ? {
              ...sheet,
              data: sheet.data.map((row, rIdx) =>
                rIdx === rowIndex
                  ? row.map((cell, cIdx) =>
                      cIdx === colIndex ? { value } : cell
                    )
                  : row
              ),
            }
          : sheet
      )
    );
  };

  // const addNewSheet = () => {
  //   const newSheetNumber = sheets.length + 1;
  //   const newSheet = createEmptySheet(
  //     `sheet-${Date.now()}`,
  //     `Sheet${newSheetNumber}`
  //   );
  //   setSheets([...sheets, newSheet]);
  //   setActiveSheetId(newSheet.id);
  // };

  // const deleteSheet = (sheetId: string) => {
  //   if (sheets.length === 1) return; // Don't delete the last sheet
    
  //   const newSheets = sheets.filter(s => s.id !== sheetId);
  //   setSheets(newSheets);
    
  //   if (activeSheetId === sheetId) {
  //     setActiveSheetId(newSheets[0].id);
  //   }
  // };

  const renameSheet = (sheetId: string, newName: string) => {
    setSheets(prevSheets =>
      prevSheets.map(sheet =>
        sheet.id === sheetId ? { ...sheet, name: newName } : sheet
      )
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white px-6 sm:px-8 py-4 sm:py-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Data Grid</h1>
            <p className="text-sky-100 text-sm mt-1">Manage and explore your data</p>
          </div>
          {totalRows > 0 && (
            <div className="text-xs sm:text-sm opacity-95 bg-sky-500 bg-opacity-50 rounded-lg px-3 py-2 w-fit">
              <span className="font-semibold">Total:</span> {totalRows} rows
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls - Top */}
      {totalPages > 1 && (
        <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchTableByName('trades', currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                <span className="text-sm text-slate-600 font-medium">Page</span>
                <span className="inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1 text-sm font-bold text-sky-600 bg-white border border-sky-200 rounded-md shadow-sm">
                  {currentPage}
                </span>
                <span className="text-sm text-slate-600">of</span>
                <span className="text-sm font-semibold text-slate-700">{totalPages}</span>
              </div>
              <button
                onClick={() => fetchTableByName('trades', currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-slate-600 font-medium">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <span>{ROWS_PER_PAGE} rows per page</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 overflow-auto bg-slate-50 relative">
        {isLoading ? (
          <TableSkeleton />
        ) : (
        <table className="border-collapse bg-white w-max shadow-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="bg-slate-100 border border-slate-200 px-3 py-3 text-center font-semibold text-xs text-slate-600 min-w-[50px] sticky left-0 z-20"></th>
              {Array.from({ length: COLS }, (_, i) => (
                <th key={i} className="bg-slate-100 border border-slate-200 px-4 py-3 text-center font-semibold text-xs text-slate-700 min-w-[100px] hover:bg-slate-200 transition-colors duration-150">
                  {getColumnLabel(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeSheet.data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-sky-50 transition-colors duration-75">
                <td className="bg-slate-50 border border-slate-200 px-3 py-2 text-center font-medium text-xs text-slate-600 min-w-[50px] sticky left-0 z-5">
                  {rowIndex === 0 ? '' : rowIndex + ((currentPage - 1) * ROWS_PER_PAGE)}
                </td>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className={`border px-0 relative min-w-[100px] h-8 transition-all duration-150 ${
                      rowIndex === 0 
                        ? 'bg-slate-100 border-slate-200' 
                        : 'bg-white border-slate-200 hover:bg-sky-50 hover:shadow-cell-hover'
                    } ${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        ? 'ring-2 ring-sky-500 ring-inset shadow-lg border-sky-400'
                        : ''
                    }`}
                    onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                  >
                    <input
                      type="text"
                      value={cell.value}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                      className={`w-full h-full border-none outline-none px-3 py-2 text-sm bg-transparent font-medium transition-all duration-150 ${
                        rowIndex === 0 
                          ? 'font-bold text-slate-700' 
                          : 'text-slate-800'
                      }`}
                      readOnly={rowIndex === 0}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Sheets Tab Bar */}
      <div className="bg-white border-t border-slate-200 shadow-md">
        {isLoading && sheets[0]?.name === 'Sheet1' ? (
          <TabSkeleton />
        ) : (
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-150 cursor-pointer font-medium text-sm min-w-fit ${
                sheet.id === activeSheetId
                  ? 'bg-sky-100 text-sky-700 border-sky-300 shadow-md'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setActiveSheetId(sheet.id)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <input
                type="text"
                value={sheet.name}
                onChange={(e) => renameSheet(sheet.id, e.target.value)}
                className="border-none bg-transparent outline-none text-sm font-medium cursor-pointer w-full"
              />
            </div>
          ))}
        </div>        )}      </div>
    </div>
  );
}

export default Spreadsheet;
