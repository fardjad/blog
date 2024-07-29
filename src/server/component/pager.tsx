import type { PropsWithChildren } from "hono/jsx";

const baseClasses = new Set([
  "tw-px-4",
  "tw-py-2",
  "tw-bg-gray-700",
  "tw-text-white",
  "tw-rounded",
  "tw-transition",
  "tw-duration-300",
  "hover:tw-bg-gray-600",
]);

const enabledClasses = new Set([
  "hover:tw-bg-gray-600",
]);

const disabledClasses = new Set([
  "tw-opacity-50",
  "tw-cursor-not-allowed",
]);

const LinkButton = (
  props: PropsWithChildren<{ disabled: boolean; url: string }>,
) => {
  if (props.disabled) {
    return (
      <span
        class={[
          ...baseClasses,
          ...(props.disabled ? disabledClasses : enabledClasses),
        ].join(" ")}
        aria-disabled={props.disabled}
      >
        {props.children}
      </span>
    );
  }

  return (
    <a
      href={props.url}
      class={[
        ...baseClasses,
        ...(props.disabled ? disabledClasses : enabledClasses),
      ].join(" ")}
      aria-disabled={props.disabled}
    >
      {props.children}
    </a>
  );
};

export const Pager = (
  props: PropsWithChildren<
    {
      currentPage: number;
      totalPages: number;
      pageUrl: string;
      pageParameterName?: "page";
      pageSizeParameterName?: "page_size";
    }
  >,
) => {
  const normalizedProps = {
    pageParameterName: "page",
    pageSizeParameterName: "page_size",
    ...props,
  };

  const hasPrevious = normalizedProps.currentPage > 0;
  const hasNext = normalizedProps.currentPage < normalizedProps.totalPages - 1;

  const nextPageUrl = new URL(normalizedProps.pageUrl);
  nextPageUrl.searchParams.set(
    normalizedProps.pageParameterName,
    (normalizedProps.currentPage + 1).toString(),
  );

  const previousPageUrl = new URL(normalizedProps.pageUrl);
  previousPageUrl.searchParams.set(
    normalizedProps.pageParameterName,
    (normalizedProps.currentPage - 1).toString(),
  );

  return (
    <div class="tw-mt-4 tw-flex tw-items-center">
      <LinkButton
        disabled={!hasPrevious}
        url={previousPageUrl.toString()}
      >
        Newer
      </LinkButton>
      <span class="tw-text-gray-500 tw-mx-4">
        Page {normalizedProps.currentPage + 1} of{"  "}
        {normalizedProps.totalPages}
      </span>
      <LinkButton disabled={!hasNext} url={nextPageUrl.toString()}>
        Older
      </LinkButton>
    </div>
  );
};
