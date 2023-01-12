import React from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { View, Platform, KeyboardAvoidingView, StyleSheet } from "react-native";


const firebase = require("firebase");
require("firebase/firestore");


export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid:0, 
      user: {
        _id:'',
        name:'',
      }
    };

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyDGTxixvI7AZGvWfMwAXjYvx8ElOSZ7l2w",
        authDomain: "chatapp-afb82.firebaseapp.com",
        projectId: "chatapp-afb82",
        storageBucket: "chatapp-afb82.appspot.com",
        messagingSenderId: "111713639593",
      });
    }
    this.referenceChatMessages = firebase.firestore().collection("messages");
  }
 

  componentDidMount() {
    let name = this.props.route.params.name;     
      this.setState({
        messages: [
          {
            _id: 2,
            text: `${name} has entered the chat`,
            createdAt: new Date(),
            system: true,
          },
        ],
      });
    this.props.navigation.setOptions({ title: name });
      
      this.referenceChatMessagesUser = firebase.firestore().collection("messages");
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);

        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            await firebase.auth().signInAnonymously();
          }
          this.setState({
            uid: user.uid,
            messages: [],
            user: {
              _id: user.uid,
              name: name,
            },
          });
          this.unsubscribe = this.referenceChatMessages
          .orderBy('createdAt', 'desc')
          .onSnapshot(this.onCollectionUpdate);
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.authUnsubscribe();

  }


  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
      }
    );
  }


  addMessage = () => {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
    });
  };




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


  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
        },
      });
    });
    this.setState({
      messages,
    });
  };



  render() {
    let color = this.props.route.params.color;
    return (
      <View style={[{flex: 1}, {backgroundColor: color}]}>
      <GiftedChat
        renderBubble={this.renderBubble.bind(this)}
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: 1,
          _id: this.state.uid,
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




