// src/utils/mapHelpers.ts

export const addCustomIconsAndImagesToMap = (map: any, filteredAtmLocations: any[], getTopLayerId: (map: any) => string) => {
    const icons = [
        { name: 'mosque-icon', url: '/icons/mosque.png' },
        { name: 'turkish-flag', url: '/icons/turkishflag.png' },
        { name: 'faculty-icon', url: '/icons/facultyBuilding.png' },
        { name: 'hospital-icon', url: '/icons/hospital.png' },
        { name: 'dormBuilding-icon', url: '/icons/dormBuilding.png' },
        { name: 'gokkusagi-icon', url: '/icons/gokkusagi.png' },
        { name: 'institute-icon', url: "/icons/institute.png" }
    ];

    const loadIcons = () => {
        return Promise.all(
            icons.map(icon =>
                new Promise<void>((resolve, reject) => {
                    if (map.hasImage(icon.name)) {
                        resolve();
                    } else {
                        map.loadImage(icon.url, (error: any, image: any) => {
                            if (error) {
                                reject(error);
                            } else {
                                if (!map.hasImage(icon.name)) {
                                    map.addImage(icon.name, image);
                                }
                                resolve();
                            }
                        });
                    }
                })
            )
        );
    };

    map.loadImage('/icons/atm.png', (error: any, image: any) => {
        if (error) throw error;
        if (!map.hasImage('atm-icon')) {
            map.addImage('atm-icon', image);
        }

        if (!map.getSource('atm-points')) {
            map.addSource('atm-points', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: filteredAtmLocations.map(atm => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [atm.longitude, atm.latitude]
                        },
                        properties: {
                            id: atm.id,
                            icon: 'atm-icon'
                        }
                    }))
                }
            });

            map.addLayer({
                id: 'atm-icons-layer',
                type: 'symbol',
                source: 'atm-points',
                layout: {
                    'icon-image': ['get', 'icon'],
                    'icon-size': [
                        'match',
                        ['get', 'icon'],
                        'atm-icon', 0.001,
                        0.3
                    ],
                    'icon-allow-overlap': true
                }
            });
        }

        if (!map.getSource('selected-atm')) {
            map.addSource('selected-atm', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            map.addLayer({
                id: 'selected-atm-layer',
                type: 'circle',
                source: 'selected-atm',
                paint: {
                    'circle-radius': 10,
                    'circle-color': 'red',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': 'white'
                }
            });
        }
    });

    const loadGeoJSON = () => fetch('buildingIcons.json').then(res => res.json());
    const loadParkAreas = () => fetch('parkAreas.json').then(res => res.json());

    const addMultipleImagesToMap = (images: any[]) => {
        images.forEach(({ id, url, coordinates }) => {
            if (!map.getSource(id)) {
                map.addSource(id, {
                    type: 'image',
                    url: url,
                    coordinates: coordinates
                });

                map.addLayer({
                    id: `${id}-layer`,
                    type: 'raster',
                    source: id,
                    paint: {
                        'raster-opacity': 0.85
                    }
                });
            }
        });
    };

    Promise.all([loadIcons(), loadGeoJSON(), loadParkAreas()])
        .then(([_, points, parkAreas]) => {
            if (!map.getSource('multiple-icons')) {
                map.addSource('multiple-icons', {
                    type: 'geojson',
                    data: points
                });

                map.addLayer({
                    id: 'multiple-icons-layer',
                    type: 'symbol',
                    source: 'multiple-icons',
                    layout: {
                        'icon-image': ['get', 'icon'],
                        'icon-size': [
                            'match',
                            ['get', 'icon'],
                            'mosque-icon', 0.2,
                            'turkish-flag', 0.4,
                            'faculty-icon', 0.4,
                            'hospital-icon', 0.4,
                            'dormBuilding-icon', 0.4,
                            'gokkusagi-icon', 0.4,
                            'institute-icon', 0.4,
                            0.4
                        ],
                        'icon-allow-overlap': true,
                        'text-field': ['get', 'title'],
                        'text-offset': [0, 1.2],
                        'text-anchor': 'top',
                        'text-size': 20
                    },
                    paint: {
                        'text-color': '#ffffff'
                    }
                }, getTopLayerId(map));
            }

            addMultipleImagesToMap(parkAreas);
        })
        .catch(err => console.error('Veriler yüklenirken hata oluştu:', err));
};
