// TreeGridView2.js
import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from 'ag-grid-community';

// AG Grid 스타일 import (필요에 따라 테마를 변경)
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const TreeGridView = () => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        // 1. 데이터베이스 목록 가져오기
        const dbRes = await fetch('http://127.0.0.1:5000/api/databases');
        if (!dbRes.ok) {
          throw new Error(`HTTP error: ${dbRes.status}`);
        }
        const databases = await dbRes.json();
        console.log(databases);
        // 각 데이터베이스에 대해 primary 컬렉션의 문서를 가져와서,
        // 각 문서의 id를 기반으로 secondary 컬렉션의 데이터를 가져옵니다.
        const hierarchyData = await Promise.all(
          databases.map(async (dbName) => {
            // primary 컬렉션의 문서들 가져오기
            const primaryRes = await fetch(
              `http://127.0.0.1:5000/${encodeURIComponent(dbName)}/collections/aas_repo`
            );
            console.log(primaryRes);
            if (!primaryRes.ok) {
              throw new Error(`HTTP error: ${primaryRes.status}`);
            }
            const primaryDocs = await primaryRes.json();
            // primaryDocs 배열의 각 문서에서 id를 추출하고,
            // 해당 id에 대한 secondary 컬렉션의 데이터를 가져옵니다.
            const idsData = await Promise.all(
              primaryDocs.map(async (doc) => {
                // primary 컬렉션 문서에 id 필드가 있다고 가정합니다.
                const idValue = doc.id;
                const secondaryRes = await fetch(
                  `http://127.0.0.1:5000/api/${encodeURIComponent(dbName)}/submodel_repo/${encodeURIComponent(idValue)}`
                );
                if (!secondaryRes.ok) {
                  throw new Error(`HTTP error: ${secondaryRes.status}`);
                }
                const secondaryDocs = await secondaryRes.json();
                return {
                  id: idValue,
                  secondaryDocs: secondaryDocs,
                };
              })
            );
            return {
              dbName,
              ids: idsData,
            };
          })
        );

        // 변환: 계층 데이터를 AG Grid의 Tree Data가 사용 가능한 flat 배열로 변경
        let rows = [];
        hierarchyData.forEach((db) => {
          // 최상위 노드: 데이터베이스
          rows.push({
            type: 'database',
            dbName: db.dbName,
            dataPath: [db.dbName],
          });
          db.ids.forEach((idItem) => {
            // 두 번째 노드: primary 컬렉션의 id
            rows.push({
              type: 'id',
              dbName: db.dbName,
              id: idItem.id,
              dataPath: [db.dbName, idItem.id],
            });
            // 세 번째 노드: secondary 컬렉션의 각 문서
            idItem.secondaryDocs.forEach((doc, index) => {
              rows.push({
                type: 'document',
                dbName: db.dbName,
                id: idItem.id,
                document: doc,
                // 여기서는 "Document X"로 표시; 필요에 따라 문서의 고유 값이나 필드를 사용할 수 있습니다.
                dataPath: [db.dbName, idItem.id, `Document ${index + 1}`],
              });
            });
          });
        });

        setTreeData(rows);
        setLoading(false);
      } catch (error) {
        console.error('트리 그리드 데이터를 불러오는 중 오류 발생:', error);
        setLoading(false);
      }
    };

    fetchHierarchy();
  }, []);

  // AG Grid 컬럼 정의  
  // 실제로 표시될 정보는 그룹 컬럼(트리 구조)와 document 행의 경우 JSON 문자열로 표시합니다.
  const columnDefs = [
    { field: 'dbName', headerName: 'Database', hide: true },
    { field: 'id', headerName: 'ID', hide: true },
    {
      headerName: 'Details',
      valueGetter: (params) => {
        if (params.data) {
          if (params.data.type === 'document') {
            return JSON.stringify(params.data.document, null, 2);
          }
          return ''; // 그룹 노드는 auto group 컬럼에서 표시됨
        }
        return '';
      },
    },
    { field: 'type', hide: true }, // 내부 구분용
  ];

  // autoGroupColumnDef: 트리 그룹 컬럼 설정
  const autoGroupColumnDef = {
    headerName: 'Hierarchy',
    cellRendererParams: {
      suppressCount: true,
    },
  };

  // getDataPath: 각 행의 dataPath 배열을 반환하여 계층 구조를 정의
  const getDataPath = (data) => {
    return data.dataPath;
  };

  if (loading) {
    return <div>트리 그리드 데이터를 불러오는 중...</div>;
  }

  return (
    <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
      <AgGridReact
        modules={[ClientSideRowModelModule]}
        rowData={treeData}
        columnDefs={columnDefs}
        treeData={true}
        getDataPath={getDataPath}
        autoGroupColumnDef={autoGroupColumnDef}
        defaultColDef={{
          flex: 1,
          sortable: true,
          resizable: true,
        }}
      />
    </div>
  );
};

export default TreeGridView;
