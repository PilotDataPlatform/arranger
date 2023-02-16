import React from 'react';
import { FileOutlined } from '@ant-design/icons';

import { dateHandler } from './columnTypes';

const getFileSize = (size, options = {}) => {
  options.roundingLimit = options.roundingLimit ?? 2;

  return size < 1024
    ? size.toString().concat(' B')
    : size < 1024 * 1024
    ? (size / 1024).toFixed(options.roundingLimit).toString().concat(' KB')
    : size < 1024 * 1024 * 1024
    ? (size / (1024 * 1024)).toFixed(options.roundingLimit).toString().concat(' MB')
    : (size / (1024 * 1024 * 1024)).toFixed(options.roundingLimit).toString().concat(' GB');
};

const capitalizeText = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const renderText = (text) => capitalizeText(text);

const renderFileSize = (text) => {
  // check whether record is folder or file - needs to be added by back end
  return getFileSize(text);
};

const renderDate = (text) => {
  return dateHandler({ value: text });
};

const renderIcon = (text, record) => {
  return <FileOutlined />;
};

export default function renderField(field) {
  switch (field) {
    case 'size':
      return renderFileSize;
    case 'created_time':
      return renderDate;
    case 'icon':
      return renderIcon;
    default:
      return renderText;
  }
}
