export default interface Scene {
  init (): boolean;
  update (): boolean;
  render (): boolean;
}