// @flow

import React, { Component } from 'react';
import { View, PanResponder, Animated } from 'react-native';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/buffer';

import { Subject } from 'rxjs/Subject';

import last from 'lodash.last';

type Props = {
    minHeight: number,
    maxHeight: number,
    initExpandHeight: number,
    children?: any,
    styles?:Object,
    gripperStyles?: Object,
    animationOptions? : Object,
    getGripperComponent(): any
}

type State = {
    height: number,
    animatedHeight: Animated.Value
}

export default class GrippableView extends Component {
    props:Props;
    state:State;
    _panResponder:Object;
    _moveSubject:Subject<number>;
    _releaseSubject:Subject<any>;
    _moveSubscription:Object;
    _forwardSubscription:Object;
    _backwardSubscription:Object;

    static defaultProps = {
        getGripperComponent: () => null,
        animationOptions: {}
    };

    constructor(props:Props) {
        super(props);

        this._moveSubject = new Subject();
        this._releaseSubject = new Subject();

        this.state = {
            height: props.minHeight,
            animatedHeight: new Animated.Value(props.minHeight)
        };

        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderMove: (evt, gestureState) => this._moveSubject.next(gestureState.dy),
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: () => this._releaseSubject.next()
        });

        const source = this._moveSubject
            .map(x => Math.ceil(x) + this.state.height)
            .filter(x => (x >= this.props.minHeight) && (x <= this.props.maxHeight))
            .distinctUntilChanged();

        const [forward, backward] = source
            .buffer(this._releaseSubject)
            .filter(buffer => buffer.length > 0)
            .partition(values => last(values) >= this.props.initExpandHeight && last(values) > values[values.length - 2]);

        this._moveSubscription = source
            .subscribe(x => this.state.animatedHeight.setValue(x));

        this._forwardSubscription = forward
            .subscribe(() => this.spring(this.props.maxHeight));

        this._backwardSubscription = backward
            .subscribe(() => this.spring(this.props.minHeight));
    }

    componentWillUnmount() {
        this._moveSubscription.unsubscribe();
        this._forwardSubscription.unsubscribe();
        this._backwardSubscription.unsubscribe();
    }

    spring(toValue:number) {
        Animated.spring(this.state.animatedHeight, { toValue, ...this.props.animationOptions })
            .start(() =>
                this.setState({ height: toValue }));
    }

    render() {
        const { styles, gripperStyles, children } = this.props;

        return (
            <Animated.View
                style={[styles, {
                    height: this.state.animatedHeight,
                    overflow: 'hidden',
                    justifyContent: 'flex-end'
                }]}
                {...this._panResponder.panHandlers}
            >
                {children}
                <View style={gripperStyles}>
                    {this.props.getGripperComponent()}
                </View>
            </Animated.View>
        );
    }
}
