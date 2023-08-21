import React, { useState, useContext, useEffect } from 'react';
import { Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import TextFilter from '../TextFilter/TextFilter';
import { debounce } from 'lodash';
import { ArrangerStateContext } from './ArrangerContext';
import { currentFilterValue } from '../SQONView/utils';

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
  filterInputPlaceholder = 'Type to filter by text',
  fieldTypesForFilter = ['text', 'keyword'],
}) => {
  if (!aggs?.length) {
    return null;
  }

  const [filterValue, setFilterValue] = useState('');
  const { arrangerState } = useContext(ArrangerStateContext);

  const debouncedOnFilterChange = debounce(({ generateNextSQON, value }) => {
    setSQON(
      generateNextSQON({
        sqon,
        fields: arrangerState.columnState.state.columns
          .filter((x) => fieldTypesForFilter.includes(x.extendedType) && x.show)
          .map((x) => x.field),
      }),
    );
  }, 300);

  useEffect(() => {
    if (!currentFilterValue(sqon)) {
      setFilterValue('');
    }
  }, [sqon]);

  return (
    <div className="aggregation-bar">
      <ZoneTabs setSQON={setSQON} sqon={sqon} aggregations={aggregations} />
      <div className="aggregation-bar__clear-filters">
        <div className="filter__title">
          <FilterOutlined />
          <p>{title}</p>
        </div>
        <Button type="text" onClick={onButtonClick}>
          {buttonText}
        </Button>
      </div>
      <div className="aggregation-bar__filter">
        <TextFilter
          value={filterValue}
          placeholder={filterInputPlaceholder}
          onChange={({ value, generateNextSQON }) => {
            setFilterValue(value);
            debouncedOnFilterChange({ value, generateNextSQON });
          }}
        />
      </div>
    </div>
  );
};

export default AggregrationBar;
