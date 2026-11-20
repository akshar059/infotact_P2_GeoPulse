export function createGeoPulseMapConfig(
  dataId = 'mumbai_footfall_data',
  mapState = {}
) {
  const defaultColors = [
    '#4C0035',
    '#880030',
    '#B72F15',
    '#D6610A',
    '#EF9100',
    '#FFC300',
  ];

  return {
    version: 'v1',
    config: {
      visState: {
        filters: [],
        layers: [
          {
            id: 'geopulse_footfall_heatmap',
            type: 'heatmap',
            config: {
              dataId,
              columnMode: 'points',
              label: 'Footfall Intensity Heatmap',
              color: [255, 153, 31],
              highlightColor: [252, 242, 26, 255],
              columns: {
                lat: 'lat',
                lng: 'lng',
              },
              isVisible: true,
              visConfig: {
                opacity: 0.8,
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  category: 'Uber',
                  colors: defaultColors,
                },
                radius: 35,
              },
              hidden: false,
              textLabel: [],
            },
            visualChannels: {
              weightField: {
                name: 'value',
                type: 'integer',
              },
              weightScale: 'linear',
            },
          },
          {
            id: 'geopulse_store_points',
            type: 'point',
            config: {
              dataId,
              columnMode: 'points',
              label: 'Retail Store Locations',
              color: [30, 129, 176],
              highlightColor: [252, 242, 26, 255],
              columns: {
                lat: 'lat',
                lng: 'lng',
              },
              isVisible: true,
              visConfig: {
                pulseTrigger: 'continuous',
                pulseTimeField: '',
                pulseDurationMs: 1000,
                glowEnabled: false,
                glowExtent: 2,
                glowStrength: 0.5,
                pulseEnabled: false,
                pulseMode: 'pulse',
                pulseSpeed: 1,
                pulseExpansion: 2,
                radius: 10,
                fixedRadius: false,
                opacity: 0.9,
                outline: true,
                thickness: 2,
                strokeColor: [255, 255, 255],
                colorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  category: 'Uber',
                  colors: defaultColors,
                },
                strokeColorRange: {
                  name: 'Global Warming',
                  type: 'sequential',
                  category: 'Uber',
                  colors: defaultColors,
                },
                radiusRange: [0, 50],
                filled: true,
                billboard: false,
                allowHover: true,
                showNeighborOnHover: false,
                showHighlightColor: true,
              },
              hidden: false,
              textLabel: [],
            },
            visualChannels: {
              colorField: null,
              colorScale: 'quantile',
              strokeColorField: null,
              strokeColorScale: 'quantile',
              sizeField: null,
              sizeScale: 'linear',
            },
          },
        ],
        effects: [],
        annotations: [],
        interactionConfig: {
          tooltip: {
            fieldsToShow: {
              [dataId]: [
                { name: 'id', format: null },
                { name: 'value', format: null },
                { name: 'category', format: null },
                { name: 'timestamp', format: 'L LTS' },
              ],
            },
            timezone: null,
            compareMode: false,
            compareType: 'absolute',
            enabled: true,
          },
          legend: {
            hideInvisibleLayers: false,
            enabled: false,
          },
          brush: {
            size: 2.5,
            enabled: false,
          },
          geocoder: {
            limitSearch: false,
            color: [255, 0, 0],
            enabled: false,
          },
          coordinate: {
            enabled: false,
          },
          annotation: {
            enabled: false,
          },
          zoomOpacity: {
            controllers: [],
            enabled: false,
          },
        },
        layerBlending: 'normal',
        overlayBlending: 'normal',
        splitMaps: [],
        animationConfig: {
          currentTime: null,
          speed: 1,
          timeFormat: null,
          timezone: null,
        },
        editor: {
          features: [],
          visible: true,
        },
        layerOrder: ['geopulse_store_points', 'geopulse_footfall_heatmap'],
        groupBys: [],
        joins: [],
      },
      mapState: {
        bearing: 0,
        dragRotate: true,
        latitude: mapState.latitude ?? 19.072675,
        longitude: mapState.longitude ?? 72.8836625,
        pitch: 0,
        zoom: mapState.zoom ?? 10.5,
        isSplit: false,
        isViewportSynced: true,
        isZoomLocked: false,
        splitMapViewports: [],
        maxPitch: 60,
        mapSplitMode: 'SINGLE_MAP',
        swipeComparePercentage: 50,
        mapViewMode: 'MODE_2D',
      },
      mapStyle: {
        styleType: 'carto_voyager',
        topLayerGroups: {},
        visibleLayerGroups: {
          label: true,
          road: true,
          water: true,
        },
        threeDBuildingColor: [233.71862868880427, 230.92517894351974, 226.26942936804556],
        backgroundColor: [0, 0, 0],
        mapStyles: {},
      },
      uiState: {
        locale: 'en',
        theme: 'dark',
      },
    },
  };
}