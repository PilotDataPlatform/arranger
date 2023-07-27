import React, { useState, useEffect } from 'react';

import './ArrangerHeader.css';

const transformZoneLabel = (zoneLabel) => {
  if (zoneLabel === 'greenroom') {
    return 'Green Room';
  }

  return zoneLabel[0].toUpperCase() + zoneLabel.slice(1);
};

const Zone = ({ handleClick, currentZone, zoneLabel, zoneTotal }) => {
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
      className={isActive ? 'zone-tabs__zone active' : 'zone-tabs__zone'}
      key={zoneLabel}
      data-zone={zoneLabel}
    >
      {transformZoneLabel(zoneLabel)}
      <span className="zone-tabs__filter-number">{zoneTotal}</span>
    </li>
  );
};

const ZoneTab = ({ setSQON, sqon, aggregations }) => {
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

  useEffect(() => {
    const sqonZone = sqon?.content.find((sqonObj) => sqonObj.content.field === 'zone');

    if (!sqonZone) {
      setCurrentZone('');
    }
  }, [sqon]);

  return (
    <div>
      {zoneData?.length ? (
        <ul className="zone-tabs">
          {zoneData.map((data) => (
            <Zone
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

export default ZoneTab;
