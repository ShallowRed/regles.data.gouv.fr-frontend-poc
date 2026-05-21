<script lang="ts" setup>
/**
 * Conteneur de section avec fond de marque, repris d'aides-simplifiees.
 * Mesure sa propre hauteur (ResizeObserver natif) pour dimensionner la texture
 * de vagues. Le store de thème d'origine est remplacé par un thème clair fixe
 * (dark mode mis de côté pour l'instant).
 *
 * Deux façons de l'utiliser :
 * - via la prop `variant` (recommandé) : 'default' | 'soft' | 'colored' | 'subtle' | 'contrast'
 * - via les props bas niveau (`contrast`, `subtle`, `textured`, `blue`) pour un réglage fin.
 */

type Variant = 'default' | 'soft' | 'colored' | 'subtle' | 'contrast'

const props = withDefaults(defineProps<{
  /** Préréglage de fond. Prioritaire sur les props bas niveau si fourni. */
  variant?: Variant
  contrast?: boolean
  subtle?: boolean
  textured?: boolean
  blue?: boolean
}>(), {
  variant: undefined,
  contrast: false,
  subtle: false,
  textured: false,
  blue: false,
})

/**
 * Résolution d'un préréglage vers les flags bas niveau.
 * - default  : fond gris neutre, sans texture
 * - soft     : fond bleu très clair + texture atténuée (quasi blanc coloré)
 * - colored  : fond bleu clair + texture pleine (bien colorée)
 * - subtle   : fond blanc + texture très discrète
 * - contrast : fond bleu France soutenu + vagues claires (section sombre)
 */
const resolved = computed(() => {
  switch (props.variant) {
    case 'default':
      return { contrast: false, subtle: false, textured: false, blue: false }
    case 'soft':
      return { contrast: false, subtle: true, textured: true, blue: true }
    case 'colored':
      return { contrast: false, subtle: false, textured: true, blue: true }
    case 'subtle':
      return { contrast: false, subtle: true, textured: true, blue: false }
    case 'contrast':
      return { contrast: true, subtle: false, textured: true, blue: false }
    default:
      return { contrast: props.contrast, subtle: props.subtle, textured: props.textured, blue: props.blue }
  }
})

const mixBlendMode = computed(() => (resolved.value.contrast ? 'lighten' : 'darken'))
const opacity = computed(() => (resolved.value.subtle ? 0.25 : 0.8))

const backgroundColorClass = computed(() => {
  if (resolved.value.contrast) {
    return 'fr-background-action-high--blue-france'
  }
  else if (resolved.value.blue) {
    return 'fr-background-alt--blue-france'
  }
  return 'fr-background-default--grey'
})

/** Couleur de texte forcée en blanc sur les fonds contrastés sombres. */
const isContrast = computed(() => resolved.value.contrast)

/* Mesure de hauteur via ResizeObserver natif (remplace useElementSize). */
const bgContainer = ref<HTMLElement | null>(null)
const containerHeight = ref(0)
let observer: ResizeObserver | null = null

onMounted(() => {
  if (!bgContainer.value || typeof ResizeObserver === 'undefined')
    return
  observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      containerHeight.value = entry.contentRect.height
    }
  })
  observer.observe(bgContainer.value)
  containerHeight.value = bgContainer.value.offsetHeight
})

watch(() => resolved.value.textured, (textured) => {
  if (textured && bgContainer.value && observer) {
    observer.observe(bgContainer.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div
    class="container-with-bg"
    :class="[backgroundColorClass, { 'container-with-bg--contrast': isContrast }]"
  >
    <div
      v-if="resolved.textured"
      ref="bgContainer"
      class="container-with-bg__bg"
      :style="{ opacity, mixBlendMode }"
    >
      <BrandBackgroundTexture
        :contrast="resolved.contrast"
        theme="light"
        :container-height="containerHeight"
      />
    </div>
    <div class="container-with-bg__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.container-with-bg {
  position: relative;
  width: 100%;
}

.container-with-bg__bg {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
}

.container-with-bg__content {
  position: relative;
  z-index: 1;
}

/* Sur fond contrasté sombre, le texte par défaut passe en clair. */
.container-with-bg--contrast {
  color: #fff;
}
</style>
