<script lang="ts" setup>
const props = defineProps<{
  items: { to: string | null, label: string }[]
}>()

const lastItem = computed<{ to: string | null, label: string }>(() => props.items[props.items.length - 1] as { to: string | null, label: string })
const ancestors = computed(() => props.items.slice(0, -1))
</script>

<template>
  <nav
    role="navigation"
    class="fr-breadcrumb"
    aria-label="vous êtes ici :"
  >
    <button
      class="fr-breadcrumb__button"
      aria-expanded="false"
      aria-controls="breadcrumb-1"
    >
      Voir le fil d’Ariane
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
            :to="item.to ?? undefined"
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
