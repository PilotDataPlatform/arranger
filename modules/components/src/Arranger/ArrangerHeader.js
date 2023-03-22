import React, { useState, useEffect } from 'react';

import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import './ArrangerHeader.css';

const ZoneTab = ({ handleClick, currentZone, zoneLabel, zoneTotal }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (currentZone === zoneLabel) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [currentZone]);

  return (
    <li
      onClick={() => handleClick(zoneLabel)}
      className={isActive ? 'arranger-header__filter-zone active' : 'arranger-header__filter-zone'}
    >
      {zoneLabel[0].toUpperCase() + zoneLabel.slice(1)}
      <span className="filter-zone__number">{zoneTotal}</span>
    </li>
  );
};

const ArrangerHeader = ({
  title = 'Search',
  tooltipTitle = 'test tooltip',
  setSQON,
  sqon,
  aggregations,
}) => {
  const [currentZone, setCurrentZone] = useState('');
  const [zoneData, setZoneData] = useState([]);

  const handleZoneChange = (value) => {
    let newSqon;
    const sqonContent = sqon?.content.filter((sqonObj) => sqonObj.content.field !== 'zone');

    if (value === currentZone) {
      if (zoneData.length === 1 && zoneData[0].key === value) {
        return;
      }
      setCurrentZone('');
      newSqon = sqonContent ? { ...sqon, content: [...sqonContent] } : null;
    } else {
      const zoneSqon = { op: 'in', content: { field: 'zone', value: [value] } };
      // zone is a mutually exclusive filter
      newSqon = sqonContent
        ? { ...sqon, content: [...sqonContent, zoneSqon] }
        : { op: 'and', content: [zoneSqon] };

      setCurrentZone(value);
    }

    setSQON(newSqon);
  };

  useEffect(() => {
    const zoneData = aggregations.zone?.buckets
      .map((zone, index) => {
        if (zone.key === 'greenroom') {
          return { ...zone, order: 0 };
        }

        return { ...zone, order: index + 1 };
      })
      .sort((a, b) => (a.order < b.order ? -1 : 1));
    setZoneData(zoneData);

    if (zoneData?.length === 1) {
      setCurrentZone(zoneData[0].key);
    }
  }, [aggregations]);

  return (
    <div className="arranger-header">
      <p className="arranger-header__title">
        {title}
        <Tooltip title={tooltipTitle}>
          <QuestionCircleOutlined />
        </Tooltip>
      </p>
      {zoneData?.length ? (
        <ul className="arranger-header__tabs">
          {zoneData.map((data) => (
            <ZoneTab
              key={data.key}
              handleClick={handleZoneChange}
              currentZone={currentZone}
              zoneLabel={data.key}
              zoneTotal={data.doc_count}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default ArrangerHeader;
