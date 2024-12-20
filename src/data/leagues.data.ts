import type { LeagueRecord } from '@/model/league.model'

export const leagueRecords: LeagueRecord[] = [
  {
    name: 'Bay State Brawlers',
    country: 'United States',
    state: 'Massachusetts',
    city: 'Fitchburg',
    leagues: ['WFTDA'],
    website: 'https://baystatebrawlers.com',
    lastActive: new Date('2024/12/06'),
    tags: ['Central Mass', 'Massachusetts', 'CMRD'],

    loc: { lat: 42.59505753320044, lng: -71.78446990261048 },
  },
  {
    name: 'Boston Roller Derby',
    country: 'United States',
    state: 'Massachusetts',
    city: 'Boston',
    leagues: ['WFTDA'],
    website: 'https://bostonrollerderby.com',
    lastActive: new Date('2024/12/06'),
    tags: ['Boston', 'Massachusetts', 'BRD'],

    loc: { lat: 42.5679122374727, lng: -71.13546779897317 },
  },
  {
    name: 'Mass Attack Roller Derby',
    country: 'United States',
    state: 'Massachusetts',
    city: 'Seekonk',
    leagues: ['WFTDA'],
    website: 'https://massattackrollerderby.com',
    lastActive: new Date('2024/12/06'),
    tags: ['Boston', 'Massachusetts', 'BRD'],

    loc: { lat: 41.792555356161515, lng: 71.32031083049861 },
  },
  {
    name: 'Western Mass Roller Derby',
    country: 'United States',
    state: 'Massachusetts',
    city: 'Wilbraham',
    leagues: ['WFTDA'],
    website: 'https://massattackrollerderby.com',
    lastActive: new Date('2024/12/06'),
    tags: ['Boston', 'Massachusetts', 'BRD'],

    loc: { lat: 42.1501189448326, lng: -72.47045034278078 },
  },
  {
    name: 'Pioneer Valley Roller Derby',
    country: 'United States',
    state: 'Massachusetts',
    city: 'Greenfield',
    leagues: [],
    website: 'https://pioneervalleyrollerderby.com',
    lastActive: new Date('2024/12/06'),
    tags: ['Boston', 'Massachusetts', 'BRD'],

    loc: { lat: 42.587356544544626, lng: -72.59760698911586 },
  },
]
