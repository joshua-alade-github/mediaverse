interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishedAt?: string;
  updatedAt?: string;
  authors?: string[];
}

export function MetaTags({
  title,
  description,
  image,
  type = 'website',
  publishedAt,
  updatedAt,
  authors,
}: MetaTagsProps) {
  const siteTitle = `${title} | Mediaverse`;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {updatedAt && <meta property="article:modified_time" content={updatedAt} />}
      {authors?.map((author) => (
        <meta key={author} property="article:author" content={author} />
      ))}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      {image && <meta property="twitter:image" content={image} />}
    </>
  );
}