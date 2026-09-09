<script lang="ts" setup>
const props = defineProps<{
  /** `to` : chemin non préfixé par la locale, ou `null` pour la page courante. */
  items: { to: string | null, label: string }[]
}>()

const localePath = useLocalePath()

const lastItem = computed<{ to: string | null, label: string }>(() => props.items[props.items.length - 1] as { to: string | null, label: string })
const ancestors = computed(() => props.items.slice(0, -1))
</script>

<template>
  <nav
    role="navigation"
    class="fr-breadcrumb"
    :aria-label="$t('breadcrumb.ariaLabel')"
  >
    <button
      class="fr-breadcrumb__button"
      aria-expanded="false"
      aria-controls="breadcrumb-1"
    >
      {{ $t('breadcrumb.toggle') }}
    </button>
    <div
      id="breadcrumb-1"
      class="fr-collapse"
    >
      <ol class="fr-breadcrumb__list">
        <li
          v-for="item in ancestors"
          :key="(item as { to: string; label: string }).to"
        >
          <NuxtLink
            class="fr-breadcrumb__link"
            :to="item.to ? localePath(item.to) : undefined"
            :aria-current="item.to === null ? 'page' : undefined"
          >
            {{ item.label }}
          </NuxtLink>
        </li>
        <li>
          <span
            class="fr-breadcrumb__link"
            aria-current="page"
          >
            {{ lastItem.label }}
          </span>
        </li>
      </ol>
    </div>
  </nav>
</template>
