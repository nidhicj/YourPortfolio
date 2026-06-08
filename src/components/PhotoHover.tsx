'use client';
  import { useState } from 'react';
  import Image from 'next/image';

  export function PhotoHover() {
    const [src, setSrc] = useState('/photo.jpg');

    return (
      <div
        style={{ position: 'absolute', width: '25%', height: '300px' }}
        onMouseEnter={() => setSrc('/photo.gif')}
        onMouseLeave={() => setSrc('/photo.jpg')}
      >
        <Image
          src={src}
          alt="Nidhi Joshi"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }
