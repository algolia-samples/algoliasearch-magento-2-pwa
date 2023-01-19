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

export function PluginSuggestionPage(options) {
    return {
      getSources({ query }) {
        return [
            {
              sourceId: 'pages',
              getItems({ query }) {
                return getAlgoliaResults({
                    searchClient,
                    queries: [
                        {
                            indexName: ConfigData.pageIndexName,
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
                    return html`<a class="algoliasearch-autocomplete-hit" href="${item.url}">
                        <div class="info-without-thumb">
                            ${components.Highlight({ hit: item, attribute: 'name' })}
                            <div class="details">
                                ${item.content}
                            </div>
                        </div>
                        <div class="algolia-clearfix"></div>
                    </a>`;
                }
            },
            },
          ];
      },
    };
  }