import { fetchMapping } from '@pilotdataplatform/arranger-mapping-utils';

export let fetchMappings = ({ types, es }) => {
  return Promise.all(types.map(({ index, name, esType }) => fetchMapping({ index, esType, es })));
};
