import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import React, { createElement, Fragment, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { ProductItemImg } from './ProductItem';

import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';

import { NoResult } from './ProductItem';

import {PluginSuggestionPage} from './plugin/pages';
import {PluginSuggestionColor} from './plugin/colors';
import {AutocompleteInsights} from './plugin/insights';
import ConfigData from '../config.json';

export function AlgoliaAutocomplete(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }
    const searchClient = props.client;

    const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
      key: 'multi-column-layout-example',
      limit: 2,
      transformSource({ source }) {
        return {
          ...source,
          getItemUrl({ item }) {
            return `/search.html?query=${item.id}`;
          },
          templates: {
            item(params) {
              const { item, html } = params;
    
              return html`<a class="aa-ItemLink" href="/search.html?query=${item.id}">
                ${source.templates.item(params).props.children}
              </a>`;
            },
          },
        };
      },
    });

    const querySuggestionsPlugin = createQuerySuggestionsPlugin({
      searchClient,
      indexName: ConfigData.categoryIndexName,
      transformSource({ source }) {
        return {
          ...source,
          getItemUrl({ item }) {
            return item.url;
          },
          templates: {
            noResults() {
              return 'No results.';
            },
            item(params) {
              const { item, html } = params;
              return html`<a className="aa-ItemLink" href="${item.url && item.url.replace(ConfigData.REPLACE_URL, '') || ''}">
                          ${item.path} (${item.product_count})
                      </a>`;
            },
          },
        };
      }
    });

    let productData = [];

    const noResult = <NoResult />;

    const searchCategory = (obj) => {
      try {
        let searchData = [];
        const facetData = obj.facets["categories.level0"];
        for (const k in facetData) {
          searchData.push({
            name: k,
            count: facetData[k],
            url: "/"
          })
        }
        return searchData;
      } catch (e) {
        console.log(e);
      }
    }

    const pageSuggestion = PluginSuggestionPage({});
    const colorSuggestion = PluginSuggestionColor({});
    const algoliaInsightsPlugin = AutocompleteInsights();

    
    const search = autocomplete({
      container: containerRef.current,
      renderer: { createElement, Fragment, render },
      plugins: [recentSearchesPlugin, querySuggestionsPlugin, pageSuggestion, colorSuggestion, algoliaInsightsPlugin],
      onSubmit({ state }) {
        window.location.href = `/search.html?query=${state.query}`;
      },
      getSources: ({ query }) => [
        {
          sourceId: 'products',
          getItemUrl({ item }) {
            return item.url;
          },
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: props.algoliaConfig.indexName,
                  query,
                  params: {
                    hitsPerPage: 5,
                    distinct: true,
                    facets: ['categories.level0'],
                    numericFilters: 'visibility_search=1',
                    ruleContexts: ['magento_filters', ''],
                    analyticsTags: 'autocomplete',
                    clickAnalytics: true
                  },
                },
              ],
              transformResponse({ results, hits }) {
                productData = results;
                return hits;
              },
            });
          },
          templates: {
            noResults() {
              return 'No results.';
            },
            item({ item, components }) {
              return <ProductItemImg hit={item} components={components} query={props.algoliaConfig.useAdaptiveImage ? productData && productData[0] && productData[0].query.toLowerCase() || '' : ''} />;
            }
          },
        },
      ],
      ...props,
      render({ elements }, root) {
        const { recentSearchesPlugin, querySuggestionsPlugin, pages, color, products } = elements;
        render(
          <div className="aa-PanelLayout aa-Panel--scrollable">
            <div className="aa-PanelSections">
              {props.algoliaConfig.autocomplete.sections && props.algoliaConfig.autocomplete.sections.length > 0 &&
                <div className="aa-PanelSection--left">
                  <h3>Recent Search</h3>
                  {recentSearchesPlugin || noResult}
                  <h3>Categories</h3>
                  {querySuggestionsPlugin || noResult}
                  {
                    props.algoliaConfig.autocomplete.sections.map(item =>
                      <div className="section">
                        <h3>{item.name}</h3>
                        {item.name === "pages" &&
                          pages
                        }
                        {item.name === "color" &&
                          color
                        }
                      </div>
                    )
                  }
                </div>
              }
              <div className={props.algoliaConfig.autocomplete.sections && props.algoliaConfig.autocomplete.sections.length > 0 ? "aa-PanelSection--right" : "aa-PanelSection--right fullWidth"}>{products}</div>
              <div id="autocomplete-products-footer">
                See products in <span><a href="/">{props.algoliaConfig.translations.allDepartments}</a></span> ({productData && productData[0].nbHits || 0}) {props.algoliaConfig.translations.orIn} {searchCategory(productData[0]).map((item, index) => { return index === 0 ? <span><a href={item.url}>{item.name}</a> ({item.count})</span> : <span>, <a href={item.url}>{item.name}</a> ({item.count})</span> })}
              </div>
              <div className="footer_algolia">
                <a href="https://www.algolia.com/?utm_source=magento&amp;utm_medium=link&amp;utm_campaign=magento_autocompletion_menu" title="Search by Algolia" target="_blank">
                  <img src={props.algoliaConfig.urls.logo} alt="Search by Algolia" />
                </a>
              </div>
            </div>
          </div>,
          root
        );
      },
    });

    return () => {
      search.destroy();
    };
  }, [props]);

  return <div ref={containerRef} />;
}