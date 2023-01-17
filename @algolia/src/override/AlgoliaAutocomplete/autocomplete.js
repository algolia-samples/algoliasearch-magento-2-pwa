import React from 'react';
import algoliasearch from 'algoliasearch';
import { AlgoliaAutocomplete } from './searchbar';
import '@algolia/autocomplete-theme-classic';
import { useStyle } from '@magento/venia-ui/lib/classify';
import autocompleteClasses from './autocomplete.module.css';
import ConfigData from '../config.json';
const appId = ConfigData.applicationId;
const apiKey = ConfigData.apiKey;
const searchClient = algoliasearch(appId, apiKey);

const AlogliaAutocomplete = React.forwardRef((props, ref) => {
  const { isOpen } = props;
  const defaultClasses = autocompleteClasses;
  const classes = useStyle(defaultClasses, props.classes);
  const rootClassName = isOpen ? classes.root_open : classes.root;

  return (
    <div className={rootClassName} data-cy="SearchBar-root" ref={ref}>
      <div className="app-container">
        <AlgoliaAutocomplete
          openOnFocus={true}
          client={searchClient}
          algoliaConfig={ConfigData}
        />
      </div>
    </div>
  );
});

export default AlogliaAutocomplete;
