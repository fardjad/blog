export const PostFooter = () => {
  return (
    <footer class="tw-mt-8 tw-bg-gray-800 tw-text-white tw-py-4 tw-px-6">
      <div class="tw-container tw-mx-auto tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between">
        <div>
          Written By{" "}
          <a
            href="https://www.fardjad.com"
            class="tw-mb-2 sm:tw-mb-0 sm:tw-mr-4"
          >
            Fardjad Davari
          </a>
        </div>
        <div class="tw-flex tw-flex-wrap tw-justify-center sm:tw-justify-start tw-mt-2 sm:tw-mt-0">
          <a
            href="https://github.com/fardjad/blog"
            class="tw-text-sm tw-text-gray-400 tw-mx-2 hover:tw-text-white"
          >
            Source Code
          </a>
        </div>
      </div>
    </footer>
  );
};
