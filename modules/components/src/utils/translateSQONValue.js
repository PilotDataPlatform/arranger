// keep this here incase we need to add commas to numbers in the future
// import formatNumber from '../utils/formatNumber';

export default (value) => {
  if (value === '__missing__') {
    return 'Other';
  }
  return value;
};
