import React from 'react';
import { isEqual } from 'lodash';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { endOfDay, startOfDay, parseISO } from 'date-fns';

import { removeSQON, replaceSQON } from '../SQONView/utils';
import AggsWrapper from './AggsWrapper';

import './DatesAgg.css';

const dateFromSqon = (dateString) => new Date(dateString);
const toSqonDate = (date) => date.valueOf();

const { RangePicker } = DatePicker;
class DatesAgg extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initializeState();
  }

  componentDidUpdate(prevProps) {
    const { sqon, field } = this.props;
    if (!isEqual(sqon, prevProps.sqon)) {
      if (!sqon?.content.some((item) => item.content.field === field)) {
        this.setState({ rangePickerDates: ['', ''] });
      }
    }
  }

  initializeState = () => {
    const { field, getActiveValue } = this.props;
    const startFromSqon = getActiveValue({ op: '>=', field });
    const endFromSqon = getActiveValue({ op: '<=', field });

    return {
      startDate: startFromSqon ? dateFromSqon(startFromSqon) : null,
      endDate: endFromSqon ? dateFromSqon(endFromSqon) : null,
      rangePickerDates: ['', ''],
    };
  };

  updateSqon = () => {
    const startDate = parseISO(this.state.startDate);
    const endDate = parseISO(this.state.endDate);

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

  onDateChange = (dates, dateStrings) => {
    const [startDate, endDate] = dateStrings;
    this.setState({ startDate, endDate, rangePickerDates: dates }, this.updateSqon);
  };

  disabledDate = (current) => {
    // current is dayjs instance
    return current?.isAfter(dayjs().endOf('day'));
  };

  render() {
    const {
      collapsible = true,
      displayName = 'Date Range',
      field,
      type,
      WrapperComponent,
    } = this.props;

    const dataFields = {
      ...(field && { 'data-field': field }),
      ...(type && { 'data-type': type }),
    };

    return (
      <AggsWrapper dataFields={dataFields} {...{ displayName, WrapperComponent, collapsible }}>
        <div className="date-agg__wrapper">
          <RangePicker
            disabledDate={this.disabledDate}
            onChange={this.onDateChange}
            value={this.state.rangePickerDates}
          />
        </div>
      </AggsWrapper>
    );
  }
}

export default DatesAgg;
