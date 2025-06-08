import { useState } from 'react';

export default function ProductImage({ src, alt, className, transitionName }) {
    const [imgSrc, setImgSrc] = useState(src);

    const handleError = () => {
        setImgSrc('/favicon.png');
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '8px'
            }}
            onError={handleError}
            data-transition-name={transitionName}
        />
    );
} 