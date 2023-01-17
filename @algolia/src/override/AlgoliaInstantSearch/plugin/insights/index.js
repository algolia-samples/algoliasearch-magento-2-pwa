import insightsClient from 'search-insights';
import ConfigData from '../../../config.json';
import { createInsightsMiddleware } from 'instantsearch.js/es/middlewares';
const appId = ConfigData.applicationId;
const apiKey = ConfigData.apiKey;
const yourUserToken = ConfigData.userToken;
const indexName = ConfigData.indexName;
export function insightsMiddlewareV1() {
    insightsClient('init', { appId, apiKey });
    insightsClient('setUserToken', yourUserToken);
    return (
      createInsightsMiddleware({
        insightsClient,
        onEvent: (event, aa) => {
            const { insightsMethod, payload, widgetType, eventType } = event;
            // Send the event to Algolia
            if (insightsMethod) {
              aa(insightsMethod, payload);
            }
            if(widgetType === 'ais.refinementList' && eventType === 'click'){
                aa(insightsMethod, payload);
            }
          },
      })
    )
}
export function sendInsight(hit, eventType, eventName) {
  let eventObjct;
  if(eventType && eventType.toLowerCase() === 'click'){
    eventObjct = {
      eventType: eventType,
      eventName: eventName,
      index: indexName,
      userToken: yourUserToken,
      queryID: hit.__queryID,
      objectIDs: [hit.objectID],
      positions: [hit.__position],
    }
  }else{
    eventObjct = {
      eventType: eventType,
      eventName: eventName,
      index: indexName,
      userToken: yourUserToken,
      queryID: hit.__queryID,
      objectIDs: [hit.objectID],
    }
  }

  return(
    insightsClient('sendEvents', [eventObjct])
  )
}