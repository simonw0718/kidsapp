// Automatically import all PNG images from the assets directory
// This will auto-update when you add new images to src/assets/images/color-garden/
const imageModules = import.meta.glob('/src/assets/images/color-garden/*.png', {
    eager: true,
    import: 'default'
});

// Extract filenames and create image list
export const COLORING_IMAGES = Object.keys(imageModules).map(path => {
    const filename = path.split('/').pop() || '';
    return {
        filename: filename.replace('.png', ''),
        // @ts-ignore - Vite handles this import
        url: imageModules[path] as string
    };
}).filter(img => img.filename && !img.filename.startsWith('.'));
