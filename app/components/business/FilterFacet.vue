<script setup lang="ts">
/**
 * Une facette de filtrage : liste d'options sélectionnables avec décompte.
 * Sélection mono-valeur (clic = bascule). Style inspiré des facettes data.gouv.fr.
 */
interface FacetOption {
  value: string
  label: string
  count: number
  /** Icône DSFR optionnelle à gauche du libellé. */
  icon?: string
  /** Infobulle explicative. */
  hint?: string
}

const props = withDefaults(defineProps<{
  legend: string
  help?: string
  options: FacetOption[]
  selected: string | null
  /** Replie la liste au-delà de ce nombre d'options. */
  maxVisible?: number
  /** Replie la section entière par défaut. */
  collapsedByDefault?: boolean
}>(), {
  help: undefined,
  maxVisible: 0,
  collapsedByDefault: false,
})

const emit = defineEmits<{ toggle: [value: string] }>()

const expanded = ref(false)

/** Pli/dépli de la section entière. */
const open = ref(!props.collapsedByDefault)

const activeLabel = computed(() => {
  if (open.value || !props.selected)
    return null
  return props.options.find(o => o.value === props.selected)?.label ?? null
})

const visibleOptions = computed(() => {
  if (!props.maxVisible || expanded.value)
    return props.options
  // On garde l'option sélectionnée visible même si elle est au-delà du seuil.
  const head = props.options.slice(0, props.maxVisible)
  if (props.selected && !head.some(o => o.value === props.selected)) {
    const sel = props.options.find(o => o.value === props.selected)
    if (sel)
      return [...head, sel]
  }
  return head
})

const hiddenCount = computed(() =>
  props.maxVisible ? Math.max(0, props.options.length - visibleOptions.value.length) : 0,
)
</script>

<template>
  <fieldset class="m-0 p-0 border-0 min-w-0">
    <!-- En-tête repliable de la section -->
    <button
      type="button"
      class="facet-legend w-full flex items-center justify-between gap-2 text-left py-1 fr-text--sm font-bold text-gray-900"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="flex items-center gap-1.5 min-w-0">
        {{ legend }}
        <span
          v-if="activeLabel"
          class="fr-badge fr-badge--sm fr-badge--blue-cumulus shrink-0 normal-case"
        >{{ activeLabel }}</span>
      </span>
      <span
        class="fr-icon-arrow-down-s-line fr-icon--sm shrink-0 transition-transform"
        :class="{ '-rotate-180': open }"
        aria-hidden="true"
      />
    </button>

    <div
      v-show="open"
      class="mt-1"
    >
      <p
        v-if="help"
        class="fr-text--xs text-gray-600 m-0 mb-2"
      >
        {{ help }}
      </p>

      <ul class="list-none p-0 m-0 space-y-0.5">
        <li
          v-for="opt in visibleOptions"
          :key="opt.value"
        >
          <button
            type="button"
            class="facet-option group w-full flex items-center justify-between gap-2 text-left px-2 py-1.5 rounded transition-colors fr-text--sm"
            :class="selected === opt.value
              ? 'bg-[#e3e3fd] text-[#000091] font-medium'
              : 'hover:bg-gray-100 text-gray-800'"
            :disabled="opt.count === 0 && selected !== opt.value"
            :aria-pressed="selected === opt.value"
            :title="opt.hint"
            @click="emit('toggle', opt.value)"
          >
            <span class="inline-flex items-center gap-2 min-w-0">
              <span
                v-if="opt.icon"
                :class="opt.icon"
                class="fr-icon--sm shrink-0"
                aria-hidden="true"
              />
              <span
                class="truncate"
                :class="{ 'text-gray-400': opt.count === 0 && selected !== opt.value }"
              >{{ opt.label }}</span>
            </span>
            <span
              class="shrink-0 fr-text--xs tabular-nums leading-none px-1.5 py-1 rounded min-w-[1.75rem] text-center"
              :class="selected === opt.value ? 'bg-white text-[#000091]' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'"
            >
              {{ opt.count }}
            </span>
          </button>
        </li>
      </ul>

      <button
        v-if="hiddenCount > 0"
        type="button"
        class="fr-link fr-link--sm mt-1 ml-2"
        @click="expanded = true"
      >
        Voir {{ hiddenCount }} de plus
      </button>
      <button
        v-else-if="maxVisible && expanded && options.length > maxVisible"
        type="button"
        class="fr-link fr-link--sm mt-1 ml-2"
        @click="expanded = false"
      >
        Voir moins
      </button>
    </div>
  </fieldset>
</template>

<style scoped>
/* Les classes typographiques DSFR (fr-text--sm/xs) ajoutent un margin vertical
   (var(--text-spacing)) qui gonfle les lignes. On le neutralise pour des
   facettes denses, et on cale le bouton sans min-height par défaut. */
.facet-option {
  min-height: 0;
  line-height: 1.4;
}
.facet-legend,
.facet-option,
.facet-legend :deep([class*='fr-text--']),
.facet-option :deep([class*='fr-text--']) {
  margin: 0;
}
.facet-legend {
  min-height: 0;
  line-height: 1.4;
}
</style>
