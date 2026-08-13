import Engine from 'publicodes'
import { parse } from 'yaml'

/**
 * Moteur Publicodes chargé avec les règles réelles du dépôt
 * betagouv/publicodes-entreprise-innovation, vendorées à un commit épinglé
 * (voir app/data/publicodes/entreprise-innovation/README.md).
 *
 * Le moteur est pur JavaScript : il tourne aussi bien côté serveur (SSR)
 * que dans le navigateur. L'instance est construite paresseusement au
 * premier appel, puis réutilisée (les évaluations sont synchrones).
 */

/** Provenance des règles chargées, affichée à côté de tout résultat calculé. */
export const publicodesRulesMeta = {
  repo: 'betagouv/publicodes-entreprise-innovation',
  repoUrl: 'https://github.com/betagouv/publicodes-entreprise-innovation',
  sha: 'fc8e9a8ac572b03d75504a2aba39d5633c0b25ea',
  shortSha: 'fc8e9a8',
} as const

/** Sources brutes des fichiers .publicodes vendorés (YAML, format du moteur). */
const ruleSources = import.meta.glob('../data/publicodes/entreprise-innovation/*.publicodes', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export interface PublicodesResult {
  value: string | number | boolean | null | undefined
  /**
   * Variables que le moteur signale comme non renseignées pour conclure
   * (sortie native `missingVariables`, noms dans l'espace du producteur).
   */
  missingVariables: string[]
}

let engineInstance: Engine | null = null

function getEngine(): Engine {
  if (!engineInstance) {
    const rules: Record<string, unknown> = {}
    for (const source of Object.values(ruleSources))
      Object.assign(rules, parse(source))
    engineInstance = new Engine(rules as ConstructorParameters<typeof Engine>[0], {
      logger: { log: () => {}, warn: () => {}, error: () => {} },
    })
  }
  return engineInstance
}

export function usePublicodesEngine() {
  /**
   * Évalue des règles cibles pour une situation donnée.
   * Retourne `null` si le moteur échoue (règles incompatibles, situation invalide) :
   * l'appelant peut alors dégrader l'affichage sans casser la page.
   */
  function evaluate(
    situation: Record<string, string | number>,
    targets: string[],
  ): Record<string, PublicodesResult> | null {
    try {
      const engine = getEngine()
      engine.setSituation(situation)
      return Object.fromEntries(targets.map((target) => {
        const node = engine.evaluate(target)
        return [target, {
          value: node.nodeValue,
          missingVariables: Object.keys(node.missingVariables ?? {}),
        } satisfies PublicodesResult]
      }))
    }
    catch {
      return null
    }
  }

  return { evaluate, rulesMeta: publicodesRulesMeta }
}
