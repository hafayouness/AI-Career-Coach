export const Spinner = ({ dark = false }: { dark?: boolean }) => (
  <span className={`spinner ${dark ? "spinner--dark" : ""}`} />
);
