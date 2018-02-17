import * as React from "react";
import LazyLoad from 'react-lazyload';
import "lightbox2/src/css/lightbox.css";

export interface IPetImageProps {
  src: string;
  alt: string;
  description: string;
  needLightbox?: boolean;
}

interface IItemProp {
  name: string;
  value: string;
}

const ItemProp: React.StatelessComponent<IItemProp> =
  ({name, value}: IItemProp) => (
    <span className="hidden" itemProp={name}>{value}</span>
  );

class PetImage extends React.Component<IPetImageProps> {
  public render() {
    let {src, alt, description} = this.props;
    const lazyload = false; // impacts SEO
    let img = lazyload ? (
      <LazyLoad offset={200} once>
        <img alt={alt} src={src} />
      </LazyLoad>
    ) : (<img alt={alt} src={src} />);
    return (
      <div className="thumbnail" itemScope
        itemType="http://schema.org/ImageObject">
        <ItemProp name="name" value={alt} />
        <ItemProp name="description" value={description} />
        <ItemProp name="contentUrl" value={src} />
        <a data-lightbox="images" href={src}>
          {img}
        </a>
      </div>
    );
  }

  public componentDidMount() {
    if (this.props.needLightbox) {
      let lightbox = require('lightbox2');
      lightbox.enable();
    }
  }
}

export default PetImage;
