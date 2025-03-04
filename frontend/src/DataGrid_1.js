import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';

// ag‑grid 스타일 적용을 위한 CSS 임포트
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { themeAlpine } from 'ag-grid-community';

const myTheme = themeAlpine.withParams({
  spacing: 12,
  accentColor: 'red',
});

// ─────────────────────────────────────────────
// 재귀 함수: submodelElements 내부의 데이터를 탐색하여 노드 생성
// ─────────────────────────────────────────────
const buildNodesFromSubmodelElements = (elements, parentPath = []) => {
  if (!elements || typeof elements !== 'object') return [];
  let nodes = [];

  // 1. property 처리
  if (elements.property) {
    const propertyList = Array.isArray(elements.property)
      ? elements.property
      : [elements.property];
    propertyList.forEach((prop) => {
      nodes.push({
        id: prop.idShort,
        // 노드 이름은 details의 idShort를 사용
        label: prop.idShort,
        path: [...parentPath, prop.idShort],
        details: prop,
        semanticID: prop.semanticId ? prop.semanticId.keys?.key?.value : null,
        value: prop.value !== undefined ? prop.value : '',
        nodeType: 'property',
      });
    });
  }

  // 2. submodelElementCollection 처리 (재귀)
  if (elements.submodelElementCollection) {
    const collections = Array.isArray(elements.submodelElementCollection)
      ? elements.submodelElementCollection
      : [elements.submodelElementCollection];
    collections.forEach((collection, index) => {
      const collectionId = collection.idShort || collection.id || `collection-${index}`;
      const collectionNode = {
        id: collectionId,
        label: collectionId,
        path: [...parentPath, collectionId],
        details: collection,
        semanticID: collection.semanticId ? collection.semanticId.keys?.key?.value : null,
        children: [],
        nodeType: 'submodelElementCollection',
      };
      if (collection.value) {
        collectionNode.children = buildNodesFromSubmodelElements(collection.value, collectionNode.path);
      }
      nodes.push(collectionNode);
    });
  }

  // 3. submodelElementList 처리 (재귀)
  if (elements.submodelElementList) {
    const listItems = Array.isArray(elements.submodelElementList)
      ? elements.submodelElementList
      : [elements.submodelElementList];
    listItems.forEach((listItem, listIndex) => {
      const listItemId = listItem.idShort || listItem.id || `listItem-${listIndex}`;
      const listItemNode = {
        id: listItemId,
        label: listItemId,
        path: [...parentPath, listItemId],
        details: listItem,
        semanticID: listItem.semanticId ? listItem.semanticId.keys?.key?.value : null,
        children: [],
        nodeType: 'submodelElementList',
      };
      if (listItem.value) {
        listItemNode.children = buildNodesFromSubmodelElements(listItem.value, listItemNode.path);
      }
      nodes.push(listItemNode);
    });
  }

  return nodes;
};

// ─────────────────────────────────────────────
// 좌측 영역: 데이터베이스 옵션 그리드
// ─────────────────────────────────────────────
const DatabaseOptionsGrid = ({ options, onSelect, columnDefs }) => (
  <div className="ag-theme-alpine" style={{ height: 300, width: '100%', overflow: 'auto', border: '1px solid #ccc' }}>
    <AgGridReact
      rowData={options}
      columnDefs={columnDefs}
      onCellClicked={(params) => {
        if (params.data && params.data.name) {
          onSelect(params.data.name);
        }
      }}
    />
  </div>
);

