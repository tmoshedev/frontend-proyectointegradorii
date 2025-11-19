export const MANDATORY_PERMISSION_SLUGS = ['home-index', 'change-password'];

export const getPermissionSlug = (entry: any): string | null => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const candidate =
    entry.name ??
    entry.permission ??
    entry.slug ??
    entry.code ??
    entry.permission_name ??
    entry?.attributes?.name ??
    entry?.attributes?.permission ??
    entry?.attributes?.slug;

  if (candidate === undefined || candidate === null) {
    return null;
  }

  const normalized = String(candidate).trim();
  return normalized ? normalized : null;
};

export const filterOptionalPermissions = (entries: any[]): any[] => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.filter((entry) => {
    const slug = getPermissionSlug(entry);
    return !slug || !MANDATORY_PERMISSION_SLUGS.includes(slug);
  });
};
