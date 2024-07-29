export const FormattedDate = (
  props: { date: Date; className?: string },
) => {
  return (
    <span class={props.className}>
      {props.date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </span>
  );
};
