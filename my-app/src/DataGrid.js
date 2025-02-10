import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

// AG Grid의 스타일 파일을 import 합니다.
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const DataGrid = () => {
  const [rowData, setRowData] = useState([]);

  // MongoDB 데이터의 필드에 맞게 컬럼을 정의합니다.
  // 예시에서는 "field1"과 "field2"라는 필드가 있다고 가정합니다.
  const columnDefs = [
    { headerName: "Field1", field: "field1" },
    { headerName: "Field2", field: "field2" },
    // 필요한 다른 필드들을 추가하세요.
  ];

  useEffect(() => {
    // Flask 백엔드에서 데이터를 가져옵니다.
    fetch('http://127.0.0.1:5000/')
      .then(response => response.json())
      .then(data => setRowData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
      <AgGridReact 
        columnDefs={columnDefs}
        rowData={rowData}
      />
    </div>
  );
};

export default DataGrid;
