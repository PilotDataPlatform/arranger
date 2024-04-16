import React from 'react';
import {
  FileOutlined,
  FileZipOutlined,
  FileImageOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { format, isValid, parseISO } from 'date-fns';
import { isNil } from 'lodash';

const STANDARD_DATE = 'yyyy-MM-dd';
const dateHandler = ({ value, ...props } = {}) => {
  switch (true) {
    case isNil(value):
      return '';
    case isValid(new Date(value)):
      return format(new Date(value), STANDARD_DATE);
    case isValid(parseISO(value)):
      return format(parseISO(value), STANDARD_DATE);
    case !isNaN(parseInt(value, 10)):
      return format(parseInt(value, 10), STANDARD_DATE);
    default: {
      console.error('unhandled data', value, props);
      return value;
    }
  }
};

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

const renderText = (text) => text;

const renderZone = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const renderFileSize = (text) => {
  if (text === 0) {
    return '';
  }
  return getFileSize(text);
};

const renderDate = (text) => {
  return dateHandler({ value: text });
};

const renderIcon = (_, record) => (record.type === 'file' ? <FileOutlined /> : <FolderOutlined />);

const renderParentPath = (path) => {
  if (path?.includes('namefolder/')) {
    return path.replace('namefolder/', 'users/');
  }

  return path;
};

export default function renderField(field) {
  switch (field) {
    case 'size':
      return renderFileSize;
    case 'created_time':
      return renderDate;
    case 'type':
      return renderIcon;
    case 'zone':
      return renderZone;
    case 'parent_path':
      return renderParentPath;
    default:
      return renderText;
  }
}
