import { mergeLists } from '@/services/utils.service'
import type { LeagueRecord } from './league.model'
import type { RulesetName } from './maps.model'
import StrCompare from 'string-comparison'

export type LeagueMergePatternItem = 'base' | 'incoming' | 'merge' | 'none'
export type MergeStrategy = 'stringSimilarityUSA_WFTDA'

export class MultipleLeagueMergeManager {
  defaultMergePattern: LeagueMergePattern
  baseLeaguesDict: { [baseLanguageName: string]: LeagueRecord }
  incomingLeaguesDict: { [incomingLanguageName: string]: LeagueRecord }

  baseDatasetName: string
  incomingDatasetName: string
  initialMergeStrategy?: MergeStrategy

  singleLeagueMergeManagerDict: { [baseLeagueName: string]: SingleLeagueMergeManager }

  mergeInstructionsDict: { [baseLeagueName: string]: SingleLeagueMergeData }
  mergeInstructionsByIncomingLeaguesDict: { [incomingLeagueName: string]: SingleLeagueMergeData }

  constructor(
    options: {
      baseDatasetName: string
      incomingDatasetName: string
      mergeStrategy?: MergeStrategy
    },
    baseLeagues: LeagueRecord[],
    incomingLeagues: LeagueRecord[],
    defaultMergePattern?: LeagueMergePattern,
    mergeInstructions?: SingleLeagueMergeData[],
  ) {
    this.baseDatasetName = options.baseDatasetName
    this.incomingDatasetName = options.incomingDatasetName
    this.defaultMergePattern = defaultMergePattern ?? {
      id: 'base',
      name: 'base',
      country: 'base',
      state: 'base',
      city: 'base',
      lat: 'base',
      lng: 'base',
      logo: 'base',
      rulesets: 'merge',
      website: 'incoming',
      wftdaWebsite: 'base',
      lastActive: 'merge',
      tags: 'merge',
    }
    this.baseLeaguesDict = {}
    this.incomingLeaguesDict = {}
    this.singleLeagueMergeManagerDict = {}
    this.mergeInstructionsDict = {}
    this.mergeInstructionsByIncomingLeaguesDict = {}

    for (const mergeInstruction of mergeInstructions ?? []) {
      this.mergeInstructionsDict[mergeInstruction.baseLeagueName] = mergeInstruction
      this.mergeInstructionsByIncomingLeaguesDict[mergeInstruction.incomingLeagueName] =
        mergeInstruction
    }

    // Set up incoming leagues
    for (const incomingLeague of incomingLeagues)
      this.incomingLeaguesDict[incomingLeague.name] = incomingLeague

    // Confirm uniqueness of incoming league names
    if (incomingLeagues.length !== Object.keys(this.incomingLeaguesDict).length) {
      const duplicates: string[] = []
      const incomingLeagueNames = incomingLeagues.map((l) => l.name)
      for (let i = 0; i < incomingLeagueNames.length; i++) {
        if (
          incomingLeagueNames.indexOf(incomingLeagueNames[i]) !==
          incomingLeagueNames.lastIndexOf(incomingLeagueNames[i])
        ) {
          duplicates.push(incomingLeagueNames[i])
        }
      }
      throw `Duplicate name found in incoming leagues (${this.incomingDatasetName}): ${JSON.stringify(duplicates)}`
    }

    // Set up base leagues
    for (const baseLeague of baseLeagues) {
      this.baseLeaguesDict[baseLeague.name] = baseLeague
      const mergeData: SingleLeagueMergeData | undefined =
        this.mergeInstructionsDict[baseLeague.name]

      // Pre-populate any leagues for which we already have existing merge data
      if (mergeData?.incomingLeagueName)
        this.singleLeagueMergeManagerDict[baseLeague.name] = new SingleLeagueMergeManager(
          this,
          baseLeague,
          this.incomingLeaguesDict[mergeData.incomingLeagueName],
          mergeData.mergeInstructions,
        )
      else
        this.singleLeagueMergeManagerDict[baseLeague.name] = new SingleLeagueMergeManager(
          this,
          baseLeague,
        )
    }
    // Confirm uniqueness of base league names
    if (baseLeagues.length !== Object.keys(this.baseLeaguesDict).length) {
      const duplicates: string[] = []
      const baseLeagueNames = baseLeagues.map((l) => l.name)
      for (let i = 0; i < baseLeagueNames.length; i++) {
        if (
          baseLeagueNames.indexOf(baseLeagueNames[i]) !==
          baseLeagueNames.lastIndexOf(baseLeagueNames[i])
        ) {
          duplicates.push(baseLeagueNames[i])
        }
      }
      throw `Duplicate name found in base leagues (${this.baseDatasetName}): ${JSON.stringify(duplicates)}`
    }

    this.initialMergeStrategy = options?.mergeStrategy
    if (options.mergeStrategy) this.applyMergeStrategy(options.mergeStrategy)
  }

