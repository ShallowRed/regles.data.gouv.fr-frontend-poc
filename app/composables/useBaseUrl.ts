export function useBaseUrl() {
  const { app: appConfig } = useRuntimeConfig()

  const withBaseURL = (assetPath: string) => `${appConfig.baseURL}${assetPath.replace(/^\/+/, '')}`

  return {
    withBaseURL,
  }
}
