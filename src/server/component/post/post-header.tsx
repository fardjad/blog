import { useContext } from "hono/jsx";
import { OpenGraphContext } from "../opengraph/opengraph-context.tsx";
import { FormattedDate } from "../formatted-date.tsx";
import { generateGravatarImageLink } from "../../../gravatar/avatar.ts";
import { authorEmail, blogTitle } from "../../../config/values.ts";

export const PostHeader = async (
  props: { gistHtmlUrl: string; publishDate: Date },
) => {
  const { title } = useContext(OpenGraphContext);
  const avatarUrl = await generateGravatarImageLink(authorEmail, 128);

  return (
    <header class="tw-mb-4 tw-pb-4">
      <h1>{title}</h1>
      <div class="tw-flex tw-items-center tw-gap-4 tw-mt-4">
        <img class="tw-rounded-full tw-w-24 tw-h-24" src={avatarUrl} />
        <p class="tw-m-0">
          Published on <FormattedDate date={props.publishDate} />
          <br />
          In <a href="/">{blogTitle}</a>
          <br />
          <a href={props.gistHtmlUrl}>Comments and Reactions</a>
        </p>
      </div>
    </header>
  );
};