  getIncomingLeagueNames(): string[] {
    return Object.keys(this.incomingLeaguesDict)
  }

  incorporateMergeData(mergeData: SingleLeagueMergeData) {
    if (!mergeData) throw `Received invalid merge data`
    this.removeMergeData(this.mergeInstructionsDict[mergeData.baseLeagueName])
    this.removeMergeData(this.mergeInstructionsDict[mergeData.incomingLeagueName])

    this.mergeInstructionsDict[mergeData.baseLeagueName] = mergeData
    this.mergeInstructionsByIncomingLeaguesDict[mergeData.incomingLeagueName] = mergeData
  }

  removeMergeData(mergeData?: SingleLeagueMergeData) {
    if (!mergeData) return
    delete this.mergeInstructionsDict[mergeData.baseLeagueName]
    delete this.mergeInstructionsByIncomingLeaguesDict[mergeData.incomingLeagueName]
  }

  applyMergeStrategy(strategy: MergeStrategy) {
    if (strategy === 'stringSimilarityUSA_WFTDA') {
      for (const baseLeague of Object.values(this.baseLeaguesDict)) {
        if (!this.singleLeagueMergeManagerDict[baseLeague.name].baseIsMergeCandidate()) continue

        const matchCandidates = StrCompare.diceCoefficient.sortMatch(
          baseLeague.name,
          this.getIncomingLeagueNames(),
        )
        console.log(`${baseLeague.name} => ${matchCandidates[matchCandidates.length - 1].member}`)
        this.singleLeagueMergeManagerDict[baseLeague.name].mergeBaseWith(
          this.incomingLeaguesDict[matchCandidates[matchCandidates.length - 1].member],
        )
      }
    }
  }

  getFinalizedMergeData(): MultipleLeagueMergeData {
    return {
      baseLeagues: Object.values(this.baseLeaguesDict),
      incomingLeagues: Object.values(this.incomingLeaguesDict),
      defaultMergePattern: this.defaultMergePattern,
      mergeInstructions: Object.values(this.mergeInstructionsDict),
      mergeResult: Object.values(this.singleLeagueMergeManagerDict).map((m) => m.getMergedLeague()),
    }
  }
}

export class SingleLeagueMergeManager {
  manager: MultipleLeagueMergeManager
  base: LeagueRecord
  incoming?: LeagueRecord
  mergePatternDefault: LeagueMergePattern
  mergePatternOverrides?: LeagueMergePattern

  constructor(
    manager: MultipleLeagueMergeManager,
    baseLeague: LeagueRecord,
    incomingLeague?: LeagueRecord,
    mergePatternOverride?: LeagueMergePattern,
  ) {
    this.manager = manager
    this.base = baseLeague
    this.incoming = incomingLeague
    this.mergePatternDefault = this.manager.defaultMergePattern
    this.mergePatternOverrides = mergePatternOverride
  }

