import React from "react";

const Image = ({ imgSrc, className, onLoad }) => {
  return <img className={className} src={imgSrc} alt={imgSrc} onLoad={onLoad} />;
};

export default Image;
