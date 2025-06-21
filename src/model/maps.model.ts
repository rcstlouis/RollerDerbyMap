import { type LeagueRecord } from './league.model'

// export class MapManager {
//   map: google.maps.Map
//   id: string

//   leagueMarkerDict: { [leagueName: string]: google.maps.marker.AdvancedMarkerElement }

//   constructor(map: google.maps.Map, id: string) {
//     this.map = map
//     this.id = id
//     this.leagueMarkerDict = {}
//   }

//   async addLeague(record: LeagueRecord): Promise<google.maps.marker.AdvancedMarkerElement> {
//     const { AdvancedMarkerElement } = (await google.maps.importLibrary(
//       'marker',
//     )) as google.maps.MarkerLibrary

//     const marker = new AdvancedMarkerElement({
//       map: this.map,
//       position: new google.maps.LatLng(record.loc.lat, record.loc.lng),
//       title: record.name,
//       gmpClickable: true,
//       gmpDraggable: true,
//       zIndex: 1000,
//     })

//     console.debug(`Made marker: ${JSON.stringify(marker.position)}`)

//     this.leagueMarkerDict[record.name] = marker
//     return marker
//   }
// }

export class MapManager2 {
  leagueDict: { [leagueName: string]: LeagueRecord }

  constructor(leagueRecords: LeagueRecord[]) {
    this.leagueDict = {}
    for (const record of leagueRecords ?? []) {
      this.leagueDict[record.name] = record
    }
  }
}

export class Coord {
  lat: number
  lng: number

  constructor(obj: Coord) {
    this.lat = obj.lat
    this.lng = obj.lng
  }
}