  mergeBaseWith(incoming?: LeagueRecord) {
    if (incoming) {
      this.manager.removeMergeData(this.getMergeData()) // Redundancy
      this.incoming = incoming
      this.manager.incorporateMergeData(this.getMergeData()!)
    } else {
      this.abortMerge()
    }
  }

  abortMerge() {
    this.manager.removeMergeData(this.getMergeData())
    delete this.incoming
    delete this.mergePatternOverrides
  }

  getMergeData(): SingleLeagueMergeData | undefined {
    if (!this.incoming) return undefined
    return {
      baseLeagueName: this.base.name,
      incomingLeagueName: this.incoming.name,
      mergeInstructions: this.mergePatternOverrides,
    }
  }

  setPatternItem(
    attribute:
      | 'id'
      | 'name'
      | 'country'
      | 'state'
      | 'city'
      | 'lat'
      | 'lng'
      | 'logo'
      | 'rulesets'
      | 'website'
      | 'wftdaWebsite'
      | 'lastActive'
      | 'tags',
    pattern: LeagueMergePatternItem,
  ) {
    if (!this.mergePatternOverrides) this.mergePatternOverrides = {}
    this.mergePatternOverrides[attribute] = pattern
    if (pattern === this.mergePatternDefault[attribute])
      delete this.mergePatternOverrides[attribute]
    if (!Object.keys(this.mergePatternOverrides)) delete this.mergePatternOverrides
  }

  setMergePatternOverrides(pattern: LeagueMergePattern) {
    this.mergePatternOverrides = pattern
  }

  getPatternItem(
    key:
      | 'id'
      | 'name'
      | 'country'
      | 'state'
      | 'city'
      | 'lat'
      | 'lng'
      | 'logo'
      | 'rulesets'
      | 'website'
      | 'wftdaWebsite'
      | 'lastActive'
      | 'tags',
  ): LeagueMergePatternItem | undefined {
    return this.mergePatternOverrides?.[key] ?? this.mergePatternDefault[key]
  }

