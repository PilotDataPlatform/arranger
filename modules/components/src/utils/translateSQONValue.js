// keep this here incase we need to add commas to numbers in the future
// import formatNumber from '../utils/formatNumber';

export default (value) => {
  if (value === '__missing__') {
    return 'Other';
  }

  // temporary fix until elastic search can support "shared" as a parm value
  if (value === 'project_folder') {
    return 'shared';
  }
  return value;
};
