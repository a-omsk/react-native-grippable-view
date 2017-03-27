# react-native-grippable-view

Simple grippable component for React Native, powered by Animated API and some RxJS stuff.

## API
```javascript
import React from 'react';
import { View, Image } from 'react-native'
import Grippable from 'react-native-grippable-view';

export default () => (
  <Grippable
    minHeight={30} // initial height of view
    maxHeight={400} // maximum expanded height of view
    initExpandHeight={200} // initial height of view to expand
    gripperStyles={{ height: 20 }} // styles for gripper component wrapper
    animationOptions={{ duration: 500 }} // additional options for animation
    getGripperComponent={() => <Image source={require('./gripper.png')} />} // the gripper component getter
  >
    <View>
      // some code
    </View>
  </Grippable>
)
```
