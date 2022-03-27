import { ComponentType, createContext, useContext, useState } from 'react';

import defaultApiFetcher from '@/utils/api';
import columnsToGraphql from '@/utils/columnsToGraphql';
import getComponentDisplayName from '@/utils/getComponentDisplayName';
import { ThemeProvider } from '@/ThemeContext';

import { useExtendedMapping } from './helpers';
import {
  DataContextInterface,
  DataProviderProps,
  FetchDataFn,
  SQONType,
  UseDataContextProps,
} from './types';

export const DataContext = createContext<DataContextInterface>({} as DataContextInterface);
// returning "as interface" so the type is explicit while integrating into another app

/** Context provider for Arranger's theme functionalities
 * @param {APIFetcherFn} customFetcher function to make customised request and subsequent data handling (e.g. middlewares);
 * @param {object} legacyProps allows passing items currently managed by `<Arranger />`, to ease migration. For internal use only.
 * **Highly discouraged props, as it will be deprecated in an upcoming version.**
 * @param {Theme} theme allows giving the provider a custom version of the theme for the consumers.
 */
export const DataProvider = ({
  children,
  customFetcher: apiFetcher = defaultApiFetcher,
  graphqlField,
  legacyProps,
  theme,
  url,
}: DataProviderProps): React.ReactElement<DataContextInterface> => {
  const [selectedTableRows, setSelectedTableRows] = useState<string[]>([]);
  const [sqon, setSQON] = useState<SQONType>(null);
  const extendedMapping = useExtendedMapping({
    apiFetcher,
    graphqlField,
  });

  const fetchData: FetchDataFn = (options = {}) =>
    apiFetcher({
      endpoint: `/graphql`,
      body: columnsToGraphql(options),
      url,
    }).then((response) => {
      const hits = options?.config?.type ? response?.data?.[options.config.type]?.hits : {};
      const data = (hits.edges || []).map((e: any) => e.node);
      const total = hits.total || 0;

      return { total, data };
    });

  const contextValues = {
    extendedMapping,
    fetchData,
    selectedTableRows,
    setSelectedTableRows,
    setSQON,
    sqon,
  };

  return (
    <DataContext.Provider value={contextValues}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </DataContext.Provider>
  );
};

export const useDataContext = ({
  customFetcher: localFetcher,
}: UseDataContextProps = {}): DataContextInterface => {
  const defaultContext = useContext(DataContext);

  return {
    ...defaultContext,
    fetchData: localFetcher || defaultContext.fetchData,
  };
};

export const withData = <Props extends object>(Component: ComponentType<Props>) => {
  const ComponentWithData = (props: Props) => {
    const dataProps = {
      ...props,
      ...useDataContext(),
    } as Props;

    return <Component {...dataProps} />;
  };

  ComponentWithData.displayName = `WithArrangerTheme(${getComponentDisplayName(Component)})`;

  return ComponentWithData;
};

if (process.env.NODE_ENV === 'development') {
  DataContext.displayName = 'ArrangerDataContext';
  DataProvider.displayName = 'ArrangerDataProvider';
}