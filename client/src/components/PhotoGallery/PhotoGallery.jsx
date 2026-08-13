import React, { useState } from 'react';

export const PhotoGallery = ({ photos, isSoloMode }) => {
    const [downloading, setDownloading] = useState(false);

    if (!photos || photos.length === 0) {
        return (
            <div className="gallery-container">
                <p style={{ color: '#999', fontSize: '0.9rem' }}>
                    No photos captured yet. Press the camera button to take a photo!
                </p>
            </div>
        );
    }

    const handleDownloadStrip = () => {
        if (photos.length === 0 || downloading) return;
        setDownloading(true);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const padding = 40;
        const targetWidth = isSoloMode ? 600 : 1200;
        
        // Load first image to determine aspect ratio
        const firstImg = new Image();
        firstImg.onload = () => {
            const imageAspect = firstImg.height / firstImg.width;
            const targetHeight = targetWidth * imageAspect;

            canvas.width = targetWidth + (padding * 2);
            canvas.height = (targetHeight * photos.length) + (padding * (photos.length + 1)) + 120;

            // Background fill
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let loadedCount = 0;
            photos.forEach((src, index) => {
                const img = new Image();
                img.onload = () => {
                    const yPos = padding + (index * (targetHeight + padding));
                    ctx.drawImage(img, padding, yPos, targetWidth, targetHeight);

                    // Outer stroke border around photo
                    ctx.strokeStyle = '#eeeeee';
                    ctx.lineWidth = 4;
                    ctx.strokeRect(padding, yPos, targetWidth, targetHeight);

                    loadedCount++;
                    if (loadedCount === photos.length) {
                        // Branding footer
                        ctx.fillStyle = '#111111';
                        ctx.font = 'bold 36px Poppins, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('SyncBooth 2025', canvas.width / 2, canvas.height - 50);

                        // Trigger download
                        const link = document.createElement('a');
                        link.download = isSoloMode 
                            ? `syncbooth-solo-${Date.now()}.jpg` 
                            : `syncbooth-shared-${Date.now()}.jpg`;
                        link.href = canvas.toDataURL('image/jpeg', 0.92);
                        link.click();
                        setDownloading(false);
                    }
                };
                img.src = src;
            });
        };
        firstImg.src = photos[0];
    };

    return (
        <div className="gallery-container">
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>Your Photobooth Strip ({photos.length}/5)</h3>
            
            <div className={`mini-strip ${isSoloMode ? 'solo-thumbs' : 'shared-thumbs'}`}>
                {photos.map((src, index) => (
                    <img key={index} src={src} alt={`Capture ${index + 1}`} />
                ))}
            </div>

            <button 
                className="btn" 
                onClick={handleDownloadStrip}
                disabled={downloading}
                style={{ margin: '15px auto' }}
            >
                {downloading ? 'Generating Strip...' : 'Download Photobooth Strip'} <i className="fa-solid fa-download"></i>
            </button>
        </div>
    );
};
