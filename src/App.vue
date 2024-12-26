<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
// import { useDisplay } from 'vuetify'

const router = useRouter()
const route = useRoute()
const drawerIsOpen = ref(false)
const userStore = useUserStore()
// const { smAndUp } = useDisplay()

watch(() => userStore.user, newVal => {

  if (!newVal) {
    if (router.currentRoute.value.fullPath === '/')
      window.location.reload()
    else router.push({ path: '/' })
  }
})
</script>

<template>
  <v-app class="ma-0 pa-0">
    <v-app-bar v-if="route.path !== '/linktree' && route.path !== '/linktree/'" color="primary" class="px-2"
      :scroll-behavior="route.path === '/' || route.path.includes('join') ? 'fade-image inverted' : 'inverted'
        " :image="route.path.includes('join')
          ? '/promoImg/bootcamp.jpeg'
          : `/Bubbs_action_bw_cropped_banner.png`
          ">
      <template v-slot:prepend>
        <v-app-bar-nav-icon>
          <v-btn icon="mdi-menu" color="primary" variant="flat" class="rounded-lg"
            @click.stop="drawerIsOpen = !drawerIsOpen"></v-btn>
        </v-app-bar-nav-icon>
      </template>

      <template v-slot:append>
        <v-menu v-if="userStore.user">
          <template v-slot:activator="{ props }">
            <v-btn color="secondary" v-bind="props" variant="flat" icon="mdi-account">
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="userStore.signout()">
              <v-list-item-title>
                Sign Out <v-icon>mdi-door</v-icon>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <img v-else alt="BSB logo" class="logo" src="@/assets/logo.svg" width="60" height="60"
          @click="router.push({ path: '/' })" />
      </template>
    </v-app-bar>
    <v-navigation-drawer color="purple-lighten-2" location="start" name="drawer" v-model="drawerIsOpen" temporary>
      <v-list-item title="Derby Phone Book" class="font-style-bold mt-2" temporary></v-list-item>
      <v-divider color="white" thickness="1" class="border-opacity-75" />
      <v-list-item link title="Map" prepend-icon="mdi-map" to="/"></v-list-item>
      <v-list-item link title="Events" prepend-icon="mdi-calendar" to="/events"></v-list-item>
      <v-list-item link title="Leagues" prepend-icon="mdi-format-list-text" to="/leagues"></v-list-item>
      <v-list-item link title="Donate/About" prepend-icon="mdi-heart" to="/about"></v-list-item>
      <v-divider color="white" thickness="1" class="border-opacity-75 mx-4" />
      <v-list-item v-if="!userStore.user" link title="Sign In" prepend-icon="mdi-account" to="/signin"></v-list-item>
      <v-list-item v-if="userStore.user" link title="Manage" prepend-icon="mdi-pencil" to="/manage"
        color="secondary"></v-list-item>
    </v-navigation-drawer>
    <v-main>
      <div class="d-flex flex-column flex-grow" style="height: 100%">
        <RouterView />
        <v-sheet color="black" style="height: 100%"></v-sheet>
      </div>
    </v-main>
    <v-footer v-if="route.path !== '/linktree' && route.path !== '/linktree/'" :app="false" color="grey-darken-2"
      class="d-flex flex-column py-0" style="max-height: 230px">
      <div class="d-flex align-center">
        <v-spacer />
        <span>Connect with us!</span>
        <!-- <v-btn icon="mdi-facebook" target="_blank" variant="text" rounded="0"
          href="https://www.facebook.com/baystatebrawlers"></v-btn>
        <v-btn icon="mdi-instagram" variant="text" target="_blank" rounded="0"
          href="https://www.instagram.com/baystatebrawlers"></v-btn> -->
        <v-btn icon="mdi-email" variant="text" rounded="0" to="/contact"></v-btn>
        <v-spacer />
      </div>
      <div class="d-flex align-center pb-2 px-4">
        <v-spacer />
        <div style="text-align: center">
          Copyright © {{ new Date().getFullYear() }} Bay State Brawlers Roller Derby - All Rights
          Reserved.<br />Website by Hexadecimate #255
        </div>
        <v-spacer />
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
/* header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
