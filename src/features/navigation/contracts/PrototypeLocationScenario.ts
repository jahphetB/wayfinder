import type { LocationProvider } from './LocationProvider'

export const prototypeLocationScenarios = [
  'expected',
  'uncertain-accuracy',
  'mismatched',
  'stale',
  'unavailable',
] as const

export type PrototypeLocationScenario =
  (typeof prototypeLocationScenarios)[number]

export function isPrototypeLocationScenario(
  value: string,
): value is PrototypeLocationScenario {
  return prototypeLocationScenarios.includes(value as PrototypeLocationScenario)
}

export interface PrototypeLocationScenarioController {
  readonly scenario: PrototypeLocationScenario
  setScenario(scenario: PrototypeLocationScenario): void
}

export function getPrototypeLocationScenarioController(
  provider: LocationProvider,
): PrototypeLocationScenarioController | undefined {
  if (
    'setScenario' in provider &&
    typeof provider.setScenario === 'function' &&
    'scenario' in provider
  ) {
    return provider as LocationProvider & PrototypeLocationScenarioController
  }

  return undefined
}
