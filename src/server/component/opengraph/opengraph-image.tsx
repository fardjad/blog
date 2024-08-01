type Props = {
  title: string;
  description: string;
  gravatarUrl: string;
  name: string;
};

export const OpenGraphImage = (
  { title, description, gravatarUrl, name }: Props,
) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        padding: "2em",
        fontFamily: "Roboto",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          padding: "5em",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                marginBottom: "1em",
                marginRight: "2em",
                color: "#444",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 500,
                color: "#777",
              }}
            >
              {description}
            </div>
          </div>
          <img
            src={gravatarUrl}
            style={{
              width: "128px",
              height: "128px",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      <div
        style={{
          alignSelf: "flex-end",
          fontSize: "24px",
          fontWeight: 500,
          color: "#777",
        }}
      >
        {name}
      </div>
    </div>
  );
};
