export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const sourcePath = specifier.slice(2);
    const extension = sourcePath.includes(".") ? "" : ".ts";
    return nextResolve(new URL(`../src/${sourcePath}${extension}`, import.meta.url).href, context);
  }

  return nextResolve(specifier, context);
}
