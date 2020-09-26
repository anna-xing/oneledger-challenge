import React from 'react';

export default class Card extends React.Component {
    render() {
        return(
            <div className="card">
                <h2 className="card-title">{this.props.title}</h2>
            </div>
        );
    }
}
