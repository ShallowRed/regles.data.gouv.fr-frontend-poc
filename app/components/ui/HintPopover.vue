<script setup lang="ts">
/**
 * Hint contextuel sans sortie de flux : un déclencheur (par défaut un « ? »)
 * ouvre au survol ou au clic un panneau court, avec lien d'approfondissement
 * optionnel. Le slot par défaut remplace le déclencheur (ex. un tag).
 */
withDefaults(defineProps<{
  /** Texte du hint. */
  text: string
  /** Libellé accessible du déclencheur. */
  label?: string
  /** Lien d'approfondissement affiché sous le texte. */
  moreTo?: string
  moreLabel?: string
  /** Ancrage horizontal du panneau par rapport au déclencheur. */
  align?: 'left' | 'right'
}>(), {
  label: 'Plus d’information',
  moreTo: undefined,
  moreLabel: 'En savoir plus',
  align: 'left',
})

/** Ouverture volatile (survol) et épinglée (clic), cumulées : le clic maintient le panneau. */
const hover = ref(false)
const pinned = ref(false)
const open = computed(() => hover.value || pinned.value)
const root = ref<HTMLElement | null>(null)

function onDocumentClick(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node))
    pinned.value = false
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    pinned.value = false
    hover.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <span
    ref="root"
    class="relative inline-flex"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <button
      type="button"
      class="inline-flex bg-none border-0 p-0 m-0 cursor-pointer"
      :aria-expanded="open"
      @click="pinned = !pinned"
    >
      <slot>
        <span
          class="inline-flex items-center justify-center h-[18px] w-[18px] rounded-full border border-gray-400 text-gray-500 text-[11px] font-bold leading-none hover:border-[#000091] hover:text-[#000091]"
          aria-hidden="true"
        >?</span>
      </slot>
      <span class="sr-only">{{ label }}</span>
    </button>
    <span
      v-if="open"
      role="tooltip"
      class="absolute top-full z-20 pt-2 w-72"
      :class="align === 'right' ? 'right-0' : 'left-0'"
    >
      <span class="block rounded border border-gray-200 bg-white shadow-lg p-3 text-left">
        <span class="block fr-text--xs mb-0 text-gray-700 font-normal normal-case tracking-normal whitespace-normal">{{ text }}</span>
        <NuxtLink
          v-if="moreTo"
          :to="moreTo"
          class="fr-link fr-text--xs inline-block mt-2"
        >
          {{ moreLabel }}
        </NuxtLink>
      </span>
    </span>
  </span>
</template>
