import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js에 필요한 모듈 등록
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

// 컬럼별 색상을 지정하는 함수 (필요에 따라 확장)
const getColor = (index) => {
  const colors = [
    "rgba(75,192,192,1)",
    "rgba(255,99,132,1)",
    "rgba(153,102,255,1)",
    "rgba(255,159,64,1)",
    "rgba(54,162,235,1)",
    // 추가 색상…
  ];
  return colors[index % colors.length];
};

const DataChart = () => {
  // mapping 데이터와 row 데이터를 따로 관리
  const [mappingData, setMappingData] = useState([]);
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    // 1. mapping 정보를 API에서 받아오기
    fetch("http://127.0.0.1:5000/data/demokit_mapping")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`네트워크 응답 오류: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // 여기서는 API가 mapping 정보 배열 자체를 반환한다고 가정합니다.
        setMappingData(data);
      })
      .catch((error) => {
        console.error("mapping API 요청 실패:", error);
      });

    // 2. 실제 차트에 표시할 row 데이터 (여기서는 예시용 더미 데이터)
    // 실제 사용 시 별도의 API 또는 상위 컴포넌트에서 row 데이터를 전달받을 수 있습니다.
    // const dummyRows = [
    //   {
    //     timestamp: "2025-02-16 10:00",
    //     "Excess Threshold Noise": 10,
    //     "Excess Threshold Gyro": 20,
    //     "Shortfall Threshold Gyro": 30,
    //     "AutomaticOperation Start Wait Time": 40,
    //     "Operation Cycle Count": 50,
    //     // mapping에 포함된 다른 key들도 동일하게 추가...
    //   },
    //   {
    //     timestamp: "2025-02-16 10:01",
    //     "Excess Threshold Noise": 15,
    //     "Excess Threshold Gyro": 25,
    //     "Shortfall Threshold Gyro": 35,
    //     "AutomaticOperation Start Wait Time": 45,
    //     "Operation Cycle Count": 55,
    //   },
    //   // 추가 row 데이터…
    // ];
    //setRowData(dummyRows);
  }, []);

  // mapping 정보와 row 데이터가 모두 준비되어야 차트를 구성
  if (mappingData.length === 0 || rowData.length === 0) {
    return <div>Loading...</div>;
  }

  // x축 라벨: row 데이터의 timestamp 값
  const labels = rowData.map((row) => row.timestamp);

  // mappingData 배열을 순회하면서, 각 항목의 semantic_data_en을 데이터 키로, semantic_data_kr를 라벨로 사용하여 datasets 구성
  const datasets = mappingData.map((mapObj, index) => {
    const dataKey = mapObj.semantic_data_en;
    const labelName = mapObj.semantic_data_kr;
    return {
      label: labelName,
      data: rowData.map((row) => row[dataKey]),
      fill: false,
      borderColor: getColor(index),
      tension: 0.1,
    };
  });

  const chartData = {
    labels,
    datasets,
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Dynamic Data Chart",
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Timestamp" },
      },
      y: {
        title: { display: true, text: "Value" },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default DataChart;
