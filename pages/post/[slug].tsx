import { FC, useCallback } from "react";
import type { Post } from "contracts";
import { getPosts } from "lib/posts";
import { slug } from "lib/utils";
import { GetStaticPaths, GetStaticProps } from "next";
import Header from "components/Header";
import { MDXRemote } from "next-mdx-remote";
import Head from "next/head";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/xcode.css";

interface Props {
  post: Post;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts();
  return {
    paths: posts.map((post) => ({
      params: { slug: slug(post) },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const post = (await getPosts()).find(
    (post) => slug(post) === context.params?.slug
  );

  return post === undefined ? { notFound: true } : { props: { post } };
};

const CustomPre: FC = ({ children }) => {
  const onCreate = useCallback((node: HTMLPreElement | null) => {
    if (node && node.firstChild)
      hljs.highlightElement(node.firstChild as HTMLElement);
  }, []);
  return <pre className="not-prose" ref={onCreate}>{children}</pre>;
};

const components = {
  pre: CustomPre,
};

const Post: FC<Props> = ({ post }) => {
  return (
    <>
      <Head>
        <title>
          {post.title} by {post.author} &mdash; erik.cat
        </title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.tags.join(", ")} />
      </Head>
      <article className="text-justify">
        <Header post={post} />
        <MDXRemote {...post.serialized} components={components} />
      </article>
    </>
  );
};

export default Post;
