import React from "react";
import Splitter from "@devbookhq/splitter"; // 기본 내보내기 import
import DataGrid1 from "./DataGrid_1"; // 파일명을 PascalCase로 변경
import DataGrid2 from "./DataGrid_2";

function App() {
  return (
    <div style={{ height: "100vh" }}>
      <Splitter direction="vertical" minHeights={[100, 100]} initialSizes={[50, 50]}>
        <div>
          <DataGrid1 />
        </div>
        <div>
          <DataGrid2 />
        </div>
      </Splitter>
    </div>
  );
}

export default App;
