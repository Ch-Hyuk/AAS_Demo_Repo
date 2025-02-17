import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';

// ag‑grid 스타일 적용을 위한 CSS 임포트
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const DataGrid = () => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // A Collection 데이터 가져오기
        const resAAS = await fetch('http://127.0.0.1:5000/api/DemoKit/collections/aas_repo');
        const AASData = await resAAS.json();

        // B Collection 데이터 가져오기
        const resSubmodel = await fetch('http://127.0.0.1:5000/api/DemoKit/collections/submodel_repo');
        const SubmodelData = await resSubmodel.json();

        // A Collection 데이터를 트리 구조로 변환
        const treeNodes = AASData.map(AASItem => {
          // A Collection의 최상위 노드 생성
          const aNode = {
            id: AASItem.id,
            label: AASItem.idShort,
            path: [AASItem.idShort],
            children: [],
          };

          // A Collection 항목의 submodels에서 각 reference의 keys.key.value 값을 배열로 추출합니다.
          let referenceValues = [];
          if (AASItem.submodels && AASItem.submodels.reference) {
            let references = AASItem.submodels.reference;
            if (!Array.isArray(references)) {
              references = [references];
            }
            references.forEach(ref => {
              if (ref.keys && ref.keys.key && ref.keys.key.value) {
                referenceValues.push(ref.keys.key.value);
              }
            });
          }

          // referenceValues 배열에 포함된 값과 일치하는 B Collection의 Submodel 데이터를 필터링합니다.
          const relatedBItems =
            referenceValues.length > 0
              ? SubmodelData.filter(bItem => referenceValues.includes(bItem.id))
              : [];

          // 각 B Collection 항목에 대해 Submodel 노드 생성
          aNode.children = relatedBItems.map(SMItem => {
            const submodelNode = {
              id: SMItem.id,
              label: SMItem.idShort,
              path: [AASItem.idShort, SMItem.id],
              children: [],
              semanticID: SMItem.semanticId ? SMItem.semanticId.keys?.key?.value : null,
            };

            // Case 1: submodelElements 내에 property가 바로 존재하는 경우
            if (SMItem.submodelElements && SMItem.submodelElements.property) {
              let propertyList = SMItem.submodelElements.property;
              if (!Array.isArray(propertyList)) {
                propertyList = [propertyList];
              }
              propertyList.forEach(prop => {
                const propertyNode = {
                  id: prop.idShort,
                  label: prop.idShort,
                  path: [AASItem.idShort, SMItem.id, prop.idShort],
                  details: prop,
                  semanticID: prop.semanticId ? prop.semanticId.keys?.key?.value : null,
                  value: prop.value !== undefined ? prop.value : ''
                };
                submodelNode.children.push(propertyNode);
              });
            }

            // Case 2: submodelElements.submodelElementCollection.value.property 경로에 존재하는 경우
            if (
                SMItem.submodelElements &&
                SMItem.submodelElements.submodelElementCollection &&
                SMItem.submodelElements.submodelElementCollection.value &&
                SMItem.submodelElements.submodelElementCollection.value.property
            ) {
              let propertyList = SMItem.submodelElements.submodelElementCollection.value.property;
              if (!Array.isArray(propertyList)) {
                propertyList = [propertyList];
              }
              propertyList.forEach(prop => {
                const propertyNode = {
                  id: prop.id || prop.idShort,
                  label: prop.idShort,
                  type: 'Property',
                  path: [AASItem.idShort, SMItem.id, prop.id || prop.idShort],
                  details: prop,
                  semanticID: prop.semanticId ? prop.semanticId.keys?.key?.value : null,
                  value: prop.value !== undefined ? prop.value : ''
                };
                submodelNode.children.push(propertyNode);
              });
            }
            return submodelNode;
          });

          return aNode;
        });

        // 트리 구조를 평면 배열로 변환 (ag‑grid의 treeData용)
        const flattenTree = (nodes) => {
          let result = [];
          nodes.forEach(node => {
            result.push(node);
            if (node.children && node.children.length > 0) {
              result = result.concat(flattenTree(node.children));
            }
          });
          return result;
        };

        const flatData = flattenTree(treeNodes);
        setRowData(flatData);
      } catch (error) {
        console.error("데이터를 불러오는 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 자동 그룹 컬럼 정의: 왼쪽에 "Type" 컬럼 표시
  const autoGroupColumnDef = {
    headerName: 'Type',
    field: 'label',
    cellRendererParams: {
      suppressCount: true
    },
    width: 300,
    minWidth: 300,
    maxWidth: 500,
    resizable: true,
    cellStyle: (params) => {
      switch (params.node.level) {
        case 0:
          return { fontWeight: 'bold', color: 'darkblue', fontSize: '20px' };
        case 1:
          return { fontWeight: 'bold', color: 'blue' };
        case 2:
          return { fontWeight: 'normal', color: 'black' };
        default:
          return { fontWeight: 'normal', color: 'gray' };
      }
    }
  };

  // 추가 컬럼 정의: Semantic ID 및 Value 컬럼 추가
  const columnDefs = [
    {
      field: 'semanticID',
      headerName: 'Semantic ID',
      width: 500,
      minWidth: 300,
      maxWidth: 500,
      resizable: true
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 200,
      minWidth: 100,
      maxWidth: 300,
      resizable: true
    }
  ];

  const getDataPath = data => data.path;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="ag-theme-alpine" style={{ height: 1000, width: '100%', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
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

export default DataGrid;
