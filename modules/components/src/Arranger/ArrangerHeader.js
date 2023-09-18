import React, { useState, useEffect } from 'react';

import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import './ArrangerHeader.css';

const DEFAULT_TOOLTIP =
  'Use the search filters to find Project file metadata in the Green Room and Core. Click Download to download the search metadata in tab separated value (TSV) format.';

const ArrangerHeader = ({ title = 'Search', tooltipTitle = DEFAULT_TOOLTIP }) => (
  <div className="arranger-header">
    <p className="arranger-header__title">
      {title}
      <Tooltip title={tooltipTitle} overlayClassName="arranger__header-tooltip">
        <QuestionCircleOutlined />
      </Tooltip>
    </p>
  </div>
);

export default ArrangerHeader;
