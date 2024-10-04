export const FotosService = {
    getData() {
        return [
            {
                itemImageSrc: '/public/ImagenesOTB/imagen-8.jpg',
                thumbnailImageSrc: '../public/ImagenesOTB/imagen-8.8.jpg',
                alt: 'Description for Image 1',
                title: 'Title 1'
            },
            {
                itemImageSrc: '/public/ImagenesOTB/imagen-2.jpg',
                thumbnailImageSrc: '../public/ImagenesOTB/imagen-2.2.jpg',
                alt: 'Description for Image 2',
                title: 'Title 2'
            },
            {
                itemImageSrc: '/public/ImagenesOTB/imagen-3.jpg',
                thumbnailImageSrc: '/public/ImagenesOTB/imagen-3.3.jpg',
                alt: 'Description for Image 3',
                title: 'Title 3'
            },
            {
                itemImageSrc: '/public/ImagenesOTB/imagen-4.jpg',
                thumbnailImageSrc: '/public/ImagenesOTB/imagen-4.4.jpg',
                alt: 'Description for Image 4',
                title: 'Title 4'
            },
            {
                itemImageSrc: '/public/ImagenesOTB/imagen-5.jpg',
                thumbnailImageSrc: '/public/ImagenesOTB/imagen-5.5.jpg',
                alt: 'Description for Image 5',
                title: 'Title 5'
            },
            {
                itemImageSrc: '/public/ImagenesOTB/imagen-6.jpg',
                thumbnailImageSrc: '/public/ImagenesOTB/imagen-6.6.jpg',
                alt: 'Description for Image 6',
                title: 'Title 6'
            },
            {
                itemImageSrc: '/public/ImagenesOTB/imagen-7.jpg',
                thumbnailImageSrc: '/public/ImagenesOTB/imagen-7.7.jpg',
                alt: 'Description for Image 7',
                title: 'Title 7'
            },
        ];
    },

    getImages() {
        return Promise.resolve(this.getData());
    }
};
