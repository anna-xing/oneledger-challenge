import React from 'react';

export default class Card extends React.Component {
    render() {
        return(
            <div class="card">
                <h2 class="card-title">{this.props.title}</h2>
            </div>
        );
    }
}
