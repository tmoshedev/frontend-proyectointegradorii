// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ErrorValidate = (props: { state: any }) => {
    return(
        props.state ? <div className="invalid-feedback">{props.state}</div> : null
    );
};

export default ErrorValidate;