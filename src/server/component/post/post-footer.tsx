import {
  authorName,
  sourceCodeUrl,
  websiteUrl,
} from "../../../config/values.ts";

export const PostFooter = () => {
  return (
    <footer class="tw:mt-8 tw:bg-gray-800 tw:text-white tw:py-4 tw:px-6">
      <div class="tw:container tw:mx-auto tw:flex tw:flex-col tw:sm:flex-row tw:items-center tw:justify-between">
        <div>
          Written By{" "}
          <a
            href={websiteUrl}
            class="tw:mb-2 tw:sm:mb-0 tw:sm:mr-4"
          >
            {authorName}
          </a>
        </div>
        <div class="tw:flex tw:flex-wrap tw:justify-center tw:sm:justify-start tw:mt-2 tw:sm:mt-0">
          <a
            href={sourceCodeUrl}
            class="tw:text-sm tw:text-gray-400 tw:mx-2 tw:hover:text-white"
          >
            Source Code
          </a>
        </div>
      </div>
    </footer>
  );
};
