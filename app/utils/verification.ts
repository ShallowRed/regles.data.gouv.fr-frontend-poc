/**
 * Lecture des assertions EARL produites par `pnpm verify:rules` (app/data/verification.json,
 * ADR-0006). Le registre y affirme, à une date, le résultat de chaque cas rejoué et de chaque
 * contrôle de dérive fiche/API. Le fichier est produit par le script, jamais édité à la main.
 */
import verificationData from '~/data/verification.json'

export interface EarlAssertion {
  'earl:subject': { id: string }
  'earl:test': { 'id': string, 'dct:identifier': string, 'dct:title'?: string }
  'earl:result': {
    'earl:outcome': 'earl:passed' | 'earl:failed' | 'earl:cantTell' | 'earl:inapplicable' | 'earl:untested'
    'dct:date': string
    'dct:description'?: string
    'earl:info'?: string
  }
}

const assertions = (verificationData['@graph'] ?? []) as EarlAssertion[]

/** Date du dernier passage du registre. */
export const verificationDate: string = verificationData['dct:date']

/** Assertion d'un cas de test, par identifiant du cas. */
export function assertionForTest(testId: string): EarlAssertion | undefined {
  return assertions.find(a => a['earl:test']['dct:identifier'] === testId)
}

/** Assertion du contrôle de dérive fiche/API d'une règle. */
export function apiParametersAssertion(ruleId: string): EarlAssertion | undefined {
  return assertions.find(a => a['earl:test']['dct:identifier'] === `${ruleId}:api-parameters`)
}

export const passed = (a: EarlAssertion | undefined): boolean => a?.['earl:result']['earl:outcome'] === 'earl:passed'

/**
 * Bilan des cas d'une règle exécutés par le registre : ce qui établit le badge « résultats
 * testés » et le niveau « vérifiée » (ADR-0003).
 */
export function testAssertionsFor(testIds: string[]): { total: number, passing: number, failing: number } {
  const found = testIds.map(assertionForTest).filter((a): a is EarlAssertion => a !== undefined)
  const passing = found.filter(passed).length
  return { total: found.length, passing, failing: found.length - passing }
}
