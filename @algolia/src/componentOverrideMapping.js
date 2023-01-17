/**
 * Mappings for overwrites
 * example: [`@magento/venia-ui/lib/components/Main/main.js`]: './lib/components/Main/main.js'
 */
 module.exports = componentOverride = {
      [`@magento/venia-ui/lib/components/SearchBar`]: '@algolia/src/override/AlgoliaAutocomplete',
      [`@magento/peregrine/lib/hooks/useDropdown.js`]: '@algolia/src/override/handle/useDropdown.js',
      [`@magento/venia-ui/lib/components/SearchPage`]: '@algolia/src/override/AlgoliaInstantSearch',
      [`@magento/venia-ui/lib/RootComponents/Category/category`]: '@algolia/src/override/AlgoliaInstantSearch',
};