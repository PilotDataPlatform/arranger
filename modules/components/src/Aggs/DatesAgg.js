import React from 'react';
import { DatePicker } from 'antd';
// import DatePicker from 'react-datepicker';
// import dayjs from 'dayjs';
import moment from 'moment';
// import { css } from 'emotion';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';

import { removeSQON, replaceSQON } from '../SQONView/utils';
import AggsWrapper from './AggsWrapper';

import 'react-datepicker/dist/react-datepicker.css';
import './DatesAgg.css';

const dateFromSqon = (dateString) => new Date(dateString);
const toSqonDate = (date) => date.valueOf();

const { RangePicker } = DatePicker;

const dateFormat = 'yyyy/MM/dd';
const fieldPlaceholder = dateFormat.toUpperCase();

class DatesAgg extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initializeState(props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState(this.initializeState(nextProps));
  }

  initializeState = ({ getActiveValue = () => null, stats = {}, enforceStatsMax = false }) => {
    const { field } = this.props;
    const minDate = stats.min && subDays(stats.min, 1);
    const statsMax = stats.max && addDays(stats.max, 1);
    const maxDate = enforceStatsMax ? statsMax : Math.max(Date.now(), statsMax);
    const startFromSqon = getActiveValue({ op: '>=', field });
    const endFromSqon = getActiveValue({ op: '<=', field });

    return {
      minDate,
      maxDate,
      startDate: startFromSqon ? dateFromSqon(startFromSqon) : null,
      endDate: endFromSqon ? dateFromSqon(endFromSqon) : null,
    };
  };

  updateSqon = () => {
    const { startDate, endDate } = this.state;
    const { field, handleDateChange } = this.props;
    if (handleDateChange && field) {
      const content = [
        ...(startDate
          ? [
              {
                op: '>=',
                content: {
                  field,
                  value: toSqonDate(startOfDay(startDate)),
                },
              },
            ]
          : []),
        ...(endDate
          ? [
              {
                op: '<=',
                content: {
                  field,
                  value: toSqonDate(endOfDay(endDate)),
                },
              },
            ]
          : []),
      ];
      handleDateChange({
        field,
        value: content,
        generateNextSQON: (sqon) =>
          replaceSQON(content.length ? { op: 'and', content } : null, removeSQON(field, sqon)),
      });
    }
  };

  // needs to be update to identify between start and end date from range picker
  handleDateChange = (limit) => (date) => {
    this.setState({ [`${limit}Date`]: date }, this.updateSqon);
  };

  disabledDate = (current) => {
    // disable all dates after today
    return current && current > moment().endOf('day');
  };

  render() {
    const {
      collapsible = true,
      displayName = 'Date Range',
      facetView = false,
      field,
      type,
      WrapperComponent,
    } = this.props;
    const { minDate, maxDate, startDate, endDate } = this.state;
    const hasData = minDate && maxDate;

    const dataFields = {
      ...(field && { 'data-field': field }),
      ...(type && { 'data-type': type }),
    };

    return (
      <AggsWrapper dataFields={dataFields} {...{ displayName, WrapperComponent, collapsible }}>
        <div className="date-agg__wrapper">
          <RangePicker disabledDate={this.disabledDate} />
        </div>
      </AggsWrapper>
    );
  }
}

export default DatesAgg;
