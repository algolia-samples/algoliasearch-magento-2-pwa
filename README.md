# Algolia Search PWA extension for Magento 2

![Latest version](https://img.shields.io/badge/latest-1.0.0-green)

`Dependencies`
<a href="https://github.com/algolia/instantsearch/releases/tag/v4.49.1">![Algolia](https://img.shields.io/badge/-instantsearch.js_4.49.1-5468FF?logo=algolia&colorA=404040&logoColor=5468FF)</a> <a href="https://github.com/algolia/algoliasearch-client-javascript/releases/tag/4.14.2">![Node](https://img.shields.io/badge/-algoliasearch_4.14.2-5468FF?logo=algolia&colorA=404040&logoColor=5468FF)</a> <a href="https://github.com/algolia/search-insights.js/releases/tag/v2.2.1">![Algolia](https://img.shields.io/badge/-insights_2.2.1-5468FF?logo=algolia&colorA=404040&logoColor=5468FF)</a> <a href="https://github.com/algolia/autocomplete/releases/tag/v1.7.1">![Algolia](https://img.shields.io/badge/-autocomplete_1.7.1-5468FF?logo=algolia&colorA=404040&logoColor=5468FF)</a> <a href="https://nodejs.org/en/blog/release/v16.16.0/">![Node](https://img.shields.io/badge/-version_16+-66cc33?logo=node.js&colorA=404040&logoColor=66cc33)</a>

## Setting Up Magento PWA for Venia

### Create Magento PWA Project

`Note: Follow these steps to create a new Magento PWA project. If you already have a PWA project then move to next section.`

Create a new folder for Magento PWA project and go to this newly created PWA folder in a terminal window and execute the following commands:

```sh
$ yarn create @magento/pwa
$ Project root directory (will be created if it does not exist): "./"
$ Add your detail
$ Choose install with Venia theme
$ Select Yarn => Install package dependencies with yarn after creating project: Yes
```

### Adding Algolia Search PWA extension for Magento 2

- Download the source for [Algolia Search PWA extension for Magento 2](https://github.com/algolia/algoliasearch-magento-2-pwa/tree/master)
- Extract the source zip file
- Copy the @algolia folder from the extracted source and paste it to your PWA root directory.
- Below is the folder structure you can see in your @algolia folder.
  ![Algolia Search PWA extension folder structure](readme/images/structure.png?raw=true 'Algolia Search PWA extension folder structure')
- Add the below code in your PWA package.json file (available at the project root Level) to include Algolia Autocomplete and Instant Search package:

```json
"dependencies": {
    "@algolia/autocomplete": "link:./@algolia",
    "@algolia/autocomplete-plugin-algolia-insights": "^1.7.2",
    "@algolia/autocomplete-plugin-query-suggestions": "^1.7.1",
    "@algolia/autocomplete-plugin-recent-searches": "^1.7.1",
    "@magento/pwa-buildpack": "~11.4.0",
    "algoliasearch": "^4.14.2",
    "instantsearch.js": "^4.49.1",
    "search-insights": "^2.2.1"
},

"devDependencies": {
    "@algolia/autocomplete-js": "^1.7.1",
    "@algolia/autocomplete-theme-classic": "^1.7.1"
}
```

- Install extension with yarn
  -- Go to project root folder in the terminal and execute the command `$ yarn & yarn watch`

### Override Venia Components with Algolia PWA Extension

#### Override Searchbar

To override the search component with Algolia Autocomplete, we need to identify the component from the theme. For Example, in `Venia Theme` we identify the search bar component, which is `“@magento/venia-ui/lib/components/SearchBar”` and override with the Algolia Autocomplete. We need to create our component in the `“<pwa-extension>/src”` folder. For now we have created our Algolia Autocomplete under `“<pwa-extension>/src/override”` with the AlgoliaAutocomplete name.

Now in your extension, edit the `“<pwa-extension>/src/componentOverrideMapping.js”` file with below code:

```javascript
module.exports = componentOverride = {
  [`@magento/venia-ui/lib/components/SearchBar`]:
    '@algolia/src/override /AlgoliaAutocomplete',
};
```

![Algolia Search PWA extension override](readme/images/overrideComponent.png?raw=true 'Algolia Search PWA extension override')

Re-run the project: `$ yarn watch`

#### Create Custom Route

We can create our custom route using `intercept.js`.
For example, we need to create a custom page with route `“/algoliasearch”`, we need to edit `“<pwa-extension>/src/intercept.js”` and add the below code:

```javascript
module.exports = (targets) => {
  targets.of('@magento/venia-ui').routes.tap((routesArray) => {
    routesArray.push({
      name: 'AlgoliaInstantSearch',
      pattern: '/algoliasearch',
      path: '@algolia/src/components/algoliaPage',
    });
    return routesArray;
  });
};
```

![Algolia Search PWA custom routes](readme/images/customRoute.png?raw=true 'Algolia Search PWA custom routes')

---

Instant Search Page is created using `instantsearch.js` package and the widgets like `refinementList` are used for filters.

For autocomplete, the `@algolia/autocomplete-js` package and `@algolia/autocomplete-theme-classic` is used.

## Note:

GraphQL endpoints have not been implemented in our AlgoliaSearch Magento Extension yet; Algolia configurations for Magento PWA need to be manually managed in @algolia/src/override/config.json (refer to @algolia/src/override/config.sample.json).

## References

[Instant Search](https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/)<br>
[React Instant Search](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/)<br>
[RefinementList](https://www.algolia.com/doc/api-reference/widgets/refinement-list/react/#examples)<br>
[React Autocomplete](https://www.algolia.com/doc/ui-libraries/autocomplete/integrations/using-react/)<br>
[Search Insights](https://www.algolia.com/doc/guides/building-search-ui/going-further/send-insights-events/react/#installing-the-search-insights-library)<br>
[Algolia Search](https://www.algolia.com/doc/api-client/getting-started/install/javascript/?client=javascript)

## Need Help?

Algolia does not provide support for the extension, including installation or troubleshooting. If you require help with this connector, please contact Algolia Sales.

The extension, and Subscriber’s use of such extension is subject to and governed by the applicable open source license accompanying, linked to or embedded in such extension repository ("Open Source License"). Algolia grants Subscriber a license to use the extension to the full extent permitted by the applicable Open Source License.
