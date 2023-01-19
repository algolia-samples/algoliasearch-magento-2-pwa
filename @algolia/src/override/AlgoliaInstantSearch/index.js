import React, { useEffect, useState } from 'react';
import { mergeClasses } from '@magento/venia-ui/lib/classify';
import { shape, string } from 'prop-types';
import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { searchBox, hitsPerPage, refinementList, clearRefinements, hierarchicalMenu, rangeInput, infiniteHits, sortBy, currentRefinements } from 'instantsearch.js/es/widgets';
import defaultClasses from './index.css';
import ConfigData from '../config.json';

import Breadcrumbs from '@magento/venia-ui/lib/components/Breadcrumbs';

import { insightsMiddlewareV1, sendInsight } from './plugin/insights';

function getWindowSize() {
    const { innerWidth, innerHeight } = window;
    return { innerWidth, innerHeight };
}

const AlgoliInsantSearch = props => {
    const { uid } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const queryParams = new URLSearchParams(window.location.search);

    const [facetDisplay, setFacetDisplay] = useState(false);
    const [refineBtnTxt, setRefineBtnTxt] = useState("+ Refine");
    const [windowSize, setWindowSize] = useState(getWindowSize());

    const toTitleCase = (str) => {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    const getCategoryArray = () => {
        try {
            let urlPath = window.location.pathname;
            if (!urlPath.includes('search.html')) {
                let catPath = [];
                urlPath.split('/').map((item) => {
                    if (item) {
                        if (catPath.length > 0) {
                            catPath.map((text) => {
                                if (item.toLocaleLowerCase().indexOf(text.toLowerCase()) >= 0) {
                                    let pathText = item.replaceAll(text.toLowerCase(), "");
                                    let d = pathText.replaceAll('-', " ");
                                    let e = d.replaceAll('.html', "");
                                    catPath.push(toTitleCase(e));
                                }else{
                                    let d = item.replaceAll('-', " ");
                                    let e = d.replaceAll('.html', "");
                                    catPath.push(toTitleCase(e));
                                }
                            })
                        } else {
                            let d = item.replaceAll('-', " ");
                            let e = d.replaceAll('.html', "");
                            catPath.push(toTitleCase(e));
                        }
                    }
                });
                const updatedPath = catPath.toString().replace(/\s*\,\s*/g, ",").trim().split(",");
                return updatedPath.join(" /// ");
            } else {
                return "";
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const appId = ConfigData.applicationId;
        const apiKey = ConfigData.apiKey;
        const indexName = ConfigData.indexName;
        const extraHeader = {
          headers: {
            AppSample: ConfigData.appVersion;
          }
        };  
        const searchClient = algoliasearch(appId, apiKey, extraHeader);

        let initialUI;
        const initialCat = getCategoryArray();
        
        if (initialCat !== "") {
            initialUI = {
                query: queryParams.get("query"),
                hierarchicalMenu: {
                    'categories.level0': [initialCat],
                },
            }
        } else {
            initialUI = {
                query: queryParams.get("query")
            }
        }

        const search = instantsearch({
            indexName: indexName,
            searchClient,
            initialUiState: {
                [indexName]: initialUI
            },
        });

        ConfigData.facets && ConfigData.facets.forEach((item, index) => {
            if (index === 0) {
                search.addWidgets([
                    clearRefinements({
                        container: '#clear-all',
                        templates: {
                            resetLabel({ hasRefinements }, { html }) {
                                return html`<span>${hasRefinements ? 'Clear filters' : 'No filter applied'}</span>`;
                            },
                        },
                        cssClasses: {
                            root: classes.clearRefinement,
                            button: [
                                classes.clearRefinementBtn,
                            ],
                        },
                    }),
                    currentRefinements({
                        container: '#current-refinements',
                        cssClasses: {
                            list: [
                                classes.currentRefinementsList
                            ],
                        },
                    })
                ]);
            }
            const facetEle = document.getElementById(item.containerId);
            if (!facetEle && item.title) {
                let container = document.createElement('div');
                container.className = classes.filterContainer;

                let facetTitle = document.createElement('h2');
                facetTitle.innerText = item.title;

                let facetContainer = document.createElement('div');
                facetContainer.setAttribute('id', item.containerId);

                container.appendChild(facetTitle);
                container.appendChild(facetContainer);
                document.getElementById('facetPanel').appendChild(container);
            }

            const facetType = item.type || "";
            switch (facetType) {
                case "hitsPerPage":
                    search.addWidgets([
                        hitsPerPage({
                            container: `#${item.containerId}`,
                            items: item.listItem,
                            cssClasses: {
                                root: classes.instantSearchHitsPerPage,
                                select: classes.instantSearchListMenu,
                            }
                        })
                    ]);
                    break;
                case "rangeInput":
                    search.addWidgets([
                        rangeInput({
                            container: `#${item.containerId}`,
                            attribute: item.attribute,
                            templates: {
                                submitText() {
                                    return item.buttonText;
                                }
                            },
                            cssClasses: {
                                input: classes.filterInputBox,
                                submit: classes.filterBtn
                            }
                        })
                    ]);
                    break;
                case "hierarchicalMenu":
                    search.addWidgets([
                        hierarchicalMenu({
                            container: `#${item.containerId}`,
                            attributes: item.attribute,
                            separator: ' /// ',
                            cssClasses: {
                                label: classes.filterListLabel,
                                count: classes.filterCount,
                                childList: classes.filterChildList,
                                selectedItem: classes.filterSelectedItem,
                                selectedItemLink: classes.filterSelectedItemLink
                            }
                        })
                    ]);
                    break;
                case "refinementList":
                    search.addWidgets([
                        refinementList({
                            container: `#${item.containerId}`,
                            attribute: item.attribute,
                            searchable: item.searchable || false,
                            limit: item.limit || null,
                            showMore: item.showMore || false,
                            cssClasses: {
                                labelText: classes.filterListLabel,
                                count: classes.filterCount,
                                searchableInput: classes.searchableInput,
                                searchableSubmit: classes.searchableSubmit
                            }
                        }),
                    ]);
                    break;
            }
        });
        search.addWidgets([
            searchBox({
                container: "#searchbox",
                placeholder: "Search for products",
                showSubmit: false,
                showReset: false,
                cssClasses: {
                    root: classes.instantSearchbox,
                    input: classes.searchableInput,
                }
            }),
            sortBy({
                container: '#productSort',
                items: ConfigData.sortList,
                cssClasses: {
                    select: [
                        classes.productSortingSelect
                    ],
                },
            }),
            infiniteHits({
                container: "#products",
                cssClasses: {
                    list: classes.hitList,
                    item: classes.hitItem,
                },
                transformItems(items, result) {
                    if (result) {
                        let productCount = document.getElementById('productCount');
                        productCount.innerHTML = `${result.results.nbHits || "-"} results found in ${result.results.processingTimeMS || "-"} milisecond`
                    }
                    return items.map((item) => ({
                        ...item,
                        url: item.url.indexOf(ConfigData.REPLACE_URL) >= 0 ? item.url.replace(ConfigData.REPLACE_URL, '') : item.url,
                    }));
                },
                templates: {
                    empty(results, { html }) {
                        return html`No results for <q>${results.query}</q>`;
                    },
                    showMoreText(data, { html }) {
                        return html`<span>Load more Result</span>`;
                    },
                    item(hit, { html, components }) {
                        return html`
                      <a className="result-content" onClick="${() => sendInsight(hit, 'click', 'PWA - Product Clicked')}" href="${hit.url}"> 
                            <div className="result-thumbnail"> 
                                <img itemprop="image" src="${hit.image_url}" alt="${hit.name}" /> 
                            </div> 
                            <div className="result-sub-content"> 
                                <h3 itemprop="name" className="result-title text-ellipsis">${components.Highlight({ attribute: 'name', hit })}</h3> 
                                <div className="price-wrapper">${hit.price && hit.price.USD.default_formated || ""}</div>
                                <button type="button" onClick="${() => sendInsight(hit, 'conversion', 'PWA - Placed Order')}" title="Add to Cart" className="${classes.filterBtn}"> <span>Add to Cart</span> </button>
                            </div>
                        </a>
                      `;
                    },
                }
            })
        ]);
        search.start();

        const insightsMiddlewaretest = insightsMiddlewareV1();
        search.use(insightsMiddlewaretest);
    }, []);

    useEffect(() => {
        function handleWindowResize() {
            const winSize = getWindowSize();
            setWindowSize(winSize);
            const windowWidth = winSize.innerWidth;
            if (windowWidth > 1023) {
                setFacetDisplay(true);
            } else {
                setFacetDisplay(false);
            }
        }
        handleWindowResize();
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);


    useEffect(() => {
        const facetEle = document.getElementById("facetPanel");
        if (facetDisplay) {
            facetEle.style.display = "block";
            setRefineBtnTxt("- Refine");
        } else {
            facetEle.style.display = "none"
            setRefineBtnTxt("+ Refine");
        }
    }, [facetDisplay]);

    return (
        <div className={classes.container}>
            <Breadcrumbs categoryId={uid} />
            <div className={classes.twoColumn}>
                <div id="refineBtn" className={classes.refineBtn} onClick={() => setFacetDisplay(!facetDisplay)}>{refineBtnTxt}</div>
                <div id="facetPanel" className={classes.leftColumn}>
                    <div id="clear-all"></div>
                    <div id="current-refinements"></div>
                </div>
                <div className={classes.rightColumn}>
                    <div id="searchbox"></div>
                    <div className={classes.topNav}>
                        <div id="productCount"></div>
                        <div id="productSort"></div>
                    </div>
                    <div id="products" className={classes.productList}></div>
                </div>
            </div>
        </div>
    );
}
AlgoliInsantSearch.propTypes = {
    classes: shape({ root: string })
};
AlgoliInsantSearch.defaultProps = {};
export default AlgoliInsantSearch;