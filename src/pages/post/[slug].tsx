import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  navigation: {
    prevPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
  preview: boolean;
}

export default function Post({ post, navigation }: PostProps): JSX.Element {

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;
    // console.log(totalWords);
    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));
    return total;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const formatedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR
    }
  )

  return (
    <>
      <Head>
        <title>{`${post.data.title} | spacetraveling`}</title>
      </Head>
      <Header />
      <img src={post.data.banner.url} alt="imagem" className={styles.banner} />
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post.data.title}</h1>
            <ul>
              <li>
                <FiCalendar />
                {formatedDate}
              </li>
              <li>
                <FiUser />
                {post.data.author}
              </li>
              <li>
                <FiClock />
                {`${readTime} min`}
              </li>
            </ul>
          </div>

          {post.data.content.map(content => {
            return (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            )
          })}
        </div>

        <section className={`${styles.navigation} ${commonStyles.container}`}>
          {navigation?.prevPost.length > 0 && (
            <div>
              <h3>{navigation.prevPost[0].data.title}</h3>
              <Link href={`/post/${navigation.prevPost[0].uid}`}>
                <a>Post anterior</a>
              </Link>
            </div>
          )}

          {navigation?.nextPost.length > 0 && (
            <div>
              <h3>{navigation.nextPost[0].data.title}</h3>
              <Link href={`/post/${navigation.nextPost[0].uid}`}>
                <a>Próximo post</a>
              </Link>
            </div>
          )}
        </section>
      </main>

    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({
  params,
  // preview = false,
  // previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});


  // console.log(prismic);
  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]'
    }
  )
  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
    }
  )

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: RichText.asText(response.data.title),
      subtitle: RichText.asText(response.data.subtitle),
      author: RichText.asText(response.data.author),
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: RichText.asText(content.heading),          
          body: [...content.body],
        };
      })
    }
    
  }
  console.log(post)

  return {
    props: {
      post,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
    },
    revalidate : 1800,
  }
};