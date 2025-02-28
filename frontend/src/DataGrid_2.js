import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function App() {
  const [rowData, setRowData] = useState([]);

  // 🔹 Flask API에서 fetch를 통해 데이터 가져오기
  useEffect(() => {
    fetch("http://127.0.0.1:5000/data/demokit_mapping")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`네트워크 응답 오류: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setRowData(data);
      })
      .catch((error) => {
        console.error("API 요청 실패:", error);
      });
  }, []);

  // 🔹 컬럼 정의
  const columnDefs = [
    { field: "opcua_tag_name", headerName: "OPC-UA Tag Name", flex: 1, width: 1000 },
    { field: "semantic_data_en", headerName: "Semantic Data(en)", flex: 1, width: '100%' },
    { field: "semantic_data_kr", headerName: "Semantic Data(kr)", flex: 1, width: '100%' },
    { field: "data_description_kr", headerName: "Description(kr)", flex: 1, width: '100%' },
    { field: "plc_address", headerName: "PLC Address", flex: 1 },
  ];

  return (
    <div style={{ height: '100%', width: 1000}}>
      <h2 style={{ textAlign: "center", width: '100%' }}>📊 Mapping Data</h2>
      {/* 고정 높이를 가진 그리드 컨테이너 */}
      <div className="ag-theme-alpine" style={{ height: 800, width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={20}
        />
      </div>
      {/* 내부 스크롤바를 항상 표시하도록 하는 CSS */}
      <style>{`
        .ag-theme-alpine .ag-body-viewport {
          overflow-y: scroll !important;
        }
      `}</style>
    </div>
  );
}

export default App;
