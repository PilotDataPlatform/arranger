import React, { useState, useEffect } from 'react';

import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import './ArrangerHeader.css';

const ZoneTab = ({ handleClick, currentZone, zoneLabel, zoneTotal }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (currentZone) {
      if (currentZone === zoneLabel) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
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
    const zoneSqon = { op: 'in', content: { field: 'zone', value: [value] } };
    // zone is a mutually exclusive filter
    const sqonWithoutZone =
      sqon?.content.filter((sqonObj) => sqonObj.content.field !== 'zone') ?? [];
    const newSqon = sqonWithoutZone.length
      ? { ...sqonWithoutZone, content: [...sqonWithoutZone.content, zoneSqon] }
      : { op: 'and', content: [zoneSqon] };

    setCurrentZone(value);
    setSQON(newSqon);
  };

  useEffect(() => {
    const zoneData = aggregations.zone?.buckets;
    setZoneData(zoneData);
  }, [aggregations]);

  return (
    <div className="arranger-header">
      <p className="arranger-header__title">
        {title}
        <Tooltip title={tooltipTitle}>
          <QuestionCircleOutlined />
        </Tooltip>
      </p>
      <ul className="arranger-header__tabs">
        {zoneData?.map((data) => (
          <ZoneTab
            key={data.key}
            handleClick={handleZoneChange}
            currentZone={currentZone}
            zoneLabel={data.key}
            zoneTotal={data.doc_count}
          />
        ))}
      </ul>
    </div>
  );
};

export default ArrangerHeader;