// ─────────────────────────────────────────────
// 우측 영역: 메인 데이터 그리드 (트리 구조)
// ─────────────────────────────────────────────
const MainDataGrid = ({ rowData, loading, autoGroupColumnDef, columnDefs, getDataPath }) => {
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="ag-theme-alpine" style={{ height: 800, width: 1100, overflow: 'auto', border: '1px solid #ccc' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        treeData={true}
        getDataPath={getDataPath}
        groupDefaultExpanded={-1}
        autoGroupColumnDef={autoGroupColumnDef}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// DataGrid 컴포넌트: 전체 레이아웃 및 API 호출 처리
// ─────────────────────────────────────────────
const DataGrid = () => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApiPart, setSelectedApiPart] = useState('DemoKit');
  const [databaseOptions, setDatabaseOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // 좌측 그리드 컬럼 정의 (데이터베이스 옵션)
  const databaseColumnDefs = [
    {
      field: 'name',
      headerName: 'AASX File List',
      width: 400,
      cellStyle: { fontWeight: 'bold', color: 'gray', fontSize: '20px' },
    },
  ];

  // 메인 데이터 그리드의 autoGroupColumnDef  
  // innerRenderer를 사용하여 기본 트리 구조(들여쓰기, expand/collapse)는 유지하면서 아이콘과 노드 이름(예: details.idShort)을 함께 표시함  
  // 단, 여기서 label 텍스트는 보여주지 않고 details에 있는 idShort (노드 이름)를 표시합니다.
  const autoGroupColumnDef = {
    headerName: 'Name',
    field: 'label',
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: (params) => {
        // PNG 파일은 public/images 폴더 내에 있어야 합니다.
        const iconMapping = {
          submodel: '/Submodel.png',
          property: '/Property.png',
          submodelElementCollection: '/SubmodelElementCollection.png',
          submodelElementList: '/SubmodelElementList.png',
        };
        const nodeType = params.data && params.data.nodeType ? params.data.nodeType : 'default';
        const iconSrc = iconMapping[nodeType] || '/images/default.png';
        const nodeName =
          (params.data && params.data.details && params.data.details.idShort) ||
          params.data.label ||
          '';
        return (
          <span title={nodeName} style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={iconSrc}
              alt=""
              style={{ width: '45px', height: '45px', marginRight: '10px' }}
            />
            {nodeName}
          </span>
        );
      },
    },
    width: 400,
    resizable: true,
    cellStyle: (params) => {
      switch (params.node.level) {
        case 0:
          return { fontWeight: 'bold', color: 'black', fontSize: '15px' };
        case 1:
          return { fontWeight: 'bold', color: 'black', fontSize: '15px' };
        case 2:
          return { fontWeight: 'normal', color: 'black' , fontSize: '15px'};
        default:
          return { fontWeight: 'normal', color: 'black' , fontSize: '15px'};
      }
    },
  };

  // 메인 데이터 그리드의 나머지 컬럼 정의
  const columnDefs = [
    {
      field: 'value',
      headerName: 'Value',
      width: 800,
      resizable: true,
    },
  ];

  const getDataPath = (data) => data.path;

  // ─────────────────────────────────────────────
  // API 호출: Database Options (예: ["Company", "DemoKit", ...])
  // ─────────────────────────────────────────────
  const fetchDatabases = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/databases');
      const data = await res.json();
      // 문자열 배열을 객체 배열로 변환
      const transformed = data.map((db) => ({ name: db }));
      setDatabaseOptions(transformed);
    } catch (error) {
      console.error('데이터베이스 목록을 불러오는 중 에러 발생:', error);
    }
  };

  // ─────────────────────────────────────────────
  // API 호출: 메인 데이터 (AAS 및 Submodel 데이터)
  // ─────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const resAAS = await fetch(`http://127.0.0.1:5000/api/${selectedApiPart}/collections/aas_repo`);
      const AASData = await resAAS.json();

      const resSubmodel = await fetch(`http://127.0.0.1:5000/api/${selectedApiPart}/collections/submodel_repo`);
      const SubmodelData = await resSubmodel.json();

      // AAS 데이터를 트리 구조로 변환
      const treeNodes = AASData.map((AASItem) => {
        // 최상위 노드: nodeType 'top'
        const aNode = {
          id: AASItem.id,
          label: AASItem.idShort,
          path: [AASItem.idShort],
          children: [],
          nodeType: 'submodel',
          details: AASItem,
        };

        let referenceValues = [];
        if (AASItem.submodels && AASItem.submodels.reference) {
          const references = Array.isArray(AASItem.submodels.reference)
            ? AASItem.submodels.reference
            : [AASItem.submodels.reference];
          references.forEach((ref) => {
            if (ref.keys && ref.keys.key && ref.keys.key.value) {
              referenceValues.push(ref.keys.key.value);
            }
          });
        }

        const relatedBItems =
          referenceValues.length > 0
            ? SubmodelData.filter((bItem) => referenceValues.includes(bItem.id))
            : [];

        aNode.children = relatedBItems.map((SMItem) => {
          const submodelNode = {
            id: SMItem.id,
            label: SMItem.idShort,
            path: [AASItem.idShort, SMItem.id],
            children: [],
            semanticID: SMItem.semanticId ? SMItem.semanticId.keys?.key?.value : null,
            details: SMItem,
            nodeType: 'submodel', // 필요에 따라 다른 타입 지정 가능
          };

          if (SMItem.submodelElements) {
            submodelNode.children = buildNodesFromSubmodelElements(
              SMItem.submodelElements,
              [AASItem.idShort, SMItem.id]
            );
          }
          return submodelNode;
        });

        return aNode;
      });

      // 트리 구조를 평면 배열로 변환
      const flattenTree = (nodes) =>
        nodes.reduce((acc, node) => {
          acc.push(node);
          if (node.children && node.children.length > 0) {
            acc = acc.concat(flattenTree(node.children));
          }
          return acc;
        }, []);

      setRowData(flattenTree(treeNodes));
    } catch (error) {
      console.error('데이터를 불러오는 중 에러 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // 파일 선택 및 업로드 이벤트 핸들러
  // ─────────────────────────────────────────────
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const text = await response.text();
      console.log('서버 응답:', text);
      const result = JSON.parse(text);
      alert(result.message);
      fetchData();
    } catch (error) {
      console.error('업로드 에러:', error);
      alert('업로드 실패!');
    }
  };

  // ─────────────────────────────────────────────
  // 컴포넌트 마운트 시 databaseOptions와 메인 데이터 불러오기
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedApiPart]);

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* 좌측 영역: API Part 선택 그리드 및 파일 업로드 */}
      <div style={{ flex: '1', width: 400 }}>
        <h2 style={{ textAlign: 'left', marginTop: '20px' }}>
          Data Grid for {selectedApiPart}
        </h2>
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <input type="file" onChange={handleFileChange} />
          <p style={{ fontSize: '12px' }}>※ 업로드할 파일을 선택해주세요.</p>
          <button onClick={handleUpload} style={{ marginTop: '10px' }}>
            파일 업로드
          </button>
        </div>
        <h2 style={{ textAlign: 'left' }}>Select API Part</h2>
        <DatabaseOptionsGrid
          options={databaseOptions}
          columnDefs={databaseColumnDefs}
          onSelect={setSelectedApiPart}
        />
      </div>
      {/* 우측 영역: 메인 데이터 그리드 */}
      <div style={{ flex: '2' }}>
        <h2 style={{ textAlign: 'left' }}>View AAS Data</h2>
        <MainDataGrid
          rowData={rowData}
          loading={loading}
          autoGroupColumnDef={autoGroupColumnDef}
          columnDefs={columnDefs}
          getDataPath={getDataPath}
        />
      </div>
    </div>
  );
};

export default DataGrid;
