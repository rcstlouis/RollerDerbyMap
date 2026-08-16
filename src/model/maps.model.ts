import { makeid } from '@/services/utils.service'
import { type LeagueRecord } from './league.model'
import mapboxgl, {
  TargetFeature,
  type CircleLayerSpecification,
  type SymbolLayerSpecification,
} from 'mapbox-gl'
// import { type GeoJSON, type Geometry, type GeoJsonProperties, type Feature } from 'geojson'

export type RulesetName =
  | 'wftda'
  | 'mrda'
  | 'shortTrack'
  | 'chicagoClassic'
  | 'bankedTrack'
  | 'renegade'
  | 'independent'

// https://bobbyhadz.com/blog/typescript-index-signature-parameter-cannot-be-union-type

const RULESET_COLOR_DICT: { [key in RulesetName]: string } = {
  wftda: '#F6A2C6',
  mrda: '#B7E3F6',
  shortTrack: '#00B5E1',
  chicagoClassic: '#E4002B',
  bankedTrack: '#5F6062',
  renegade: '#9c0000ff',
  independent: '#c800ffff',
}

export interface LeagueFilters {
  tags?: string[]
  searchString?: string
  useMap?: boolean
}

export class MapManager {
  id: string
  leagueDict: { [leagueId: number]: LeagueRecord }
  geoJsonByRulesetDict: {
    [key in RulesetName]: unknown //GeoJSON<Geometry, GeoJsonProperties>
  }
  map: mapboxgl.Map | undefined
  selectedLeague: LeagueRecord | undefined

  constructor(leagueRecords: LeagueRecord[]) {
    this.id = makeid(6)
    this.map = undefined
    this.leagueDict = {}
    this.selectedLeague = undefined

    const leaguesByRulesetDict: { [key in RulesetName]: LeagueRecord[] } = {
      wftda: [] as LeagueRecord[],
      mrda: [] as LeagueRecord[],
      shortTrack: [] as LeagueRecord[],
      chicagoClassic: [] as LeagueRecord[],
      bankedTrack: [] as LeagueRecord[],
      renegade: [] as LeagueRecord[],
      independent: [] as LeagueRecord[],
    }
    for (const record of leagueRecords ?? []) {
      this.leagueDict[record.id!] = record
      for (const ruleset of record?.rulesets ?? []) {
        leaguesByRulesetDict[ruleset].push(record)
      }
    }

    this.geoJsonByRulesetDict = {
      wftda: this.leaguesToGeoJSON(leaguesByRulesetDict['wftda'], 'wftda'),
      mrda: this.leaguesToGeoJSON(leaguesByRulesetDict['mrda'], 'mrda'),
      shortTrack: this.leaguesToGeoJSON(leaguesByRulesetDict['shortTrack'], 'shortTrack'),
      chicagoClassic: this.leaguesToGeoJSON(
        leaguesByRulesetDict['chicagoClassic'],
        'chicagoClassic',
      ),
      bankedTrack: this.leaguesToGeoJSON(leaguesByRulesetDict['bankedTrack'], 'bankedTrack'),
      renegade: this.leaguesToGeoJSON(leaguesByRulesetDict['renegade'], 'renegade'),
      independent: this.leaguesToGeoJSON(leaguesByRulesetDict['independent'], 'independent'),
    }
  }

  getId(): string {
    return this.id
  }

  /**
   * Converts a list of leagues into a valid GeoJSON object. The intent of this
   * method is to be able to be separate different rulesets into their own data
   * layers.
   * @param leagueRecords The league records that should be converted to GeoJSON
   * data
   * @param ruleset The name of the ruleset governing the included leagues
   * @returns A valid geojson object encoding the give leagues for display on
   * the map in select separate layers
   */
  private leaguesToGeoJSON(
    leagueRecords: LeagueRecord[],
    ruleset: RulesetName,
  ): { [key: string]: string } /*GeoJSON<Geometry, GeoJsonProperties>*/ {
    const features: /*Feature<Geometry, GeoJsonProperties>[]*/ {
      [key: string]: string | number | undefined | unknown
    }[] = []
    for (const league of leagueRecords) {
      features.push({
        id: league.id,
        geometry: {
          type: 'Point',
          coordinates: [league.lng, league.lat],
        },
        type: 'Feature',
        properties: {
          description: `${league.name} (${league.lat}, ${league.lng})`,
          'marker-symbol': 'marker',
          'marker-color': RULESET_COLOR_DICT[ruleset],
          'marker-size': 'medium',
          title: league.name,
          url: league.website,
        },
      })
    }
    return {
      type: 'FeatureCollection',
      features: features as unknown as string,
    }
  }

