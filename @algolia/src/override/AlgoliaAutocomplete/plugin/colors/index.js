import React from "react";
import algoliasearch from 'algoliasearch';
import { getAlgoliaResults } from '@algolia/autocomplete-js';

import ConfigData from '../../../config.json';
const appId = ConfigData.applicationId;
const apiKey = ConfigData.apiKey;
const extraHeader = {
          headers: {
            AppSample: ConfigData.appVersion;
          }
        };  
const searchClient = algoliasearch(appId, apiKey, extraHeader);

export function PluginSuggestionColor(options) {
    return {
      getSources({ query }) {
        return [
            {
              sourceId: 'color',
              getItems({ query }) {
                return getAlgoliaResults({
                    searchClient,
                    queries: [
                        {
                            indexName: ConfigData.colorIndexName,
                            query,
                            params: {
                                hitsPerPage: 2,
                                distinct: true,
                            },
                        },
                    ],
                });
            },
              templates: {
                noResults() {
                    return 'No results.';
                },
                item({ item, components, html }) {
                    return html`
                        ${components.Highlight({ hit: item, attribute: 'value' })}
                    `;
                }
            },
            },
          ];
      },
    };
  }