import { CachedMetadata } from "obsidian";

export function isKeyPresentInMetadata(
	metaData: CachedMetadata | null,
	key: string
) {
	const isKeyPresentInMetadata =
		metaData && metaData.frontmatter && key in metaData.frontmatter;

	return isKeyPresentInMetadata;
}

export function getValueOfFrontmatterKey(
	metaData: CachedMetadata | null,
	key: string
): string | null {
	if (metaData && metaData.frontmatter && key in metaData.frontmatter) {
		return metaData.frontmatter[key];
	}

	return null;
}
