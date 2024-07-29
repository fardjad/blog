import type { PropsWithChildren } from "hono/jsx";

export const ShowIf = (
  { condition, children }: PropsWithChildren<{ condition: boolean }>,
) => {
  if (condition) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <>
      {null}
    </>
  );
};
