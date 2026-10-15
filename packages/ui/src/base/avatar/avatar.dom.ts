import type { AvatarOptions } from "./avatar.machine";

/** Every request owns its listeners; callbacks from disposed requests are ignored. */
export function loadAvatar(options: AvatarOptions, done: (loaded: boolean) => void) {
  const image = new Image();
  let active = true;
  const finish = (loaded: boolean) => {
    if (active) {
      active = false;
      done(loaded);
    }
  };
  image.onload = () => finish(true);
  image.onerror = () => finish(false);
  if (options.crossOrigin !== undefined) image.crossOrigin = options.crossOrigin;
  if (options.referrerPolicy !== undefined) image.referrerPolicy = options.referrerPolicy;
  image.src = options.src!;
  if (image.complete) finish(image.naturalWidth > 0);
  return () => {
    active = false;
    image.onload = null;
    image.onerror = null;
  };
}
