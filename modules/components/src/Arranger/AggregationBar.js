import React from 'react';
import { Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import ZoneTabs from './ZoneTabs';
import './AggregationBar.css';

const AggregrationBar = ({
  title = 'Filters',
  buttonText = 'Clear All',
  onButtonClick,
  aggs,
  setSQON,
  sqon,
  aggregations,
}) => {
  if (!aggs?.length) {
    return null;
  }

  return (
    <div className="aggregation-bar">
      <ZoneTabs setSQON={setSQON} sqon={sqon} aggregations={aggregations} />
      <div className="aggregation-bar__filter">
        <div className="filter__title">
          <FilterOutlined />
          <p>{title}</p>
        </div>
        <Button type="text" onClick={onButtonClick}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default AggregrationBar;
