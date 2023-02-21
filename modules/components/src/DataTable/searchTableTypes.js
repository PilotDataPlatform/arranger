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

const renderText = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const renderFileSize = (text) => {
  return getFileSize(text);
};

const renderDate = (text) => {
  return dateHandler({ value: text });
};

const renderIcon = (_, record) => {
  if (record.type === 'file') {
    const fileExtension = record.name.split('.').length > 1 ? record.name.split('.').at(-1) : null;
    if (fileExtension) {
      switch (fileExtension) {
        case 'zip':
          return <FileZipOutlined />;
        case 'doc':
          return <FileZipOutlined />;
        case 'pdf':
          return <FileImageOutlined />;
        case 'jpg':
          return <FileImageOutlined />;
        case 'img':
          return <FileImageOutlined />;
        case 'jpeg':
          return <FileImageOutlined />;
        case 'png':
          return <FileImageOutlined />;
        case 'svg':
          return <FileImageOutlined />;
        default:
          return <FileOutlined />;
      }
    }

    if (record.name.includes('imaging') || record.name.includes('image')) {
      return <FileImageOutlined />;
    }

    return <FileOutlined />;
  }

  return <FolderOutlined />;
};

export default function renderField(field) {
  switch (field) {
    case 'size':
      return renderFileSize;
    case 'created_time':
      return renderDate;
    case 'type':
      return renderIcon;
    default:
      return renderText;
  }
}
