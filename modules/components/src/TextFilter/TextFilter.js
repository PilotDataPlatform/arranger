import React from 'react';

import SearchIcon from 'react-icons/lib/fa/search';
import { SearchOutlined } from '@ant-design/icons';

import TextInput from '../Input';
import { Input } from 'antd';
import { replaceFilterSQON } from '../SQONView/utils';

export const generateNextSQON =
  (value) =>
  ({ sqon, fields, entity }) =>
    replaceFilterSQON(
      {
        op: 'and',
        content: [
          {
            op: 'filter',
            content: {
              fields: fields,
              value,
              ...(entity && { entity }),
            },
          },
        ],
      },
      sqon,
    );

const TextFilter = ({
  value,
  onChange,
  Icon = SearchIcon,
  placeholder = 'Filter',
  InputComponent = Input,
  ...props
}) => (
  <InputComponent
    prefix={<SearchOutlined />}
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => {
      const {
        target: { value },
      } = e;
      onChange({
        value,
        generateNextSQON: generateNextSQON(value),
      });
    }}
    aria-label={`Data filter`}
    {...props}
  />
);

export default TextFilter;
