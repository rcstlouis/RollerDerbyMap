import { Loader } from '@googlemaps/js-api-loader'

let loader = undefined as undefined | Loader

export function initMapLoader() {
  if (!loader)
    loader = new Loader({
      apiKey: import.meta.env.VITE_APP_GOOGLE_API_KEY,
      version: 'weekly',
    })
}

export async function getMap(elt: HTMLElement, id: string) {
  initMapLoader()
  await loader!.load()
  const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary
  return new Map(elt, {
    center: { lat: 42.595102, lng: -71.785016 },
    zoom: 8,
    mapId: id,
  })
}
