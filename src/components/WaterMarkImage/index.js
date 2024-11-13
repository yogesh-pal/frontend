/* eslint-disable no-restricted-syntax */
import React, { useEffect, useRef, useState } from 'react';

const ImageWithWatermark = ({
  image, setImage, imageUrl, watermarkText
}) => {
  const canvasRef = useRef(null);
  const [watermarkedImageUrl, setWatermarkedImageUrl] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const maxWidth = 280;
      const lineHeight = 17;
      const lines = [];
      const totalLines = watermarkText.split('\n');
      for (const currLine of totalLines) {
        let line = '';
        const words = currLine.split(' ');
        for (const word of words) {
          const testLine = line ? `${line} ${word}` : word;
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth > maxWidth) {
            lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        ctx.fillStyle = 'black';
        const rectangleHeight = lines.length * lineHeight;
        ctx.fillRect(0, canvas.height - (rectangleHeight + 10), 500, rectangleHeight + 10);

        ctx.font = '13px Arial';
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'bottom';

        lines.forEach((li, index) => {
          ctx.fillText(li, 4, canvas.height - (((lines.length - index - 1) * lineHeight + 3)));
        });
      }
      const watermarkedDataUrl = canvas.toDataURL('image/jpeg');
      setWatermarkedImageUrl(watermarkedDataUrl);
      setImage({
        ...image,
        file: watermarkedDataUrl
      });
    };
  }, [imageUrl, watermarkText]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {watermarkedImageUrl && <img src={watermarkedImageUrl} alt='Watermarked Img' />}
    </div>
  );
};

export default ImageWithWatermark;
