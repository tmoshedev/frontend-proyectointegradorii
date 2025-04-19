/* eslint-disable @typescript-eslint/no-explicit-any */
export const ErrorBackend = (props: { errorsBackend: any; name: string }) => {
  return props.errorsBackend && props.errorsBackend[props.name] ? (
    <div className="invalid-feedback" style={{ display: 'block' }}>
      {props.errorsBackend[props.name].map((error: string, index: number) => (
        <p key={index}>{error}</p>
      ))}
    </div>
  ) : null;
};

export default ErrorBackend;
