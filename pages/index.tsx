import type { Post } from "contracts";
import type { NextPage, GetStaticProps } from "next";
import { getPosts } from "lib/posts";
import { SmallHeader } from "components/Header";
import Head from "next/head";
import { slug } from "lib/utils";
import Image from "next/image";
interface Props {
  posts: Post[];
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  return {
    props: {
      posts: await getPosts(),
    },
  };
};

const Home: NextPage<Props> = ({ posts }) => {
  return (
    <>
      <Head>
        <title>Èrik C. Forés &mdash; ICT Systems Engineer</title>
        <meta
          name="description"
          content="A personal blog where you can find all my posts about computer science and programming languages in general."
        />
      </Head>
      <div className="flex items-center justify-center my-12 space-x-6">
        <Image
          className="rounded-full"
          height={75}
          width={75}
          alt="Avatar"
          src="https://avatars.githubusercontent.com/u/6124435?v=4"
          priority
        />
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="text-2xl">Èrik C. Forés</div>
          <div className="text-xs text-gray-500">ICT Systems Engineer</div>
        </div>
      </div>
      <div className="flex flex-col my-12 space-y-12">
        {posts.map((post) => (
          <SmallHeader key={slug(post)} post={post} />
        ))}
      </div>
    </>
  );
};

export default Home;
