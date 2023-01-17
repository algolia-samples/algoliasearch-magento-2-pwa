import { createAlgoliaInsightsPlugin } from '@algolia/autocomplete-plugin-algolia-insights';
import insightsClient from 'search-insights';
import ConfigData from '../../../config.json';

export function AutocompleteInsights() {
    const appId = ConfigData.applicationId;
    const apiKey = ConfigData.apiKey;
    const yourUserToken = ConfigData.userToken;

    insightsClient('init', { appId, apiKey });
    insightsClient('setUserToken', yourUserToken);
    return (
        createAlgoliaInsightsPlugin({
            insightsClient,
            onItemsChange({ insights, insightsEvents }) {
              const events = insightsEvents.map((insightsEvent) => ({
                ...insightsEvent,
                eventName: 'PWA - Product Viewed from Autocomplete',
              }));
              insights.viewedObjectIDs(...events);
            },
            onSelect({ insights, insightsEvents }) {
              const events = insightsEvents.map((insightsEvent) => ({
                ...insightsEvent,
                eventType: "click",
                eventName: 'PWA - Product Clicked from Autocomplete',
                index: insightsEvent.index,
                objectIDs: insightsEvent.objectIDs,
                queryID: insightsEvent.queryID,
                positions: insightsEvent.positions
              }));
              insights.clickedObjectIDsAfterSearch(...events);
            },
          })
    )
}