import formatNumber from '../utils/formatNumber';

export default (value) => {
  if (value === '__missing__') {
    return 'Other';
  }
  return formatNumber(value);
};
