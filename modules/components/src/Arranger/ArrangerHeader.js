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

const ArrangerHeader = ({ title = 'Search', tooltipTitle = 'test tooltip' }) => {
  const [currentZone, setCurrentZone] = useState('greenroom'); // TO BE DERIVED FROM PROPS

  const handleZoneChange = (value) => {
    setCurrentZone(value);
  };

  useEffect(() => {
    // change currentZone when props updates
  }, []);

  return (
    <div className="arranger-header">
      <p className="arranger-header__title">
        {title}
        <Tooltip title={tooltipTitle}>
          <QuestionCircleOutlined />
        </Tooltip>
      </p>
      <ul className="arranger-header__tabs">
        <ZoneTab
          handleClick={handleZoneChange}
          currentZone={currentZone}
          zoneLabel="greenroom"
          zoneTotal={213}
        />
        <ZoneTab
          handleClick={handleZoneChange}
          currentZone={currentZone}
          zoneLabel="core"
          zoneTotal={123}
        />
      </ul>
    </div>
  );
};

export default ArrangerHeader;
