/** Version de l'application, lue dans package.json au build. */
declare const __APP_VERSION__: string

declare module 'virtual:licenses' {
  const licenses: import('../../scripts/licenses').ThirdPartyLicense[]
  export default licenses
}
