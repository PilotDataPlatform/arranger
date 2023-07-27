import React, { useState, useEffect } from 'react';

import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import './ArrangerHeader.css';

const ArrangerHeader = ({ title = 'Search', tooltipTitle = 'test tooltip' }) => (
  <div className="arranger-header">
    <p className="arranger-header__title">
      {title}
      <Tooltip title={tooltipTitle}>
        <QuestionCircleOutlined />
      </Tooltip>
    </p>
  </div>
);

export default ArrangerHeader;
