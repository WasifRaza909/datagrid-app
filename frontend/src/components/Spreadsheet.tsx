import { useEffect, useState } from 'react';

interface Cell {
  value: string;
}

interface Sheet {
  id: string;
  name: string;
  data: Cell[][];
}

const ROWS = 50;
const COLS = 80;

const createEmptySheet = (id: string, name: string): Sheet => ({
  id,
  name,
  data: Array(ROWS).fill(null).map(() => 
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

  const activeSheet = sheets.find(s => s.id === activeSheetId)!;

    useEffect(() => {
    const fetchTables = async () => {
      try {
        console.log('Fetching tables from /api/tables...');
        const response = await fetch('https://datagrid-app-l1ar.onrender.com/api/tables');
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Tables:', data.tables);
        console.log('Is Array?', Array.isArray(data.tables));
        console.log('First item:', data.tables?.[0]);
        
        if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
          const newSheets = data.tables.map((table: any, index: number) => {
            const tableName = table.table_name || table;
            console.log(`Creating sheet ${index}:`, tableName);
            return createEmptySheet(`sheet-${index}`, tableName);
          });
          console.log('New sheets created:', newSheets);
          setSheets(newSheets);
          if (newSheets.length > 0) {
            setActiveSheetId(newSheets[0].id);
          }
        } else {
          console.error('No tables found or invalid data format');
        }
      } catch (err) {
        console.error('Error fetching tables:', err);
      }
    };

    fetchTables();
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

  const addNewSheet = () => {
    const newSheetNumber = sheets.length + 1;
    const newSheet = createEmptySheet(
      `sheet-${Date.now()}`,
      `Sheet${newSheetNumber}`
    );
    setSheets([...sheets, newSheet]);
    setActiveSheetId(newSheet.id);
  };

  const deleteSheet = (sheetId: string) => {
    if (sheets.length === 1) return; // Don't delete the last sheet
    
    const newSheets = sheets.filter(s => s.id !== sheetId);
    setSheets(newSheets);
    
    if (activeSheetId === sheetId) {
      setActiveSheetId(newSheets[0].id);
    }
  };

  const renameSheet = (sheetId: string, newName: string) => {
    setSheets(prevSheets =>
      prevSheets.map(sheet =>
        sheet.id === sheetId ? { ...sheet, name: newName } : sheet
      )
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r bg-blue-700 text-white px-8 py-4 shadow-md">
        <h1 className="text-2xl font-medium">Sheets</h1>
      </div>

      {/* Toolbar */}
      {/* <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <button className="px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 hover:border-gray-400 text-sm transition-all">
          Undo
        </button>
        <button className="px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 hover:border-gray-400 text-sm transition-all">
          Redo
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button className="px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 hover:border-gray-400 text-sm transition-all">
         Print
        </button>
        <button className="px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 hover:border-gray-400 text-sm transition-all">
          Download
        </button>
      </div> */}

      {/* Table Container */}
      <div className="flex-1 overflow-auto bg-gray-50 relative">
        <table className="border-collapse bg-white w-max">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              <th className="bg-gray-100 border border-gray-300 px-3 py-2 text-center font-medium text-sm text-gray-600 min-w-[50px] sticky left-0 z-20"></th>
              {Array.from({ length: COLS }, (_, i) => (
                <th key={i} className="bg-gray-100 border border-gray-300 px-3 py-2 text-center font-medium text-sm text-gray-600 min-w-[100px]">
                  {getColumnLabel(i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeSheet.data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="bg-gray-100 border border-gray-300 px-3 py-2 text-center font-medium text-sm text-gray-600 min-w-[50px] sticky left-0 z-5">
                  {rowIndex + 1}
                </td>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className={`border border-gray-300 p-0 relative min-w-[100px] h-8 hover:bg-gray-50 ${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        ? 'border-2 border-blue-600 bg-white'
                        : ''
                    }`}
                    onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                  >
                    <input
                      type="text"
                      value={cell.value}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                      className="w-full h-full border-none outline-none px-2 py-1.5 text-sm bg-transparent"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheets Tab Bar */}
      <div className="bg-white border-t border-gray-300 shadow-sm">
        <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto">
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              className={`flex items-center gap-1 px-4 py-2 rounded-t border border-transparent cursor-pointer transition-all min-w-[100px] ${
                sheet.id === activeSheetId
                  ? 'bg-white text-blue-600 border-gray-300 border-b-2 border-b-blue-600 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveSheetId(sheet.id)}
            >
              <input
                type="text"
                value={sheet.name}
                onChange={(e) => renameSheet(sheet.id, e.target.value)}
                className="border-none bg-transparent outline-none text-sm w-full cursor-pointer"
              />
              {/* {sheets.length > 1 && (
                <button
                  className="bg-none border-none text-gray-600 cursor-pointer text-xl leading-none p-0 w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-200 hover:text-red-600 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSheet(sheet.id);
                  }}
                  title="Delete sheet"
                >
                  ×
                </button>
              )} */}
            </div>
          ))}
          {/* <button 
            className="bg-transparent border border-gray-300 text-gray-600 cursor-pointer text-xl px-4 py-2 rounded hover:bg-gray-100 hover:border-gray-400 min-w-[40px] transition-all" 
            onClick={addNewSheet} 
            title="Add sheet"
          >
            +
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default Spreadsheet;
