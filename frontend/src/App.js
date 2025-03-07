import React from "react";
import Splitter from "@devbookhq/splitter"; // 기본 내보내기 import
import DataGrid1 from "./DataGrid_1"; // 파일명을 PascalCase로 변경
import DataGrid2 from "./DataGrid_2";
import DataChart from "./DataChart";

function App() {
  return (
    <div style={{ height: "70vh",width: "100%" }}>
      <Splitter direction="horizontal">
        <div>
          <DataGrid1 />
        </div>
        <div>
          <DataGrid2 />
        </div>

      </Splitter>

      <div>
          <DataChart />
      </div>
    </div>
  );
}

export default App;
