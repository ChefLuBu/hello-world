import * as React from "react";
import { GiftedChat, InputToolbar, Bubble } from "react-native-gifted-chat";
import { View, Platform, KeyboardAvoidingView} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import CustomActions from "./CustomActions";
import  MapView  from "react-native-maps";
import { ActionSheetProvider } from '@expo/react-native-action-sheet';


const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        avatar: "",
        name: "",
      },
      loggedInText: 'Please wait, you are getting logged in',
      image: null,
      location: null,
      isConnected: false,
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

  async getMessages() {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  async saveMessages() {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(this.state.messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    this.referenceChatMessagesUser = firebase
      .firestore()
      .collection("messages");
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
        loggedInText: "",
      });
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        console.log("online");
        this.setState({ isConnected: true });
      } else {
        console.log("offline");
        this.setState({ isConnected: false });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.authUnsubscribe();
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
          avatar: data.user.avatar || "",
        },
        image: data.image || null,
        location:data.location|| null,
      });
    });
    this.setState({
      messages,
    });
  };

  addMessage = (message) => {
    console.log("from add message", message);
    this.referenceChatMessages.add({
      _id: message._id,
      createdAt: message.createdAt,
      text: message.text || "",
      user: message.user || "",
      uid: this.state.uid || undefined,
      image: message.image || null,
      location: message.location || null,
    });
  };

  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        const message = messages[0];
        this.saveMessages();
        this.addMessage(message);
      }
    );
  }

 renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#90c9f9',
          },
          left: {
            backgroundColor: '#fff',
          },
        }}
      />
    );
  }

  renderInputToolbar(props) {
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }


  renderCustomActions = (props) => <CustomActions {...props} />;

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    let color = this.props.route.params.color;
    return (
      <ActionSheetProvider>
      <View style={[{ flex: 1 }, { backgroundColor: color }]}>
        <GiftedChat
          messages={this.state.messages}
          isConnected={this.state.isConnected}
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={(props) => this.renderInputToolbar(props)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: this.state.uid,
            avatar: "https://placeimg.com/140/140/any",
          }}
          accessible={true}
          accessibilityLabel="Chat input field"
          accessibilityHint="Here you can enter the message. After entering the message, you can press send on the right."
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
      </ActionSheetProvider>
    );
  }
}
