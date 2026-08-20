<script setup lang="ts">
import type { LeagueRecord } from '@/model/league.model'
import { SingleLeagueMergeManager, type LeagueMergePatternItem } from '@/model/merge.model'
import { onMounted, ref, type PropType } from 'vue'

const props = defineProps({
  leagueMergeManager: Object as PropType<SingleLeagueMergeManager>,
})

const mergeTargetName = ref<string | undefined>(undefined)
const mergedLeague = ref<LeagueRecord | undefined>(undefined)

const COLOR_DICT = {
  isOverridingValue: 'success',
  isHalfOfMergeTarget: 'info',
  isDiscarded: 'grey-darken-1',
}

onMounted(() => {
  mergeTargetName.value = props.leagueMergeManager?.incoming?.name
  mergedLeague.value = props.leagueMergeManager?.getMergedLeague()
})

function setMergeTarget(targetLeagueName?: string) {
  if (targetLeagueName)
    props.leagueMergeManager?.mergeBaseWith(
      props.leagueMergeManager.manager.incomingLeaguesDict[targetLeagueName],
    )
  else props.leagueMergeManager?.abortMerge()
  mergedLeague.value = props.leagueMergeManager?.getMergedLeague()
}

function setPatternItem(
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
  props.leagueMergeManager?.setPatternItem(attribute, pattern)
  mergedLeague.value = props.leagueMergeManager?.getMergedLeague()
}

function getColor(
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
  target: 'base' | 'incoming',
): string {
  if (props.leagueMergeManager?.getPatternItem(key) === 'merge')
    return COLOR_DICT.isHalfOfMergeTarget
  if (props.leagueMergeManager?.getPatternItem(key) === target) return COLOR_DICT.isOverridingValue
  return COLOR_DICT.isDiscarded
}
</script>