  getMergedLeague(): LeagueRecord {
    let id = undefined
    if (this.getPatternItem('id') === 'base') id = this.base.id
    if (this.getPatternItem('id') === 'incoming') id = this.incoming?.id

    let name: string | undefined = undefined
    if (this.getPatternItem('name') === 'base') name = this.base.name
    else if (this.getPatternItem('name') === 'incoming') name = this.incoming?.name

    let country: string | undefined = undefined
    if (this.getPatternItem('country') === 'base') country = this.base.country
    else if (this.getPatternItem('country') === 'incoming') country = this.incoming?.country

    let state: string | undefined = undefined
    if (this.getPatternItem('state') === 'base') state = this.base.state
    else if (this.getPatternItem('state') === 'incoming') state = this.incoming?.state

    let city: string | undefined = undefined
    if (this.getPatternItem('city') === 'base') city = this.base.city
    else if (this.getPatternItem('city') === 'incoming') city = this.incoming?.city

    let lat: number | undefined = undefined
    if (this.getPatternItem('lat') === 'base') lat = this.base.lat
    else if (this.getPatternItem('lat') === 'incoming') lat = this.incoming?.lat

    let lng: number | undefined = undefined
    if (this.getPatternItem('lng') === 'base') lng = this.base.lng
    else if (this.getPatternItem('lng') === 'incoming') lng = this.incoming?.lng

    let logo: string | undefined = undefined
    if (this.getPatternItem('logo') === 'base') logo = this.base.logo
    else if (this.getPatternItem('logo') === 'incoming') logo = this.incoming?.logo

    let rulesets: RulesetName[] = []
    if (this.getPatternItem('rulesets') === 'base') rulesets = this.base.rulesets
    else if (this.getPatternItem('rulesets') === 'incoming')
      rulesets = this.incoming?.rulesets ?? this.base.rulesets
    else if (this.getPatternItem('rulesets') === 'merge')
      rulesets = mergeLists(this.base.rulesets, this.incoming?.rulesets) as RulesetName[]

    let website: string | undefined = undefined
    if (this.getPatternItem('website') === 'base') website = this.base.website
    else if (this.getPatternItem('website') === 'incoming') website = this.incoming?.website

    let wftdaWebsite: string | undefined = undefined
    if (this.getPatternItem('wftdaWebsite') === 'base') wftdaWebsite = this.base.wftdaWebsite
    else if (this.getPatternItem('wftdaWebsite') === 'incoming')
      wftdaWebsite = this.incoming?.wftdaWebsite

    let lastActive: Date | undefined = undefined
    if (this.getPatternItem('lastActive') === 'base') lastActive = this.base.lastActive
    else if (this.getPatternItem('lastActive') === 'incoming')
      lastActive = this.incoming?.lastActive
    else if (this.getPatternItem('lastActive') === 'merge') {
      lastActive =
        (this.base.lastActive?.getTime() ?? 0) > (this.incoming?.lastActive?.getTime() ?? 0)
          ? this.base.lastActive
          : this.incoming?.lastActive
    }

    let tags: string[] = []
    if (this.getPatternItem('tags') === 'base') tags = this.base.tags ?? []
    else if (this.getPatternItem('tags') === 'incoming') tags = this.incoming?.tags ?? []
    else if (this.mergePatternOverrides?.tags ?? this.getPatternItem('tags') === 'merge')
      tags = mergeLists(this.base.tags, this.incoming?.tags)

    const mergedLeagueRecord: LeagueRecord = {
      id,
      name: name ?? this.base.name,

      country: country ?? this.base.country,
      state,
      city: city ?? this.base.city,

      lat: lat ?? this.base.lat,
      lng: lng ?? this.base.lng,

      logo,
      rulesets: rulesets ?? this.base.rulesets,
      website,
      wftdaWebsite,
      lastActive,
      tags,
    }

    if (!mergedLeagueRecord.id) delete mergedLeagueRecord.id
    if (!mergedLeagueRecord.state) delete mergedLeagueRecord.state
    if (!mergedLeagueRecord.logo) delete mergedLeagueRecord.logo
    if (!mergedLeagueRecord.website) delete mergedLeagueRecord.website
    if (!mergedLeagueRecord.wftdaWebsite) delete mergedLeagueRecord.wftdaWebsite
    if (!mergedLeagueRecord.lastActive) delete mergedLeagueRecord.lastActive
    if (!mergedLeagueRecord.tags?.length) delete mergedLeagueRecord.tags

    return mergedLeagueRecord
  }

  baseIsMergeCandidate(): boolean {
    if (this.manager.initialMergeStrategy === 'stringSimilarityUSA_WFTDA')
      return this.base.country === 'United States' && !!this.base.wftdaWebsite

    return true
  }
}

export interface MultipleLeagueMergeData {
  baseLeagues: LeagueRecord[]
  incomingLeagues: LeagueRecord[]
  defaultMergePattern?: LeagueMergePattern
  mergeInstructions?: SingleLeagueMergeData[]
  mergeResult: LeagueRecord[]
}

export interface SingleLeagueMergeData {
  baseLeagueName: string
  incomingLeagueName: string
  mergeInstructions?: LeagueMergePattern
}

export interface LeagueMergePattern {
  id?: LeagueMergePatternItem
  name?: LeagueMergePatternItem

  country?: LeagueMergePatternItem
  state?: LeagueMergePatternItem
  city?: LeagueMergePatternItem

  lat?: LeagueMergePatternItem
  lng?: LeagueMergePatternItem

  logo?: LeagueMergePatternItem
  rulesets?: LeagueMergePatternItem
  website?: LeagueMergePatternItem
  wftdaWebsite?: LeagueMergePatternItem
  lastActive?: LeagueMergePatternItem
  tags?: LeagueMergePatternItem
}
