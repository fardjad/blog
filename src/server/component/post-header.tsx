import { useContext } from "hono/jsx";
import { OpenGraphContext } from "./opengraph-context.tsx";
import { FormattedDate } from "./formatted-date.tsx";

export const PostHeader = (
  props: { gistHtmlUrl: string; publishDate: Date },
) => {
  const { image, title } = useContext(OpenGraphContext);
  return (
    <header class="tw-mb-4 tw-pb-4">
      <h1>{title}</h1>
      <div class="tw-flex tw-items-center tw-gap-4 tw-mt-4">
        <img class="tw-rounded-full tw-w-24 tw-h-24" src={image} />
        <p class="tw-m-0">
          Published on <FormattedDate date={props.publishDate} />
          <br />
          In <a href="/">Fardjad's Blog</a>
          <br />
          <a href={props.gistHtmlUrl}>Comments and Reactions</a>
        </p>
      </div>
    </header>
  );
};
