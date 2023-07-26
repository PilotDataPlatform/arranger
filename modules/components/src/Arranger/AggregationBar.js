import React from 'react';
import { Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import './AggregationBar.css';

const AggregrationBar = ({ title = 'Filters', buttonText = 'Clear All', onButtonClick, aggs }) => {
  if (!aggs?.length) {
    return null;
  }

  return (
    <div className="aggregation-bar">
      <div className="aggregation-bar__title">
        <FilterOutlined />
        <p>{title}</p>
      </div>
      <Button type="text" onClick={onButtonClick}>
        {buttonText}
      </Button>
    </div>
  );
};

export default AggregrationBar;
