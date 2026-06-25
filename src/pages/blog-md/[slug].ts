import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.id.replace(/\.[^.]+$/, '') },
    props: { post },
  }));
}

export async function GET({ props: { post } }: { props: { post: any } }) {
  const { data, body } = post;
  const frontmatter = [
    '---',
    `title: "${data.title}"`,
    `description: "${data.description}"`,
    `pubDate: "${data.pubDate.toISOString().split('T')[0]}"`,
    `tags: [${data.tags.map((t: string) => `"${t}"`).join(', ')}]`,
    '---',
    '',
  ].join('\n');

  return new Response(frontmatter + (body ?? ''), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
