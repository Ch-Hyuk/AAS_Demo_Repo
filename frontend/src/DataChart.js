// RealTimeMultiCharts.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { AgGridReact } from 'ag-grid-react';
import { Line, Bar } from 'react-chartjs-2';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css'

// Chart.js 모듈 등록
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
  plugins,
} from 'chart.js';

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const RealTimeMultiCharts = () => {
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef(null);
  const socketRef = useRef(null);

  // AG-Grid 컬럼 설정 (타임스탬프와 3개의 값)
  const [columnDefs, setColumnDefs] = useState([]);

  // 외부 API를 호출하여 컬럼 헤더명을 받아옴
  useEffect(() => {
    fetch('http://localhost:5000/data/demokit_mapping')
      .then(response => response.json())
      .then(headerData => {
        setColumnDefs([
          {
            headerName: "",
            children:[
              { field: 'timestamp', headerName: 'timestamp', sort: 'desc' },
            ]
          },
          {
            headerName: "(SM)OperationData -> (SMC)TemperatureandHumiditySensor -> (PROP)Present_Temperature",
            children:[
              { field: 'value1', headerName: 'Present_Temperature' , width: 800},
            ]
          },
          {
            headerName: "(SM)OperationData -> (SMC)Heater -> (PROP)Present_Temperature",
            children:[
              { field: 'value2', headerName: 'Present_Temperature' , width: 800},
            ]
          },
          {
            headerName: "(SM)OperationData -> (SMC)TemperatureandHumiditySensor -> (PROP)Present_Humidity",
            children:[
              { field: 'value3', headerName: 'Present_Humidity', width: 800},
            ]
          },
        ]);
      })
      .catch(error => {
        console.error('Error fetching column headers:', error);
      });
  }, []);

  // Socket.io를 이용해 서버에 연결 및 데이터 수신
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('new_data', (data) => {
      // 새로운 데이터를 배열의 맨 앞에 추가합니다.
      setRowData((prevData) => {
        const newData = [...prevData, data];

        // AG-Grid 업데이트: addIndex 옵션을 사용해 첫 번째 위치에 추가
        if (gridRef.current && gridRef.current.api) {
          gridRef.current.api.applyTransaction({ add: [data] });
        }
        return newData;
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 라인 차트 데이터 구성 (Value 1, Value 2)
  const TempChartData = {
    labels: rowData.map((item) => item.timestamp),
    datasets: [
      {
        label: "Temperature",
        data: rowData.map((item) => item.value1),
        fill: false,
        borderColor: 'rgb(202, 51, 51)',
        tension: 0.1,
      },

    ],
  };

  const PressChartData = {
    labels: rowData.map((item) => item.timestamp),
    datasets: [
      {
        label: 'Pressure',
        data: rowData.map((item) => item.value1),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },

    ],
  };

  const HumidChartData = {
    labels: rowData.map((item) => item.timestamp),
    datasets: [
      {
        label: 'Humidity',
        data: rowData.map((item) => item.value3),
        fill: false,
        borderColor: 'rgb(57, 19, 196)',
        tension: 0.1,
      },

    ],
  };

  const TempchartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Timestamp' },
      },
      y: {
        title: { display: true, text: 'Value' },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
      <div style={{ height: '300px', width: "100%" }} >

      {/* AG-Grid 테이블 영역 */}
      <div className="ag-theme-balham" style={{ height: '300px', width: '100%' }}>
        <AgGridReact ref={gridRef} rowData={rowData} columnDefs={columnDefs} />
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, height: '300px' }}>
          <Line data={TempChartData} options={TempchartOptions} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, height: '300px' }}>
          <Line data={PressChartData} options={TempchartOptions} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, height: '300px' }}>
          <Line data={HumidChartData} options={TempchartOptions} />
        </div>
      </div>
    </div>
  );
};

export default RealTimeMultiCharts;