  getLeagueById(id: number): LeagueRecord | undefined {
    return this.leagueDict[id]
  }

  setSelectedLeague(id: number | undefined) {
    if (id) this.selectedLeague = this.getLeagueById(id)
    else this.selectedLeague = undefined
  }

  initMap() {
    const map = new mapboxgl.Map({
      container: 'map-' + this.id,
      center: [-71.06776, 42.35816],
      zoom: 9,
      config: {
        basemap: {
          theme: 'monochrome',
          showPlaceLabels: false,
          showPointOfInterestLabels: false,
          showRoadLabels: false,
          showTransitLabels: false,
        },
      },
    })
    // map.on('idle', () => {
    // console.log('map bounds: ', this.getMapBounds())
    // })
    map.on('load', () => {
      for (const ruleset in this.geoJsonByRulesetDict) {
        map.addSource(`${ruleset}-leagues`, {
          type: 'geojson',
          data: this.geoJsonByRulesetDict[ruleset as RulesetName] as string,
        })
        map.addLayer({
          id: `${ruleset}-names`,
          type: 'symbol',
          source: `${ruleset}-leagues`,
          visibility: 'none',
          layout: {
            'text-field': ['get', 'description'],
            'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-radial-offset': 0.5,
            'text-justify': 'auto',
          },
        } as SymbolLayerSpecification)
        map.addLayer({
          id: `${ruleset}-circles`,
          type: 'circle',
          source: `${ruleset}-leagues`,
          paint: {
            'circle-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              'rgba(2, 196, 47, 1)',
              RULESET_COLOR_DICT[ruleset as RulesetName],
            ],
            'circle-radius': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              6,
              ['boolean', ['feature-state', 'highlight'], false],
              6,
              4,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        } as CircleLayerSpecification)

        let selectedFeature: TargetFeature | undefined = undefined

        // Clicking on a feature will highlight it and display its properties in the card
        map.addInteraction('click', {
          type: 'click',
          target: { layerId: 'wftda-circles' },
          handler: ({ feature }) => {
            if (selectedFeature) {
              map.setFeatureState(selectedFeature, { selected: false })
            } else if (feature) {
              selectedFeature = feature
              map.setFeatureState(feature!, { selected: true })
            }

            this.setSelectedLeague(feature?.properties?.id as number | undefined)
            console.log('league: ', feature)
          },
        })

        // Clicking on the map will deselect the selected feature
        map.addInteraction('map-click', {
          type: 'click',
          handler: () => {
            if (selectedFeature) {
              map.setFeatureState(selectedFeature, { selected: false })
              selectedFeature = undefined
              this.setSelectedLeague(undefined)
            }
          },
        })

        // Hovering over a feature will highlight it
        map.addInteraction('mouseenter', {
          type: 'mouseenter',
          target: { layerId: 'airport' },
          handler: ({ feature }) => {
            map.setFeatureState(feature!, { highlight: true })
            map.getCanvas().style.cursor = 'pointer'
          },
        })

        // Moving the mouse away from a feature will remove the highlight
        map.addInteraction('mouseleave', {
          type: 'mouseleave',
          target: { layerId: 'airport' },
          handler: ({ feature }) => {
            map.setFeatureState(feature!, { highlight: false })
            map.getCanvas().style.cursor = ''
            return false
          },
        })
      }
    })
  }

  // getMapBounds(): undefined | google.maps.LatLngBounds {
  //   if (!this.map) return undefined
  //   const canvas = this.map.getCanvas()
  //   const w = canvas.width
  //   const h = canvas.height
  //   // const cUL = this.map.unproject([0, 0]).toArray()
  //   const cUR = this.map.unproject([w, 0]).toArray()
  //   // const cLR = this.map.unproject([w, h]).toArray()
  //   const cLL = this.map.unproject([0, h]).toArray()
  //   return new google.maps.LatLngBounds({ lat: cLL[1], lng: cLL[0] }, { lat: cUR[1], lng: cUR[0] })
  //   // return [cUL, cUR, cLR, cLL, cUL] // coordinates
  // }
}