<template>
  <v-card color="grey-darken-4" style="padding: 8px">
    <div class="d-flex">
      <v-autocomplete
        v-model="mergeTargetName"
        label="Merge Target"
        :items="leagueMergeManager?.manager.getIncomingLeagueNames()"
        variant="outlined"
        @update:model-value="(value) => setMergeTarget(value)"
      ></v-autocomplete>
      <v-btn
        icon="mdi-delete"
        style="margin-left: 8px"
        color="error"
        @click.stop="() => setMergeTarget()"
      ></v-btn>
    </div>
    <v-container>
      <v-row gap="8">
        <v-col cols="12" sm="4">
          <v-card color="grey-darken-1" style="padding: 8px">
            <v-sheet :color="getColor('name', 'base')" style="margin-bottom: 4px">
              <h3 v-html="leagueMergeManager?.base.name"></h3>
            </v-sheet>

            <v-sheet :color="getColor('city', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('city', 'base')"> ✓ </v-chip>
              City: {{ leagueMergeManager?.base.city }}
            </v-sheet>
            <v-sheet :color="getColor('state', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('state', 'base')"> ✓ </v-chip>
              State: {{ leagueMergeManager?.base.state }}
            </v-sheet>
            <v-sheet :color="getColor('country', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('country', 'base')"> ✓ </v-chip>
              Country: {{ leagueMergeManager?.base.country }}
            </v-sheet>
            <v-sheet :color="getColor('lat', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('lat', 'base')"> ✓ </v-chip>
              Lat: {{ leagueMergeManager?.base.lat }}
            </v-sheet>
            <v-sheet :color="getColor('lng', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('lng', 'base')"> ✓ </v-chip>
              Lng: {{ leagueMergeManager?.base.lng }}
            </v-sheet>
            <div style="margin-bottom: 4px"></div>

            <v-sheet :color="getColor('logo', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('logo', 'base')"> ✓ </v-chip>
              Logo: {{ leagueMergeManager?.base.logo }}
            </v-sheet>
            <v-sheet :color="getColor('rulesets', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('rulesets', 'base')"> ✓ </v-chip>
              Rulesets: {{ leagueMergeManager?.base.rulesets }}
            </v-sheet>
            <v-sheet :color="getColor('website', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('website', 'base')"> ✓ </v-chip>
              Website: {{ leagueMergeManager?.base.website }}
            </v-sheet>
            <v-sheet :color="getColor('wftdaWebsite', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('wftdaWebsite', 'base')"> ✓ </v-chip>
              WFTDA Website: {{ leagueMergeManager?.base.wftdaWebsite }}
            </v-sheet>
            <v-sheet :color="getColor('lastActive', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('lastActive', 'base')"> ✓ </v-chip>
              Last Active: {{ leagueMergeManager?.base.lastActive }}
            </v-sheet>
            <v-sheet :color="getColor('tags', 'base')" class="d-flex">
              <v-chip @click="() => setPatternItem('tags', 'base')"> ✓ </v-chip>
              Tags: {{ leagueMergeManager?.base.tags }}
            </v-sheet>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4">
          <v-card v-if="leagueMergeManager?.incoming" color="grey-darken-1" style="padding: 8px">
            <v-sheet
              :color="getColor('name', 'incoming')"
              style="margin-bottom: 4px"
              class="d-flex"
            >
              <v-chip @click="() => setPatternItem('name', 'incoming')"> ✓ </v-chip>
              <h3 v-html="leagueMergeManager?.incoming.name"></h3>
            </v-sheet>

            <v-sheet :color="getColor('city', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('city', 'incoming')"> ✓ </v-chip>
              <p>City: {{ leagueMergeManager?.incoming.city }}</p>
            </v-sheet>
            <v-sheet :color="getColor('state', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('state', 'incoming')"> ✓ </v-chip>
              <p>State: {{ leagueMergeManager?.incoming.state }}</p>
            </v-sheet>
            <v-sheet :color="getColor('country', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('country', 'incoming')"> ✓ </v-chip>
              <p>Country: {{ leagueMergeManager?.incoming.country }}</p>
            </v-sheet>
            <v-sheet :color="getColor('lat', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('lat', 'incoming')"> ✓ </v-chip>
              <p>Lat: {{ leagueMergeManager?.incoming.lat }}</p>
            </v-sheet>
            <v-sheet :color="getColor('lng', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('lng', 'incoming')"> ✓ </v-chip>
              <p>Lng: {{ leagueMergeManager?.incoming.lng }}</p>
            </v-sheet>
            <div style="margin-bottom: 4px"></div>

            <v-sheet :color="getColor('logo', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('logo', 'incoming')"> ✓ </v-chip>
              <p>Logo: {{ leagueMergeManager?.incoming.logo }}</p>
            </v-sheet>
            <v-sheet :color="getColor('rulesets', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('rulesets', 'incoming')"> ✓ </v-chip>
              <p>Rulesets: {{ leagueMergeManager?.incoming.rulesets }}</p>
            </v-sheet>
            <v-sheet :color="getColor('website', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('website', 'incoming')"> ✓ </v-chip>
              <p>Website: {{ leagueMergeManager?.incoming.website }}</p>
            </v-sheet>
            <v-sheet :color="getColor('wftdaWebsite', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('wftdaWebsite', 'incoming')"> ✓ </v-chip>
              <p>WFTDA Website: {{ leagueMergeManager?.incoming.wftdaWebsite }}</p>
            </v-sheet>
            <v-sheet :color="getColor('lastActive', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('lastActive', 'incoming')"> ✓ </v-chip>
              <p>Last Active: {{ leagueMergeManager?.incoming.lastActive }}</p>
            </v-sheet>
            <v-sheet :color="getColor('tags', 'incoming')" class="d-flex">
              <v-chip @click="() => setPatternItem('tags', 'incoming')"> ✓ </v-chip>
              <p>Tags: {{ leagueMergeManager?.incoming.tags }}</p>
            </v-sheet>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4">
          <v-card v-if="leagueMergeManager?.incoming" color="grey-darken-1" style="padding: 8px">
            <v-sheet color="grey-darken-1" style="margin-bottom: 4px">
              <h3 v-html="mergedLeague?.name"></h3>
            </v-sheet>

            <v-sheet color="grey-darken-1">
              <p>City: {{ mergedLeague?.city }}</p>
            </v-sheet>
            <v-sheet color="grey-darken-1">
              <p>State: {{ mergedLeague?.state }}</p>
            </v-sheet>
            <v-sheet color="grey-darken-1">
              <p>Country: {{ mergedLeague?.country }}</p>
            </v-sheet>
            <v-sheet color="grey-darken-1">
              <p>Lat: {{ mergedLeague?.lat }}</p>
            </v-sheet>
            <v-sheet color="grey-darken-1">
              <p>Lng: {{ mergedLeague?.lng }}</p>
            </v-sheet>
            <div style="margin-bottom: 4px"></div>

            <v-sheet color="grey-darken-1">
              <p>Logo: {{ mergedLeague?.logo }}</p>
            </v-sheet>
            <v-sheet color="grey-darken-1">
              <p>Rulesets: {{ mergedLeague?.rulesets }}</p>
            </v-sheet>
            <v-sheet color="grey-darken-1">
              <p>Website: {{ mergedLeague?.website }}</p>
            </v-sheet>
            <v-sheet color="grey-darken-1">
              <p>WFTDA Website: {{ mergedLeague?.wftdaWebsite }}</p>
            </v-sheet>
            <v-sheet color="grey-darken-1">
              <p>Last Active: {{ mergedLeague?.lastActive }}</p>
            </v-sheet>
            <v-sheet color="grey-darken-1">
              <p>Tags: {{ mergedLeague?.tags }}</p>
            </v-sheet>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<style scoped>
p {
  text-align: left;
}
</style>
