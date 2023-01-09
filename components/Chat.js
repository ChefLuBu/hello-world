import React from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { View, Platform, KeyboardAvoidingView, StyleSheet } from "react-native";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    };
  }

  componentDidMount() {
    let name = this.props.route.params.name;
    this.setState({
      messages: [
        {
          _id: 1,
          text: "Welcome to the chat!",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
            
          },
        },
        {
          _id: 3,
          text: "Howdy, Partner",
          createdAt: new Date(),
          user: {
            _id: 4,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
            
          },
        },
      ],
    });
  }

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          },
          left:{
            backgroundcolor: "#111"
          }
        }}
      />
    )
  }


  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  render() {
    let color = this.props.route.params.color;
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });
    return (
      <View style={[{flex: 1}, {backgroundColor: color}]}>
      <GiftedChat
        renderBubble={this.renderBubble.bind(this)}
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
        _id: 1
        }}
        accessible={true}
        accessibilityLabel='Chat input field'
        accessibilityHint='Here you can enter the message. After entering the message, you can press send on the right.'
      />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// })
