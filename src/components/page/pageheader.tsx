import React, { FC, Fragment } from 'react';

interface PageheaderProps {
    title: string;
    heading: string;
    active: string;
}

const Pageheader: FC<PageheaderProps> = ({ title, heading, active }) => {
    return (
        <Fragment>
            <div className="page-header">
                <h1 className="page-title">{title}</h1>
                <div>
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="#">{heading}</a></li>
                        <li className="breadcrumb-item active" aria-current="page">{active}</li>
                    </ol>
                </div>
            </div>
        </Fragment>
    );
};

export default Pageheader;
