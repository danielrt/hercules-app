import { IonRippleEffect, 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon,
  IonList,
  IonListHeader,
  IonLabel
 } from '@ionic/react';
import { logOutOutline, 
  micCircleOutline 
} from 'ionicons/icons';
import { getUser, logout } from '../helpers/Utils'
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import HistoryItem from '../components/HistoryItem';
import { useState, useEffect } from 'react';
import { HerculesOpenAI } from '../hercules_modules/HerculesOpenAI';
import './Home.css';
import { useHistory } from 'react-router-dom';

const Home = ({onLogin}) => {

  var isPressed = false;

  const herculesAI = new HerculesOpenAI();

  const [historyItens, setHistoryItens] = useState([]);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [transcript, setTranscript] = useState("");
  var userName = "";

  const history = useHistory();

  SpeechRecognition.requestPermissions();

  const getSupportedVoices = async () => {
    const voices = await TextToSpeech.getSupportedVoices();
    console.log(voices);
  };

  getSupportedVoices();

  function doLogout() {
    logout();
    onLogin(false);
    history.push('/');

  }

  useEffect(() => {
    const sayHello = async () => {
        var user = await getUser();
        var welcomeMsg = "Olá ".concat(user, "! Meu nome é Hércules. O que você gostaria que eu executasse?");
        setTextToSpeech(welcomeMsg);
    };
    sayHello();
    console.log("say hello");
  }, []);

  useEffect(() => {
    if(textToSpeech !== "") {
      TextToSpeech.speak({
        text: textToSpeech,
        lang: 'pt-BR',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',
      });
      var historyItem = {
        msg : textToSpeech,
        userName : "Hercules",
        date : new Date()
      };

      var newHistoryItens = [historyItem].concat(historyItens);
      setHistoryItens(newHistoryItens);
    }

  }, [textToSpeech]);

  useEffect(() => {
    if(transcript !== "") {
      var historyItem = {
        msg : transcript,
        userName : 'Daniel',
        date : new Date()
      };

      var newHistoryItens = [historyItem].concat(historyItens);
      setHistoryItens(newHistoryItens);
    }
  }, [transcript]);

  async function startListening() {
    isPressed = true;
    console.log("start listening");
    var isAvailable = await SpeechRecognition.available();
    if(isAvailable.available) {
      console.log("SpeechRecognition is available");

      var transcribedText = "";
      while(isPressed) {
        try {
          var result = await SpeechRecognition.start({
            language: "pt-BR",
            partialResults: false,
            popup: false,
          });

          if(result.matches.length > 0) {
            transcribedText = transcribedText.concat(" ", result.matches[0]);
            console.log("transcribedText = ".concat(transcribedText));
            console.log(isPressed);
          }
        }
        catch(e) {
          var cantUnderstandMsg = "Infelizmente eu não consegui compreender o que você falou. Poderia repetir novamente?";
          setTextToSpeech(cantUnderstandMsg);
          isPressed = false;
          return;
        }
      }
      setTranscript(transcribedText);
      var herculesAnswer = await herculesAI.askHercules(transcribedText);
      setTextToSpeech(herculesAnswer);
      console.log("transcribedText = ".concat(transcribedText));
      console.log("herculesAnswer = ".concat(herculesAnswer));
    }
    else {
      console.log("SpeechRecognition is not available");
    }
  }

  function stopListening() {
    console.log("stop listening");
    //SpeechRecognition.stop();
    isPressed = false;
  }


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>HÉRCULES</IonTitle>
          <IonButtons slot="primary">
            <IonButton onClick={doLogout}>
              <IonIcon slot="icon-only" icon={logOutOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonListHeader>
            <IonLabel>Histórico de Interação</IonLabel>
          </IonListHeader>
          {historyItens && historyItens.map((item) => (
                <HistoryItem item={item} key={item.date.getTime()} />
            ))}
      </IonList>
      </IonContent>
        <IonButton shape="round" fill="clear" className="ion-activatable" onTouchStart={startListening} onTouchEnd={stopListening}>
              <IonIcon className='mic-icon' slot="icon-only" icon={micCircleOutline}></IonIcon>
              <IonRippleEffect></IonRippleEffect>
        </IonButton>
        <div style={{ display : "none" }}>{textToSpeech}</div>
    </IonPage>
  );
};

export default Home;
