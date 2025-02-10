// MongoHierarchy.js
import React, { useState, useEffect } from 'react';
import './MongoHierarchy.css'; // 아래에 CSS 코드 예시가 있음

const MongoHierarchy = () => {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/databases')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setDatabases(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('데이터베이스 목록을 불러오는 중 오류 발생:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">데이터베이스 목록을 불러오는 중...</div>;
  }

  return (
    <div className="mongo-hierarchy">
      <h2>데이터베이스 목록</h2>
      {databases.map((dbName) => (
        <DatabaseNode key={dbName} dbName={dbName} />
      ))}
    </div>
  );
};

const DatabaseNode = ({ dbName }) => {
  const [expanded, setExpanded] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = () => {
    if (!expanded && collections.length === 0) {
      setLoading(true);
      fetch(`http://127.0.0.1:5000/api/${encodeURIComponent(dbName)}/collections`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setCollections(data);
          setExpanded(true);
          setLoading(false);
        })
        .catch((error) => {
          console.error(`데이터베이스 ${dbName}의 컬렉션을 불러오는 중 오류 발생:`, error);
          setLoading(false);
        });
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="database-node">
      <div className="database-header" onClick={toggleExpand}>
        {expanded ? '[-] ' : '[+] '}
        {dbName}
      </div>
      {expanded && (
        <div className="collections-list">
          {loading ? (
            <div className="loading">컬렉션을 불러오는 중...</div>
          ) : collections.length > 0 ? (
            collections.map((coll) => (
              <CollectionNode key={coll} dbName={dbName} collectionName={coll} />
            ))
          ) : (
            <div className="no-collections">컬렉션이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
};

const CollectionNode = ({ dbName, collectionName }) => {
  const [expanded, setExpanded] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = () => {
    if (!expanded && documents.length === 0) {
      setLoading(true);
      fetch(
        `http://127.0.0.1:5000/api/${encodeURIComponent(
          dbName
        )}/${encodeURIComponent(collectionName)}/documents`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setDocuments(data);
          setExpanded(true);
          setLoading(false);
        })
        .catch((error) => {
          console.error(`컬렉션 ${collectionName}의 문서를 불러오는 중 오류 발생:`, error);
          setLoading(false);
        });
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div className="collection-node">
      <div className="collection-header" onClick={toggleExpand}>
        {expanded ? '[-] ' : '[+] '}
        {collectionName}
      </div>
      {expanded && (
        <div className="documents-list">
          {loading ? (
            <div className="loading">문서를 불러오는 중...</div>
          ) : documents.length > 0 ? (
            documents.map((doc, index) => (
              <div key={index} className="document">
                <strong>문서 {index + 1}:</strong>
                <pre>{JSON.stringify(doc, null, 2)}</pre>
              </div>
            ))
          ) : (
            <div className="no-documents">문서가 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MongoHierarchy;
