import React from 'react';
import ConfigData from '../config.json';

export function ProductItemImg({ hit, components, query }) {
    const ImageSrc = () => {
        if(hit.images_data && query && query !== "" && query !== null){
            for (const i in hit.images_data) {
                if(query.indexOf(i) >= 0){
                    return hit.images_data[i];
                }
              }
              return hit.image_url;
        }else{
            return hit.image_url;
        }  
    }
    return (
        <a className="algoliasearch-autocomplete-hit" href={hit.url && hit.url.replace(ConfigData.REPLACE_URL, '') || ''}>
            <div className="thumb"><img src={ImageSrc()} alt={hit.name} /></div>
            <div className="info">
                <components.Highlight hit={hit} attribute="name" />
                {hit && hit.color && 
                <div className="algoliasearch-autocomplete-category">
                        Color:&nbsp;
                        {hit.color && typeof hit.color === "object" && hit.color.map((_, index) => (
                            <span>
                                <components.Highlight
                                    hit={hit}
                                    attribute={['color', index]}
                                />
                            </span>
                        ))}
                </div>
                }
                <div className="algoliasearch-autocomplete-category">
                    in&nbsp;
                    {hit.categories_without_path && hit.categories_without_path.map((_, index) => (
                        <span>
                            <components.Highlight
                                hit={hit}
                                attribute={['categories_without_path', index]}
                            />
                        </span>
                    ))}
                </div>
                <div className="algoliasearch-autocomplete-price">
                    {hit.price && hit.price.USD.default_formated || '-'}
                </div>
            </div>
        </a>
    )
}

export function NoResult() {
    return (
        <div class="aa-SourceNoResults">No Result</div>
    )
}