'use client';
  import { useState } from 'react';
  import Image from 'next/image';

  export function PhotoHover() {
    const [src, setSrc] = useState('/photo.jpg');

    return (
      <div
      // move the picture to the right edge of the panel, and make it taller so it overflows up and down for a cool effect
        style={{ position: 'absolute', right: 0, top: '55%', transform: 'translateY(-50%)', width: '37vw', height: '90vh', overflow: 'visible',pointerEvents: 'none' }}
        onMouseEnter={() => setSrc('/gif22.gif')}
        onMouseLeave={() => setSrc('/photo.jpg')}
      >
        {/* // style={{ position: 'absolute', width: '20%', height: '600px' }}
        // onMouseEnter={() => setSrc('/gif22.gif')}
        // onMouseLeave={() => setSrc('/photo.jpg')} */}
     
        <Image
          src={src}
          alt="Nidhi Joshi"
          width={300}
          height={200}
        style={{ overflow: 'visible',pointerEvents: 'auto' }}
        />
      </div>
    );
  }
