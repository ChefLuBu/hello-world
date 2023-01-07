import React from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { View, Platform, KeyboardAvoidingView, StyleSheet } from "react-native";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: this.props.route.params.color,
    };
  }

  componentDidMount() {
    let name = this.props.route.params.name;
    let color = this.props.route.params.color;
    this.props.navigation.setOptions({ title: name, backgroundColor: color });
    this.setState({
      messages: [
        {
          _id: 1,
          text: "Hello developer",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
          },
        },
      ],
    });
  }
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  render() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });
    return (
      <View style={styles.androidFix}>
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  androidFix: {
    flex: 1,
  },
})
