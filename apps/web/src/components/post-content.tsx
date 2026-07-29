import browserCollections from "collections/browser";

import { useMDXComponents } from "#/components/mdx";

const postsClientLoader = browserCollections.posts.createClientLoader({
  component({ default: MDX }) {
    return <MDX components={useMDXComponents()} />;
  },
});

export function PostContent({ path }: { readonly path: string }) {
  return postsClientLoader.useContent(path);
}
